import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { ROLES } from '../context/AuthContext';

// Componentes de métricas
function MetricCard({ title, value, change, icon, color = 'blue' }) {
  const colorStyles = {
    blue: { background: '#dbeafe', color: '#2563eb' },
    green: { background: '#d1fae5', color: '#10b981' },
    yellow: { background: '#fef3c7', color: '#f59e0b' },
    red: { background: '#fee2e2', color: '#ef4444' },
    purple: { background: '#e9d5ff', color: '#8b5cf6' }
  };

  return (
    <div className="metric-card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="metric-icon" style={colorStyles[color]}>
          <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div style={{ marginLeft: '1rem', flex: 1 }}>
          <div className="metric-label">{title}</div>
          <div className="metric-value">{value}</div>
        </div>
      </div>
      {change && (
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0',
          fontSize: '0.875rem'
        }}>
          <span style={{
            fontWeight: '500',
            color: change > 0 ? '#10b981' : '#ef4444'
          }}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span style={{ color: '#64748b', marginLeft: '0.25rem' }}>vs mes anterior</span>
        </div>
      )}
    </div>
  );
}

// Componente de pedidos recientes
function RecentOrders() {
  const { state } = useRestaurant();
  const recentOrders = state.orders.slice(0, 5);

  const getStatusStyle = (status) => {
    const styles = {
      pending: { background: '#fef3c7', color: '#92400e' },
      preparing: { background: '#fed7aa', color: '#9a3412' },
      ready: { background: '#dbeafe', color: '#1e40af' },
      delivered: { background: '#d1fae5', color: '#065f46' },
      cancelled: { background: '#fee2e2', color: '#991b1b' }
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Pedidos Recientes</h3>
      </div>
      <div>
        {recentOrders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '2rem' }}>
            No hay pedidos recientes
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentOrders.map((order) => (
              <div key={order.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#2563eb' }}>
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
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {order.items.length} items • S/ {order.total.toFixed(2)}
                    {order.tableId && ` • Mesa ${order.tableId}`}
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    ...getStatusStyle(order.status)
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
  );
}

// Componente de productos más vendidos
function TopProducts() {
  const { state } = useRestaurant();
  
  // Calcular productos más vendidos
  const productSales = {};
  state.orders.forEach(order => {
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
    .slice(0, 5);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Productos Más Vendidos</h3>
      </div>
      <div>
        {topProducts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '2rem' }}>
            No hay datos de ventas
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {topProducts.map(([product, quantity], index) => (
              <div key={product} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    background: '#dbeafe',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#2563eb' }}>
                      {index + 1}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>
                    {product}
                  </p>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {quantity} vendidos
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state: authState } = useAuth();
  const { state: restaurantState, actions } = useRestaurant();

  // Calcular métricas
  const totalOrders = restaurantState.orders.length;
  const pendingOrders = restaurantState.orders.filter(o => o.status === 'pending').length;
  const totalRevenue = restaurantState.orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Obtener nombre del rol
  const getRoleDisplayName = (role) => {
    const roleNames = {
      [ROLES.ADMIN]: 'Administrador',
      [ROLES.CAJERO]: 'Cajero',
      [ROLES.EMBALADOR]: 'Embalador'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Bienvenido, {authState.user?.name} - {getRoleDisplayName(authState.user?.role)}
        </p>
      </div>

      {/* Métricas principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <MetricCard
          title="Total Pedidos"
          value={totalOrders}
          change={12}
          icon="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          color="blue"
        />
        <MetricCard
          title="Pedidos Pendientes"
          value={pendingOrders}
          change={-5}
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="yellow"
        />
        <MetricCard
          title="Ingresos Totales"
          value={`S/ ${totalRevenue.toFixed(2)}`}
          change={8}
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          color="green"
        />
        <MetricCard
          title="Ticket Promedio"
          value={`S/ ${averageOrderValue.toFixed(2)}`}
          change={3}
          icon="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          color="purple"
        />
      </div>

      {/* Contenido principal */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <RecentOrders />
        <TopProducts />
      </div>

          {/* Botón de prueba para simular pedido */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div className="card-header">
              <h3 className="card-title">🧪 Prueba del Sistema</h3>
            </div>
            <div style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  const testOrder = {
                    tableId: 'TEST-001',
                    client: 'Cliente de Prueba',
                    phone: '999999999',
                    items: [
                      { name: 'Lomo Saltado', quantity: 1, price: 18 },
                      { name: 'Chicha Morada', quantity: 1, price: 7.25 }
                    ],
                    total: 25.25,
                    payment: 'unpaid'
                  };
                  actions.addCustomerOrder(testOrder);
                  alert('Pedido de prueba creado!');
                }}
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                🧪 Crear Pedido de Prueba
              </button>
              
              <button 
                onClick={() => {
                  console.log('🔍 Estado actual del contexto:', restaurantState);
                  console.log('🔍 Pedidos en el contexto:', restaurantState.orders);
                  console.log('🔍 localStorage actual:', localStorage.getItem('restaurant-orders'));
                }}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                🔍 Ver Estado
              </button>
              
              <button 
                onClick={() => {
                  // Limpiar localStorage y recargar
                  localStorage.removeItem('restaurant-orders');
                  window.location.reload();
                }}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                🗑️ Limpiar y Recargar
              </button>
              
              <button 
                onClick={() => {
                  // Verificar localStorage
                  const orders = localStorage.getItem('restaurant-orders');
                  console.log('🔍 localStorage actual:', orders);
                  console.log('🔍 Número de pedidos en localStorage:', orders ? JSON.parse(orders).length : 0);
                }}
                style={{
                  background: '#8b5cf6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                🔍 Ver localStorage
              </button>
            </div>
          </div>

          {/* Acciones rápidas basadas en el rol */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Acciones Rápidas</h3>
            </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {authState.user?.role === ROLES.EMBALADOR && (
            <button 
              onClick={() => window.location.href = '/orders'}
              style={{
                padding: '1.5rem',
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.background = '#ecfdf5';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.background = 'transparent';
              }}
            >
              <div>
                <svg style={{ width: '32px', height: '32px', color: '#9ca3af', margin: '0 auto 0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Gestionar Pedidos</p>
              </div>
            </button>
          )}
          
          
          {authState.user?.role === ROLES.CAJERO && (
            <button style={{
              padding: '1.5rem',
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'center'
            }}>
              <div>
                <svg style={{ width: '32px', height: '32px', color: '#9ca3af', margin: '0 auto 0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Facturación</p>
              </div>
            </button>
          )}
          
          {authState.user?.role === ROLES.ADMIN && (
            <React.Fragment>
              <button style={{
                padding: '1.5rem',
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}>
                <div>
                  <svg style={{ width: '32px', height: '32px', color: '#9ca3af', margin: '0 auto 0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Empleados</p>
                </div>
              </button>
              <button style={{
                padding: '1.5rem',
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}>
                <div>
                  <svg style={{ width: '32px', height: '32px', color: '#9ca3af', margin: '0 auto 0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b' }}>Inventario</p>
                </div>
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}