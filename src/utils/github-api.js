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

    const eventsData = await response.json();

    const filtered = eventsData
      .filter(event => event.type === 'PushEvent' || event.type === 'CreateEvent' || event.type === 'PullRequestEvent')
      .slice(0, config.ui.maxEvents);

    // Collect SHAs and PR numbers that need separate fetches
    const commitSHAsToFetch = new Set();
    const prNumbersToFetch = new Set();

    filtered.forEach(event => {
      if (event.type === 'PushEvent') {
        const commit = event.payload.commits?.[0];
        // Use commit SHA if available, otherwise fall back to payload.head (HEAD after push)
        const sha = commit?.sha || event.payload.head;
        if (sha && !commit?.message) {
          commitSHAsToFetch.add(sha);
        }
      } else if (event.type === 'PullRequestEvent') {
        const prNumber = event.payload.pull_request?.number;
        if (prNumber && !event.payload.pull_request?.title) {
          prNumbersToFetch.add(prNumber);
        }
      }
    });

    // Fetch missing details in parallel
    const [commitResults, prResults] = await Promise.all([
      Promise.all([...commitSHAsToFetch].map(sha =>
        fetch(`${config.github.apiUrl}/repos/${repoConfig.owner}/${repoConfig.repo}/commits/${sha}`, { headers })
          .then(r => r.ok ? r.json() : null).catch(() => null)
      )),
      Promise.all([...prNumbersToFetch].map(num =>
        fetch(`${config.github.apiUrl}/repos/${repoConfig.owner}/${repoConfig.repo}/pulls/${num}`, { headers })
          .then(r => r.ok ? r.json() : null).catch(() => null)
      ))
    ]);

    const commitMap = {};
    [...commitSHAsToFetch].forEach((sha, i) => {
      if (commitResults[i]?.commit?.message) {
        commitMap[sha] = commitResults[i].commit.message.split('\n')[0].trim();
      }
    });

    const prMap = {};
    [...prNumbersToFetch].forEach((num, i) => {
      if (prResults[i]) prMap[num] = prResults[i];
    });

    return filtered.map(event => {
      if (event.type === 'PushEvent') {
        const commit = event.payload.commits?.[0];
        const sha = commit?.sha || event.payload.head;
        const message =
          commitMap[sha] ||
          commit?.message?.split('\n')[0].trim() ||
          'Sin mensaje';
        return {
          id: event.id,
          type: 'push',
          branch: event.payload.ref?.replace('refs/heads/', '') || 'unknown',
          message,
          author: event.actor.login,
          timestamp: event.created_at,
          sha: sha?.substring(0, 7) || 'unknown',
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
        const prPayload = event.payload.pull_request;
        const prNumber = prPayload?.number;
        const pr = prMap[prNumber] || prPayload;
        const action = event.payload.action;
        const isMerged = action === 'closed' && (pr?.merged || prPayload?.merged);
        const actionLabel = isMerged ? 'mergeado' : action === 'closed' ? 'cerrado' : action === 'reopened' ? 'reabierto' : 'abierto';
        return {
          id: event.id,
          type: 'pr',
          branch: pr?.base?.ref || 'unknown',
          message: pr?.title || 'Sin título',
          author: event.actor.login,
          timestamp: event.created_at,
          sha: `#${prNumber || 'N/A'}`,
          avatarUrl: event.actor.avatar_url,
          prAction: actionLabel,
          prUrl: pr?.html_url || prPayload?.html_url,
          sourceBranch: pr?.head?.ref || 'unknown',
          merged: isMerged
        };
      }
      return null;
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};