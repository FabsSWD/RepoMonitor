import React, { useEffect, Suspense } from 'react';
import { getCurrentRepoConfig } from '../repoData';
import AuthScreen from '../components/Screens/AuthScreen';
import LoadingScreen from '../components/Screens/LoadingScreen';
import ErrorDisplay from '../components/Display/ErrorDisplay';
import RepoHeader from '../components/RepoHeader';
import VersionDisplay from '../components/Display/VersionDisplay';
import TrelloButton from '../components/Buttons/TrelloButton';
import ActivityFeed from '../components/Activities/ActivityFeed';
import { useAuth } from '../hooks/useAuth';
import { useRepoData } from '../hooks/useRepoData';
import { useGitHubEvents } from '../hooks/useGitHubEvents';

const ReadmeSection = React.lazy(() => import('../components/ReadmeSection'));

const GitHubRepoMonitor = () => {
  const repoConfig = getCurrentRepoConfig();
  const { isAuthenticated, handlePasswordSubmit, passwordError } = useAuth(repoConfig);
  const { repoData, readme, loading, error, loadRepoData } = useRepoData(repoConfig, isAuthenticated);
  const { events, fetchRepoEvents } = useGitHubEvents(repoConfig, isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      loadRepoData();
    }
  }, [isAuthenticated, loadRepoData]);

  if (!repoConfig) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center p-4 sm:p-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">Repositorio no configurado</h1>
          <p className="text-gray-400 text-sm sm:text-base">Este repositorio no está disponible.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen 
        onPasswordSubmit={handlePasswordSubmit}
        passwordError={passwordError}
        frameworkPath={repoConfig.frameworkPath}
      />
    );
  }

  if (loading) {
    return <LoadingScreen message="Cargando datos del repositorio..." />;
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {error && <ErrorDisplay error={error} />}

        {repoData && (
          <>
            <RepoHeader repoData={repoData} />
            <VersionDisplay version={repoData.currentVersion} />
            {repoData.trelloUrl && <TrelloButton url={repoData.trelloUrl} />}
            <Suspense fallback={<LoadingScreen message="Cargando README..." />}>
              <ReadmeSection readme={readme} />
            </Suspense>
            <ActivityFeed 
              events={events} 
              onRefresh={fetchRepoEvents}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoMonitor;