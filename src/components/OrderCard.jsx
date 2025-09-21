import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'Preparando', color: 'bg-orange-100 text-orange-800' },
  ready: { label: 'Listo', color: 'bg-blue-100 text-blue-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

const paymentConfig = {
  efectivo: { label: 'Efectivo', color: 'text-green-600' },
  tarjeta: { label: 'Tarjeta', color: 'text-blue-600' },
  yape: { label: 'Yape', color: 'text-purple-600' },
  plin: { label: 'Plin', color: 'text-pink-600' }
};

export default function OrderCard({ order }) {
  const { actions } = useRestaurant();

  const handleStatusChange = () => {
    const statusSequence = ['pending', 'preparing', 'ready', 'delivered'];
    const currentIndex = statusSequence.indexOf(order.status);
    const nextStatus = currentIndex === -1 || currentIndex === statusSequence.length - 1 
      ? statusSequence[0] 
      : statusSequence[currentIndex + 1];
    
    actions.updateOrder(order.id, { status: nextStatus });
  };

  const handleMarkPaid = () => {
    actions.updateOrder(order.id, { payment: 'paid' });
  };

  const handleViewDetails = () => {
    actions.setCurrentOrder(order);
  };

  const handleCancel = () => {
    actions.updateOrder(order.id, { status: 'cancelled' });
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const payment = paymentConfig[order.payment] || paymentConfig.efectivo;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Pedido #{order.id}</div>
          <h3 className="font-semibold text-gray-900">{order.client}</h3>
          <p className="text-sm text-gray-600">{order.phone}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
          <div className="mt-1 text-lg font-bold text-gray-900">
            S/ {order.total.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleTimeString('es-PE', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-sm font-medium ${payment.color}`}>
          {payment.label}
        </span>
        {order.payment === 'paid' && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            Pagado
          </span>
        )}
      </div>

      {/* Items Preview */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Items:</div>
        <div className="text-sm text-gray-700">
          {order.items.slice(0, 2).map((item, index) => (
            <span key={index}>
              {item.quantity}x {item.name}
              {index < Math.min(order.items.length, 2) - 1 && ', '}
            </span>
          ))}
          {order.items.length > 2 && (
            <span className="text-gray-500"> +{order.items.length - 2} más</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleStatusChange}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cambiar Estado
        </button>
        {order.payment !== 'paid' && (
          <button
            onClick={handleMarkPaid}
            className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Pagar
          </button>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={handleViewDetails}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver Detalle
        </button>
        {order.status !== 'cancelled' && order.status !== 'delivered' && (
          <button
            onClick={handleCancel}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

