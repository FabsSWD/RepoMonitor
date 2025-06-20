import { useState, useCallback } from 'react';
import { fetchReadme, fetchLatestRelease } from '../utils/github-api';

export const useRepoData = (repoConfig, isAuthenticated) => {
  const [repoData, setRepoData] = useState(null);
  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRepoData = useCallback(async () => {
    if (!repoConfig || !isAuthenticated) return;
    
    setLoading(true);
    setError('');

    try {
      const [version, readmeContent] = await Promise.all([
        fetchLatestRelease(repoConfig),
        fetchReadme(repoConfig)
      ]);
      
      setRepoData({
        name: `${repoConfig.owner}/${repoConfig.repo}`,
        currentVersion: version,
        url: `https://github.com/${repoConfig.owner}/${repoConfig.repo}`,
        frameworkPath: repoConfig.frameworkPath,
        trelloUrl: repoConfig.trelloUrl || ''
      });

      setReadme(readmeContent);
    } catch (err) {
      setError('Error al cargar los datos del repositorio');
      console.error('Error loading repo data:', err);
    } finally {
      setLoading(false);
    }
  }, [repoConfig, isAuthenticated]);

  return {
    repoData,
    readme,
    loading,
    error,
    loadRepoData
  };
};