import React, { useState, useEffect, useCallback } from 'react';
import { GitBranch, GitCommit, GitPullRequest, ExternalLink, Lock, Unlock, ChevronDown, ChevronUp, Trello } from 'lucide-react';
import { getCurrentRepoConfig } from '../repoData';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const GitHubRepoMonitor = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repoData, setRepoData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [readme, setReadme] = useState('');
  const [showReadme, setShowReadme] = useState(false);
  const [loadingReadme, setLoadingReadme] = useState(false);
  
  const repoConfig = getCurrentRepoConfig();

  const fetchReadme = async () => {
    setLoadingReadme(true);
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3.raw'
      };
      
      if (repoConfig.token) {
        headers['Authorization'] = `Bearer ${repoConfig.token}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/readme`,
        { headers }
      );

      if (!response.ok) {
        throw new Error('No se pudo obtener el README');
      }

      const content = await response.text();
      setReadme(content);
    } catch (error) {
      console.error('Error fetching README:', error);
      setReadme('No se pudo cargar el README.');
    } finally {
      setLoadingReadme(false);
    }
  };

  const fetchLatestRelease = async () => {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (repoConfig.token) {
        headers['Authorization'] = `Bearer ${repoConfig.token}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/releases/latest`,
        { headers }
      );

      if (response.status === 404) {
        const tagsResponse = await fetch(
          `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/tags`,
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
        throw new Error('No se pudo obtener la última release');
      }

      const data = await response.json();
      return data.tag_name || 'v0.0.0';
    } catch (error) {
      console.error('Error fetching release:', error);
      return 'v0.0.0';
    }
  };

  const fetchRepoEvents = useCallback(async () => {
    if (!repoConfig) return;
    
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (repoConfig.token) {
        headers['Authorization'] = `Bearer ${repoConfig.token}`;
      }

      const response = await fetch(
        `https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/events?per_page=30`,
        { headers }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Límite de API excedido. Configura un token de GitHub.');
        }
        throw new Error('No se pudieron obtener los eventos');
      }

      const data = await response.json();
      
      const processedEvents = data
        .filter(event => event.type === 'PushEvent' || event.type === 'CreateEvent')
        .slice(0, 10)
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

      setEvents(processedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Error al cargar los eventos del repositorio');
    }
  }, [repoConfig]);

  const loadRepoData = async () => {
    setLoading(true);
    setError('');

    try {
      const version = await fetchLatestRelease();
      
      setRepoData({
        name: `${repoConfig.owner}/${repoConfig.repo}`,
        currentVersion: version,
        url: `https://github.com/${repoConfig.owner}/${repoConfig.repo}`,
        frameworkPath: repoConfig.frameworkPath,
        trelloUrl: repoConfig.trelloUrl || ''
      });

      await fetchRepoEvents();
      await fetchReadme();
    } catch {
      setError('Error al cargar los datos del repositorio');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === repoConfig.password) {
      setIsAuthenticated(true);
      setPasswordError('');
      loadRepoData();
    } else {
      setPasswordError('Contraseña incorrecta');
    }
  };

  const toggleReadme = () => {
    setShowReadme(!showReadme);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchRepoEvents();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchRepoEvents]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'justo ahora';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    return `hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'push':
        return <GitCommit className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'branch':
        return <GitBranch className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'pr':
        return <GitPullRequest className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <GitCommit className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'push':
        return 'bg-blue-500';
      case 'branch':
        return 'bg-green-500';
      case 'pr':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

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
      <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full mb-4">
              <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Acceso Restringido</h1>
            <p className="text-gray-400 text-sm sm:text-base px-4">Ingresa la contraseña para acceder al monitor del repositorio</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">{repoConfig.frameworkPath}</p>
          </div>
          
          <div className="space-y-4 px-4 sm:px-0">
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordSubmit(e);
                  }
                }}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 transition-all text-sm sm:text-base"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-500 text-xs sm:text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <button
              onClick={handlePasswordSubmit}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all text-sm sm:text-base"
            >
              <span className="flex items-center justify-center gap-2">
                <Unlock className="w-4 h-4 sm:w-5 sm:h-5" />
                Acceder
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Cargando datos del repositorio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm sm:text-base">
            {error}
          </div>
        )}

        {repoData && (
          <>
            <div className="text-center mb-8 sm:mb-12">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-400 mb-2">{repoData.name}</h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <span className="text-gray-500">{repoData.frameworkPath}</span>
                <a 
                  href={repoData.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  Ver en GitHub
                </a>
              </div>
            </div>

            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-block">
                <div className="text-5xl sm:text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
                  {repoData.currentVersion}
                </div>
                <p className="text-gray-400 mt-2 sm:mt-4 text-sm sm:text-base">Versión Actual</p>
              </div>
            </div>

            {/* Botón de Trello */}
            {repoData.trelloUrl && (
              <div className="text-center mb-8">
                <a
                  href={repoData.trelloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  <Trello className="w-5 h-5" />
                  Abrir Tablero de Trello
                </a>
              </div>
            )}

            {/* README desplegable */}
            <div className="mb-12">
              <button
                onClick={toggleReadme}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
              >
                <span className="text-lg font-semibold">README.md</span>
                {showReadme ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              {showReadme && (
                <div className="mt-4 p-6 bg-gray-800 rounded-lg overflow-x-auto">
                  {loadingReadme ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                      prose-headings:text-gray-200 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                      prose-p:text-gray-300 prose-p:leading-relaxed
                      prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-gray-100
                      prose-code:text-pink-400 prose-code:bg-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                      prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700
                      prose-blockquote:border-l-4 prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic
                      prose-ul:text-gray-300 prose-ol:text-gray-300
                      prose-li:marker:text-gray-500
                      prose-hr:border-gray-700
                      prose-table:border-collapse prose-th:border prose-th:border-gray-700 prose-th:px-3 prose-th:py-2
                      prose-td:border prose-td:border-gray-700 prose-td:px-3 prose-td:py-2">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Personalización adicional de componentes si es necesario
                          code({inline, className, children, ...props}) {
                            const match = /language-(\w+)/.exec(className || '');
                            return !inline && match ? (
                              <pre className="overflow-x-auto">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            ) : (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {readme}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Actividad Reciente</h2>
                <button
                  onClick={fetchRepoEvents}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-all"
                >
                  Actualizar
                </button>
              </div>
              
              {events.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
                  No hay actividad reciente en el repositorio
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {events.map((event, index) => (
                      <div
                        key={event.id}
                        className={`relative flex items-start gap-3 sm:gap-4 animate-slideUp`}
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          opacity: 0,
                          animationFillMode: 'forwards'
                        }}
                      >
                        <div className="relative flex-shrink-0">
                          <img 
                            src={event.avatarUrl} 
                            alt={event.author}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-700"
                            loading="lazy"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white shadow-lg`}>
                            {getEventIcon(event.type)}
                          </div>
                        </div>
                        
                        <div className="flex-1 bg-gray-800 rounded-lg p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                            <div>
                              <span className="text-xs sm:text-sm font-semibold text-gray-300">
                                {event.type === 'branch' ? 'Nueva rama: ' : 'Push a '}
                                <span className="text-blue-400">{event.branch}</span>
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</span>
                          </div>
                          <p className="text-white mb-2 break-words text-sm sm:text-base">{event.message}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-gray-400">
                            <span>Por: @{event.author}</span>
                            {event.sha !== 'N/A' && <span className="hidden sm:inline">SHA: {event.sha}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GitHubRepoMonitor;