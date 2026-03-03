import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email/${token}`);
        const data = await response.json();

        if (response.ok) {
          if (data.alreadyVerified) {
            setStatus('success');
            setMessage('Tu email ya estaba verificado. Redirigiendo al inicio de sesión...');
          } else {
            setStatus('success');
            setMessage('¡Email verificado exitosamente! Redirigiendo al inicio de sesión...');
          }
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login', { state: { emailVerified: true } });
          }, 3000);
        } else {
          if (data.expired) {
            setStatus('expired');
            setMessage('El token de verificación ha expirado. Por favor solicita uno nuevo.');
          } else {
            setStatus('error');
            setMessage(data.message || 'Error al verificar el email');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setStatus('error');
        setMessage('Error al conectar con el servidor');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendEmail = () => {
    navigate('/email-verification-pending');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Verificando tu email...
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Por favor espera mientras verificamos tu cuenta
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                ¡Verificación Exitosa!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6">
                <div className="animate-pulse flex justify-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full mx-1"></div>
                  <div className="h-2 w-2 bg-blue-600 rounded-full mx-1 animation-delay-200"></div>
                  <div className="h-2 w-2 bg-blue-600 rounded-full mx-1 animation-delay-400"></div>
                </div>
              </div>
            </div>
          )}

          {/* Expired State */}
          {status === 'expired' && (
            <div className="text-center">
              <ClockIcon className="h-16 w-16 text-orange-500 mx-auto" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Token Expirado
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6">
                <button
                  onClick={handleResendEmail}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Solicitar nuevo email de verificación
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Error de Verificación
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {message}
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendEmail}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Solicitar nuevo email de verificación
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Ir al inicio de sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
