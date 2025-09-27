import React from 'react';
import { IconCamera, IconKey, IconLock } from './Icons';
import { SmugMugCredentials } from '../types';

interface LoginScreenProps {
  onLogin: (credentials: SmugMugCredentials) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  
  // For this reference implementation, we use mock credentials to bypass the complex
  // OAuth 1.0a flow, which cannot be securely handled on the client-side.
  const handleConnect = () => {
    onLogin({ 
      apiKey: 'mock-key', 
      apiSecret: 'mock-secret', 
      accessToken: 'mock-token', 
      accessTokenSecret: 'mock-token-secret' 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700 p-8">
          <div className="flex flex-col items-center mb-6 text-center">
            <IconCamera className="w-16 h-16 text-cyan-400 mb-3" />
            <h1 className="text-3xl font-bold text-white">SmugMug API Reference App</h1>
            <p className="text-slate-400 mt-1">A boilerplate for building your own SmugMug application.</p>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleConnect}
              className="w-full max-w-xs mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              Connect & View Demo
            </button>
          </div>
          
          <div className="mt-8 text-left text-sm text-slate-400 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
            <h3 className="font-bold text-lg text-white">For Developers: Understanding SmugMug Authentication</h3>
            <p>
              This application uses a <strong className="text-cyan-400">mock API service</strong> for demonstration purposes. A real SmugMug application must use OAuth 1.0a for authentication, which is a secure but complex process.
            </p>
            <p>
              <strong>Why a Backend is Required:</strong> SmugMug's OAuth 1.0a flow requires the use of an <code className="text-xs bg-slate-700 p-1 rounded">API Secret</code> and <code className="text-xs bg-slate-700 p-1 rounded">Access Token Secret</code>. These values must be kept confidential. Exposing them in a client-side application (like this one) is a major security risk. 
            </p>
            <p>
              Therefore, a production SmugMug app needs a <strong className="text-cyan-400">server-side proxy</strong>. The server would:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Securely store your API secret.</li>
                <li>Handle the multi-step OAuth 1.0a handshake to get user tokens.</li>
                <li>Sign all subsequent API requests on behalf of the client.</li>
                <li>Forward the requests to SmugMug and return the response to the client.</li>
            </ul>
             <p>
              The <code className="text-xs bg-slate-700 p-1 rounded">services/smugmugService.ts</code> file in this project contains the full client-side logic for creating a valid OAuth 1.0a signature, which you can adapt for your server-side implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};