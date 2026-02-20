import { config } from './config';
import { GitHubApiError, handleApiError } from './error-handler';

const createHeaders = (repoConfig) => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (repoConfig.token) {
    headers['Authorization'] = `Bearer ${repoConfig.token}`;
  }
  
  return headers;
};

export const fetchReadme = async (repoConfig) => {
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
      return 'v0.0.0';
    }

    if (!response.ok) {
      throw new GitHubApiError('No se pudo obtener la última release', response.status);
    }

    const data = await response.json();
    return data.tag_name || 'v0.0.0';
  } catch (error) {
    if (error instanceof GitHubApiError) {
      console.error('Error fetching release:', error);
      return 'v0.0.0';
    }
    return handleApiError(error);
  }
};

export const fetchRepoEvents = async (repoConfig) => {
  try {
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
    
    return data
      .filter(event => event.type === 'PushEvent' || event.type === 'CreateEvent' || event.type === 'PullRequestEvent')
      .slice(0, config.ui.maxEvents)
      .map(event => {
        if (event.type === 'PushEvent') {
          const commit = event.payload.commits?.[0];
          return {
            id: event.id,
            type: 'push',
            branch: event.payload.ref?.replace('refs/heads/', '') || 'unknown',
            message: commit?.message?.split('\n')[0].trim() || 'Sin mensaje',
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
        } else if (event.type === 'PullRequestEvent') {
          const pr = event.payload.pull_request;
          const action = event.payload.action;
          const isMerged = action === 'closed' && pr.merged;
          const actionLabel = isMerged ? 'mergeado' : action === 'closed' ? 'cerrado' : action === 'reopened' ? 'reabierto' : 'abierto';
          return {
            id: event.id,
            type: 'pr',
            branch: pr.base?.ref || 'unknown',
            message: pr.title || 'Sin título',
            author: event.actor.login,
            timestamp: event.created_at,
            sha: `#${pr.number}`,
            avatarUrl: event.actor.avatar_url,
            prAction: actionLabel,
            prUrl: pr.html_url,
            sourceBranch: pr.head?.ref || 'unknown',
            merged: isMerged
          };
        }
        return null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};