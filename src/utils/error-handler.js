export class GitHubApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'GitHubApiError';
    this.statusCode = statusCode;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 403:
        throw new GitHubApiError('Límite de API excedido. Configura un token de GitHub.', 403);
      case 404:
        throw new GitHubApiError('Recurso no encontrado', 404);
      case 401:
        throw new GitHubApiError('No autorizado. Verifica tu token de acceso.', 401);
      default:
        throw new GitHubApiError(data.message || 'Error en la API de GitHub', status);
    }
  }
  
  throw error;
};