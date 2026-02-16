import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaCopy, FaUniversity, FaInfoCircle } from 'react-icons/fa';

const BankTransferPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(null);
  
  const { orderId, orderNumber, total, bankData } = location.state || {};

  useEffect(() => {
    if (!orderId || !bankData) {
      navigate('/');
    }
  }, [orderId, bankData, navigate]);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!orderId || !bankData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <FaCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Pedido Creado Exitosamente!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Número de pedido: <span className="font-semibold">{orderNumber}</span>
          </p>
        </div>

        {/* Bank Transfer Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FaUniversity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Datos para la Transferencia
            </h2>
          </div>

          <div className="space-y-4">
            {/* Banco */}
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Banco</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{bankData.bank}</p>
              </div>
            </div>

            {/* Tipo de Cuenta */}
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipo de Cuenta</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{bankData.accountType}</p>
              </div>
            </div>

            {/* CBU */}
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">CBU</p>
                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{bankData.cbu}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankData.cbu, 'cbu')}
                className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Copiar CBU"
              >
                {copied === 'cbu' ? <FaCheck /> : <FaCopy />}
              </button>
            </div>

            {/* Alias */}
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Alias</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{bankData.alias}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankData.alias, 'alias')}
                className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Copiar Alias"
              >
                {copied === 'alias' ? <FaCheck /> : <FaCopy />}
              </button>
            </div>

            {/* Titular */}
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Titular</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{bankData.holder}</p>
              </div>
            </div>

            {/* CUIT */}
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">CUIT</p>
                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">{bankData.cuit}</p>
              </div>
            </div>

            {/* Monto a Transferir */}
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Monto a Transferir</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${total?.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(total?.toFixed(2), 'total')}
                className="ml-4 p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                title="Copiar Monto"
              >
                {copied === 'total' ? <FaCheck /> : <FaCopy />}
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-3">
                Instrucciones Importantes
              </h3>
              <ol className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300 list-decimal list-inside">
                <li>Realiza la transferencia por el monto exacto indicado</li>
                <li>Tienes 48 horas para completar la transferencia</li>
                <li>Guarda el comprobante de la transferencia</li>
                <li>Ve a "Mis Pedidos" y carga el comprobante en este pedido</li>
                <li>Una vez confirmado el pago, procesaremos tu pedido</li>
                <li>Recibirás un email cuando se confirme el pago</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/user/orders')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Ver Mis Pedidos
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>

        {/* Email Confirmation */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Hemos enviado los detalles de la transferencia a tu email
        </p>
      </div>
    </div>
  );
};

export default BankTransferPayment;
