import { useState } from 'react';

export const useAuth = (repoConfig) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordSubmit = (password) => {
    if (!repoConfig) return;
    
    if (password === repoConfig.password) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Contraseña incorrecta');
    }
  };

  return {
    isAuthenticated,
    handlePasswordSubmit,
    passwordError
  };
};