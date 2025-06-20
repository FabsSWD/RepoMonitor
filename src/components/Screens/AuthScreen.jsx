import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

const AuthScreen = ({ onPasswordSubmit, passwordError, frameworkPath }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onPasswordSubmit(password);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full mb-4">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Acceso Restringido</h1>
          <p className="text-gray-400 text-sm sm:text-base px-4">
            Ingresa la contraseña para acceder al monitor del repositorio
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">{frameworkPath}</p>
        </div>
        
        <div className="space-y-4 px-4 sm:px-0">
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-400 transition-all text-sm sm:text-base"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-xs sm:text-sm mt-2">{passwordError}</p>
            )}
          </div>
          <button
            onClick={handleSubmit}
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
};

export default AuthScreen;