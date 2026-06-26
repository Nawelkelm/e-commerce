import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EnvelopeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const EmailVerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';
  
  const [email, setEmail] = useState(emailFromState);
  const [status, setStatus] = useState('idle'); // idle, sending, success, error
  const [message, setMessage] = useState('');

  const handleResendEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Por favor ingresa tu email');
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email de verificación enviado exitosamente. Por favor revisa tu bandeja de entrada.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al enviar el email');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
      setMessage('Error al conectar con el servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-surface-800 rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100">
              <EnvelopeIcon className="h-10 w-10 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-surface-900 dark:text-white">
              Verifica tu Email
            </h2>
            <p className="mt-2 text-sm text-surface-600 dark:text-surface-400">
              Te hemos enviado un email con un enlace de verificación
            </p>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-primary-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">
              Pasos a seguir:
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-primary-800">
              <li>Revisa tu bandeja de entrada</li>
              <li>Busca un email de nuestra parte</li>
              <li>Haz clic en el enlace de verificación</li>
              <li>Inicia sesión con tu cuenta verificada</li>
            </ol>
          </div>

          {/* Important Note */}
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Importante:</strong> El enlace expira en 24 horas. Si no ves el email, revisa tu carpeta de spam.
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <XCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resend Form */}
          <div className="mt-8">
            <form onSubmit={handleResendEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                  ¿No recibiste el email?
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md shadow-sm placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="tu@email.com"
                    disabled={status === 'sending'}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'sending' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </>
                ) : (
                  'Reenviar email de verificación'
                )}
              </button>
            </form>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPending;
