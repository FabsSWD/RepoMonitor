// RepoData.js

const repositories = {
  react: {
    owner: 'facebook',
    repo: 'react',
    password: import.meta.env.VITE_PASSWORD_REACT || 'defaultPass123!',
    token: import.meta.env.VITE_GITHUB_TOKEN_REACT || '',
    frameworkPath: import.meta.env.VITE_PATH_REACT || 'frameworksoft.io/works/react'
  },
  
  vue: {
    owner: 'vuejs',
    repo: 'core',
    password: import.meta.env.VITE_PASSWORD_VUE || 'defaultPass456!',
    token: import.meta.env.VITE_GITHUB_TOKEN_VUE || '',
    frameworkPath: import.meta.env.VITE_PATH_VUE || 'frameworksoft.io/works/vue'
  },
  
  angular: {
    owner: 'angular',
    repo: 'angular',
    password: import.meta.env.VITE_PASSWORD_ANGULAR || 'defaultPass789!',
    token: import.meta.env.VITE_GITHUB_TOKEN_ANGULAR || '',
    frameworkPath: import.meta.env.VITE_PATH_ANGULAR || 'frameworksoft.io/works/angular'
  },
};

export const getCurrentRepoConfig = () => {
  const path = window.location.pathname;
  const matches = path.match(/\/works\/([^/]+)/);
  
  if (matches && matches[1]) {
    const repoName = matches[1];
    return repositories[repoName] || null;
  }
  
  return repositories.react;
};

export const getAllRepositories = () => {
  return Object.keys(repositories).map(key => ({
    id: key,
    ...repositories[key]
  }));
};

export const getRepoConfigByName = (name) => {
  return repositories[name] || null;
};

export default repositories;