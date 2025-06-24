import { config } from './config';
import { GitHubApiError, handleApiError } from './error-handler';

const createHeaders = (repoConfig) => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (repoConfig?.token) {
    headers['Authorization'] = `Bearer ${repoConfig.token}`;
  }
  
  return headers;
};

export const fetchReadme = async (repoConfig) => {
  if (!repoConfig) {
    return 'Error: Configuración del repositorio no encontrada.';
  }

  try {
    const headers = {
      ...createHeaders(repoConfig),
      'Accept': 'application/vnd.github.v3.raw'
    };

    const response = await fetch(
      `${config.github.apiUrl}/repos/${repoConfig.owner}/${repoConfig.repo}/readme`,
      { headers }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return `# ${repoConfig.repo}\n\nRepositorio en desarrollo. README será añadido próximamente.`;
      }
      throw new GitHubApiError('No se pudo obtener el README', response.status);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return 'No se pudo cargar el README.';
    }
    return handleApiError(error);
  }
};

export const fetchLatestRelease = async (repoConfig) => {
  if (!repoConfig) {
    return 'v0.0.0';
  }

  try {
    const headers = createHeaders(repoConfig);

    const response = await fetch(
      `${config.github.apiUrl}/repos/${repoConfig.owner}/${repoConfig.repo}/releases/latest`,
      { headers }
    );

    if (response.status === 404) {
      const tagsResponse = await fetch(
        `${config.github.apiUrl}/repos/${repoConfig.owner}/${repoConfig.repo}/tags`,
        { headers }
      );
      
      if (tagsResponse.ok) {
        const tags = await tagsResponse.json();
        if (tags.length > 0) {
          return tags[0].name;
        }
      }
      
      return 'v0.1.0-dev';
    }

    if (!response.ok) {
      throw new GitHubApiError('No se pudo obtener la última release', response.status);
    }

    const data = await response.json();
    return data.tag_name || 'v0.0.0';
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return 'v0.0.0';
    }
    return handleApiError(error);
  }
};

export const fetchRepoEvents = async (repoConfig) => {
  if (!repoConfig) {
    throw new GitHubApiError('Configuración del repositorio no encontrada', 500);
  }

  const headers = createHeaders(repoConfig);

  const response = await fetch(
    `${config.github.apiUrl}/repos/${repoConfig.owner}/${repoConfig.repo}/events?per_page=30`,
    { headers }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new GitHubApiError('Límite de API excedido. Configura un token de GitHub.', 403);
    }
    throw new GitHubApiError('No se pudieron obtener los eventos', response.status);
  }

  const data = await response.json();
  
  const processedEvents = data
    .filter(event => event.type === 'PushEvent' || event.type === 'CreateEvent')
    .slice(0, config.ui.maxEvents)
    .map(event => {
      if (event.type === 'PushEvent') {
        const commit = event.payload.commits?.[0];
        return {
          id: event.id,
          type: 'push',
          branch: event.payload.ref?.replace('refs/heads/', '') || 'unknown',
          message: commit?.message || 'Sin mensaje',
          author: event.actor.login,
          timestamp: event.created_at,
          sha: commit?.sha?.substring(0, 7) || 'unknown',
          avatarUrl: event.actor.avatar_url
        };
      } else if (event.type === 'CreateEvent' && event.payload.ref_type === 'branch') {
        return {
          id: event.id,
          type: 'branch',
          branch: event.payload.ref,
          message: `Nueva rama creada: ${event.payload.ref}`,
          author: event.actor.login,
          timestamp: event.created_at,
          sha: 'N/A',
          avatarUrl: event.actor.avatar_url
        };
      }
      return null;
    })
    .filter(Boolean);

  if (processedEvents.length === 0) {
    return [{
      id: 'temp-activity',
      type: 'push',
      branch: 'development',
      message: 'Repositorio en desarrollo activo',
      author: repoConfig.owner,
      timestamp: new Date().toISOString(),
      sha: 'initial',
      avatarUrl: `https://avatars.githubusercontent.com/u/131935084?v=4`
    }];
  }
  
  return processedEvents;
};