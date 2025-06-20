const repositories = {
  react: {
    owner: 'facebook',
    repo: 'react',
    password: import.meta.env.VITE_PASSWORD_REACT || 'defaultPass123!',
    token: '',
    frameworkPath: 'react',
    trelloUrl: import.meta.env.VITE_TRELLO_URL_REACT || ''
  },
  
  vue: {
    owner: 'vuejs',
    repo: 'core',
    password: import.meta.env.VITE_PASSWORD_VUE || 'defaultPass456!',
    token: '',
    frameworkPath: 'vue',
    trelloUrl: import.meta.env.VITE_TRELLO_URL_VUE || ''
  },
  
  angular: {
    owner: 'angular',
    repo: 'angular',
    password: import.meta.env.VITE_PASSWORD_ANGULAR || 'defaultPass789!',
    token: '',
    frameworkPath: 'angular',
    trelloUrl: import.meta.env.VITE_TRELLO_URL_ANGULAR || ''
  },
};

export const getCurrentRepoConfig = () => {
  const path = window.location.pathname.replace(/^\/projects/, '');
  const matches = path.match(/^\/([^/]+)/);

  
  if (matches && matches[1]) {
    const repoName = matches[1];
    return repositories[repoName] || null;
  }
  
  return null;
};