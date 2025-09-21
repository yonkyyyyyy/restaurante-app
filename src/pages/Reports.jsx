import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { ROLES } from '../context/AuthContext';

export default function Reports() {
  const { state: authState } = useAuth();
  const { state: restaurantState } = useRestaurant();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportType, setReportType] = useState('daily');

  // Solo admin y cajero pueden ver reportes
  if (![ROLES.ADMIN, ROLES.CAJERO].includes(authState.user?.role)) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
          Acceso Denegado
        </h2>
        <p style={{ color: '#64748b' }}>
          Solo administradores y cajeros pueden acceder a los reportes.
        </p>
      </div>
    );
  }

  // Calcular reportes
  const reports = useMemo(() => {
    const today = new Date(selectedDate);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Filtrar pedidos del día seleccionado
    const dailyOrders = restaurantState.orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startOfDay && orderDate <= endOfDay;
    });

    // Ventas del día
    const dailySales = dailyOrders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);

    // Productos más vendidos
    const productSales = {};
    dailyOrders.forEach(order => {
      order.items.forEach(item => {
        if (productSales[item.name]) {
          productSales[item.name] += item.quantity;
        } else {
          productSales[item.name] = item.quantity;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    // Estadísticas generales
    const totalOrders = dailyOrders.length;
    const pendingOrders = dailyOrders.filter(o => o.status === 'pending').length;
    const preparingOrders = dailyOrders.filter(o => o.status === 'preparing').length;
    const deliveredOrders = dailyOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = dailyOrders.filter(o => o.status === 'cancelled').length;

    // Ticket promedio
    const averageTicket = deliveredOrders > 0 ? dailySales / deliveredOrders : 0;

    return {
      dailySales,
      totalOrders,
      pendingOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      averageTicket,
      topProducts,
      dailyOrders
    };
  }, [selectedDate, restaurantState.orders]);

  const formatCurrency = (amount) => `S/ ${amount.toFixed(2)}`;

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      preparing: '#3b82f6',
      ready: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          📊 Reportes
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Análisis de ventas y rendimiento del restaurante
        </p>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Filtros de Reporte</h3>
        </div>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'end',
          flexWrap: 'wrap'
        }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Fecha
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Tipo de Reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                minWidth: '150px'
              }}
            >
              <option value="daily">Ventas del Día</option>
              <option value="products">Productos Más Vendidos</option>
              <option value="history">Historial de Pedidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V3m0 5a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem', flex: 1 }}>
              <div className="metric-label">Ventas del Día</div>
              <div className="metric-value">{formatCurrency(reports.dailySales)}</div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem', flex: 1 }}>
              <div className="metric-label">Total Pedidos</div>
              <div className="metric-value">{reports.totalOrders}</div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem', flex: 1 }}>
              <div className="metric-label">Ticket Promedio</div>
              <div className="metric-value">{formatCurrency(reports.averageTicket)}</div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="metric-icon" style={{ background: '#e9d5ff', color: '#8b5cf6' }}>
              <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div style={{ marginLeft: '1rem', flex: 1 }}>
              <div className="metric-label">Entregados</div>
              <div className="metric-value">{reports.deliveredOrders}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reporte de Productos Más Vendidos */}
      {reportType === 'products' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🏆 Productos Más Vendidos</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              {new Date(selectedDate).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div>
            {reports.topProducts.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '2rem' }}>
                No hay ventas registradas para esta fecha
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reports.topProducts.map(([product, quantity], index) => (
                  <div key={product} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: index < 3 ? '#fef3c7' : '#f3f4f6',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem',
                        flexShrink: 0
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                          color: index < 3 ? '#f59e0b' : '#6b7280'
                        }}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                          {product}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                          {quantity} unidades vendidas
                        </p>
                      </div>
                    </div>
                    <div style={{
                      background: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      #{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de Pedidos */}
      {reportType === 'history' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Historial de Pedidos</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              {new Date(selectedDate).toLocaleDateString('es-ES')}
            </p>
          </div>
          <div>
            {reports.dailyOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '2rem' }}>
                No hay pedidos registrados para esta fecha
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.dailyOrders.map((order) => (
                  <div key={order.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#dbeafe',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#2563eb' }}>
                        #{order.id.toString().slice(-3)}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b', marginBottom: '0.25rem' }}>
                        {order.client}
                        {order.source === 'customer_menu' && (
                          <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.625rem',
                            background: '#dbeafe',
                            color: '#1e40af',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '4px'
                          }}>
                            📱 Digital
                          </span>
                        )}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                        {order.items.length} items • {formatCurrency(order.total)}
                        {order.tableId && ` • Mesa ${order.tableId}`}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                        {new Date(order.createdAt).toLocaleTimeString('es-ES')}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: getStatusColor(order.status) + '20',
                        color: getStatusColor(order.status)
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen de Estados */}
      {reportType === 'daily' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Resumen de Estados</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Pendientes</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f59e0b' }}>
                  {reports.pendingOrders}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>En Preparación</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#3b82f6' }}>
                  {reports.preparingOrders}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Entregados</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10b981' }}>
                  {reports.deliveredOrders}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Cancelados</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#ef4444' }}>
                  {reports.cancelledOrders}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💰 Resumen Financiero</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Ventas Totales</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#10b981' }}>
                  {formatCurrency(reports.dailySales)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Pedidos Entregados</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#2563eb' }}>
                  {reports.deliveredOrders}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Ticket Promedio</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#8b5cf6' }}>
                  {formatCurrency(reports.averageTicket)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
