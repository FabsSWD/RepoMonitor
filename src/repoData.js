const repositories = {
  react: {
    owner: 'facebook',
    repo: 'react',
    password: import.meta.env.VITE_PASSWORD_REACT || 'defaultPass123!',
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    frameworkPath: 'react',
    trelloUrl: import.meta.env.VITE_TRELLO_URL_REACT || ''
  },
  
  vue: {
    owner: 'vuejs',
    repo: 'core',
    password: import.meta.env.VITE_PASSWORD_VUE || 'defaultPass456!',
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    frameworkPath: 'vue',
    trelloUrl: import.meta.env.VITE_TRELLO_URL_VUE || ''
  },
  
  angular: {
    owner: 'angular',
    repo: 'angular',
    password: import.meta.env.VITE_PASSWORD_ANGULAR || 'defaultPass789!',
    token: import.meta.env.VITE_GITHUB_TOKEN || '',
    frameworkPath: 'angular',
    trelloUrl: import.meta.env.VITE_TRELLO_URL_ANGULAR || ''
  },

};

export const getCurrentRepoConfig = () => {
  const path = window.location.pathname.replace(/^\/projects/, '');
  const matches = path.match(/^\/([^/]+)/);
  
  if (matches && matches[1]) {
    const urlPath = matches[1];
    // eslint-disable-next-line no-unused-vars
    const repoEntry = Object.entries(repositories).find(([key, repo]) => 
      repo.frameworkPath === urlPath
    );
    return repoEntry ? repoEntry[1] : null;
  }
  
  return null;
};