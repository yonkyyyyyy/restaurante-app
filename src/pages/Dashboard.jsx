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
    <div className="metric-card" style={{
      background: 'white',
      borderRadius: '12px',
      padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '1rem',
        flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
        textAlign: window.innerWidth <= 480 ? 'center' : 'left',
        gap: window.innerWidth <= 480 ? '0.75rem' : '0'
      }}>
        <div className="metric-icon" style={{
          ...colorStyles[color],
          padding: window.innerWidth <= 768 ? '0.75rem' : '0.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: window.innerWidth <= 768 ? '48px' : '40px',
          minHeight: window.innerWidth <= 768 ? '48px' : '40px'
        }}>
          <svg style={{ 
            width: window.innerWidth <= 768 ? '28px' : '24px', 
            height: window.innerWidth <= 768 ? '28px' : '24px' 
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <div style={{ 
          marginLeft: window.innerWidth <= 480 ? '0' : '1rem', 
          flex: 1 
        }}>
          <div className="metric-label" style={{
            fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem',
            color: '#64748b',
            fontWeight: '500',
            marginBottom: '0.25rem'
          }}>
            {title}
          </div>
          <div className="metric-value" style={{
            fontSize: window.innerWidth <= 768 ? '1.75rem' : '1.5rem',
            fontWeight: '700',
            color: '#1e293b'
          }}>
            {value}
          </div>
        </div>
      </div>
      {change && (
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid #e2e8f0',
          fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start',
          gap: '0.25rem',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontWeight: '600',
            color: change > 0 ? '#10b981' : '#ef4444',
            background: change > 0 ? '#ecfdf5' : '#fef2f2',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px'
          }}>
            {change > 0 ? '↗️' : '↘️'} {change > 0 ? '+' : ''}{change}%
          </span>
          <span style={{ color: '#64748b' }}>vs mes anterior</span>
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
    <div className="card" style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      <div className="card-header" style={{
        padding: window.innerWidth <= 768 ? '1rem' : '1.25rem',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc'
      }}>
        <h3 className="card-title" style={{
          fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: 0
        }}>
          📋 Pedidos Recientes
        </h3>
      </div>
      <div style={{ padding: window.innerWidth <= 768 ? '1rem' : '1.25rem' }}>
        {recentOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '2rem 1rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ 
              fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
              margin: 0
            }}>
              No hay pedidos recientes
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: window.innerWidth <= 768 ? '0.75rem' : '1rem' 
          }}>
            {recentOrders.map((order) => (
              <div key={order.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: window.innerWidth <= 768 ? '1rem' : '1.25rem',
                padding: window.innerWidth <= 768 ? '1.25rem' : '1rem',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                textAlign: window.innerWidth <= 480 ? 'center' : 'left',
                marginBottom: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  width: window.innerWidth <= 768 ? '40px' : '32px',
                  height: window.innerWidth <= 768 ? '40px' : '32px',
                  background: '#dbeafe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginBottom: window.innerWidth <= 480 ? '0.5rem' : '0'
                }}>
                  <span style={{ 
                    fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem', 
                    fontWeight: '600', 
                    color: '#2563eb' 
                  }}>
                    #{order.id.toString().slice(-3)}
                  </span>
                </div>
                <div style={{ 
                  flex: 1, 
                  minWidth: 0,
                  marginBottom: window.innerWidth <= 480 ? '0.5rem' : '0'
                }}>
                  <p style={{ 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                    fontWeight: '600', 
                    color: '#1e293b', 
                    marginBottom: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {order.client}
                    {order.source === 'customer_menu' && (
                      <span style={{
                        fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.625rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}>
                        📱 Digital
                      </span>
                    )}
                  </p>
                  <p style={{ 
                    fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem', 
                    color: '#64748b',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start'
                  }}>
                    <span>{order.items.length} items</span>
                    <span>•</span>
                    <span style={{ fontWeight: '600', color: '#059669' }}>
                      S/ {order.total.toFixed(2)}
                    </span>
                    {order.tableId && (
                      <>
                        <span>•</span>
                        <span>Mesa {order.tableId}</span>
                      </>
                    )}
                  </p>
                </div>
                <div style={{ 
                  flexShrink: 0,
                  width: window.innerWidth <= 480 ? '100%' : 'auto'
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: window.innerWidth <= 768 ? '0.5rem 1rem' : '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem',
                    fontWeight: '600',
                    width: window.innerWidth <= 480 ? '100%' : 'auto',
                    justifyContent: 'center',
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
    <div className="card" style={{
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      <div className="card-header" style={{
        padding: window.innerWidth <= 768 ? '1rem' : '1.25rem',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc'
      }}>
        <h3 className="card-title" style={{
          fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: 0
        }}>
          🏆 Productos Más Vendidos
        </h3>
      </div>
      <div style={{ padding: window.innerWidth <= 768 ? '1rem' : '1.25rem' }}>
        {topProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#64748b',
            padding: '2rem 1rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
            <p style={{ 
              fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
              margin: 0
            }}>
              No hay datos de ventas
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: window.innerWidth <= 768 ? '0.75rem' : '0.75rem' 
          }}>
            {topProducts.map(([product, quantity], index) => (
              <div key={product} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: window.innerWidth <= 768 ? '1rem' : '0.75rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                textAlign: window.innerWidth <= 480 ? 'center' : 'left',
                gap: window.innerWidth <= 480 ? '0.75rem' : '0'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  flex: 1,
                  justifyContent: window.innerWidth <= 480 ? 'center' : 'flex-start'
                }}>
                  <div style={{
                    width: window.innerWidth <= 768 ? '32px' : '24px',
                    height: window.innerWidth <= 768 ? '32px' : '24px',
                    background: index < 3 ? '#fbbf24' : '#dbeafe',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: window.innerWidth <= 768 ? '1rem' : '0.75rem',
                    flexShrink: 0,
                    marginBottom: window.innerWidth <= 480 ? '0.5rem' : '0'
                  }}>
                    <span style={{ 
                      fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem', 
                      fontWeight: '600', 
                      color: index < 3 ? '#92400e' : '#2563eb' 
                    }}>
                      {index < 3 ? '🏆' : index + 1}
                    </span>
                  </div>
                  <p style={{ 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                    fontWeight: '600', 
                    color: '#1e293b',
                    margin: 0
                  }}>
                    {product}
                  </p>
                </div>
                <div style={{ 
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                  color: '#64748b',
                  fontWeight: '600',
                  background: '#e2e8f0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>{quantity}</span>
                  <span style={{ fontSize: '0.75rem' }}>vendidos</span>
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
    <div className="fade-in" style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: window.innerWidth <= 768 ? '1rem' : '1.5rem'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: window.innerWidth <= 768 ? '2rem' : '2.5rem',
        textAlign: window.innerWidth <= 480 ? 'center' : 'left',
        background: 'white',
        padding: window.innerWidth <= 768 ? '1.5rem' : '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0'
      }}>
        <h1 style={{ 
          fontSize: window.innerWidth <= 768 ? '2rem' : '2.5rem', 
          fontWeight: '800', 
          color: '#1e293b', 
          marginBottom: '1rem',
          margin: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          📊 Dashboard
        </h1>
        <div style={{
          display: 'flex',
          flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
          alignItems: window.innerWidth <= 480 ? 'center' : 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            color: '#64748b', 
            fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem',
            margin: 0,
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid #bae6fd',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '500'
          }}>
            <span style={{ fontSize: '1.25rem' }}>👋</span>
            <span>Bienvenido, <strong>{authState.user?.name}</strong></span>
          </div>
          <div style={{ 
            color: '#059669', 
            fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
            margin: 0,
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.125rem' }}>👤</span>
            <span>{getRoleDisplayName(authState.user?.role)}</span>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: window.innerWidth <= 768 ? '1rem' : '1.25rem',
        marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem'
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
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: window.innerWidth <= 768 ? '1rem' : '1.5rem',
        marginBottom: window.innerWidth <= 768 ? '1.5rem' : '2rem'
      }}>
        <RecentOrders />
        <TopProducts />
      </div>

          {/* Botón de prueba para simular pedido - Responsive */}
          <div className="card" style={{ 
            marginBottom: '1rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div className="card-header" style={{
              padding: window.innerWidth <= 768 ? '1rem' : '1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <h3 className="card-title" style={{
                fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                🧪 Prueba del Sistema
              </h3>
            </div>
            <div style={{ 
              padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem', 
              display: 'grid',
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: window.innerWidth <= 768 ? '1rem' : '1.25rem'
            }}>
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
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: window.innerWidth <= 768 ? '1rem 1.25rem' : '0.875rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                  fontWeight: '600',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                🧪 <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Crear Pedido de Prueba</span>
                <span style={{ display: window.innerWidth <= 480 ? 'inline' : 'none' }}>Prueba</span>
              </button>
              
              <button 
                onClick={() => {
                  console.log('🔍 Estado actual del contexto:', restaurantState);
                  console.log('🔍 Pedidos en el contexto:', restaurantState.orders);
                  console.log('🔍 localStorage actual:', localStorage.getItem('restaurant-orders'));
                }}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: window.innerWidth <= 768 ? '1rem 1.25rem' : '0.875rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                  fontWeight: '600',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                🔍 <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Ver Estado</span>
                <span style={{ display: window.innerWidth <= 480 ? 'inline' : 'none' }}>Estado</span>
              </button>
              
              <button 
                onClick={() => {
                  // Limpiar localStorage y recargar
                  localStorage.removeItem('restaurant-orders');
                  window.location.reload();
                }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  padding: window.innerWidth <= 768 ? '1rem 1.25rem' : '0.875rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                  fontWeight: '600',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                🗑️ <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Limpiar y Recargar</span>
                <span style={{ display: window.innerWidth <= 480 ? 'inline' : 'none' }}>Limpiar</span>
              </button>
              
              <button 
                onClick={() => {
                  // Verificar localStorage
                  const orders = localStorage.getItem('restaurant-orders');
                  console.log('🔍 localStorage actual:', orders);
                  console.log('🔍 Número de pedidos en localStorage:', orders ? JSON.parse(orders).length : 0);
                }}
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  padding: window.innerWidth <= 768 ? '1rem 1.25rem' : '0.875rem 1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                  fontWeight: '600',
                  minHeight: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                🔍 <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Ver localStorage</span>
                <span style={{ display: window.innerWidth <= 480 ? 'inline' : 'none' }}>Storage</span>
              </button>
            </div>
          </div>

          {/* Acciones rápidas basadas en el rol - Responsive */}
          <div className="card" style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div className="card-header" style={{
              padding: window.innerWidth <= 768 ? '1rem' : '1.25rem',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc'
            }}>
              <h3 className="card-title" style={{
                fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                ⚡ Acciones Rápidas
              </h3>
            </div>
            <div style={{ 
              padding: window.innerWidth <= 768 ? '1.25rem' : '1.5rem',
              display: 'grid', 
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: window.innerWidth <= 768 ? '1rem' : '1.25rem' 
            }}>
              {authState.user?.role === ROLES.EMBALADOR && (
                <button 
                  onClick={() => window.location.href = '/orders'}
                  style={{
                    padding: window.innerWidth <= 768 ? '1.5rem' : '1.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px -1px rgba(0,0,0,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#10b981';
                    e.target.style.background = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 15px -3px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px -1px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>📋</div>
                  <p style={{ 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                    fontWeight: '600', 
                    color: '#1e293b',
                    margin: 0
                  }}>
                    Gestionar Pedidos
                  </p>
                </button>
              )}
              
              {authState.user?.role === ROLES.CAJERO && (
                <button style={{
                  padding: window.innerWidth <= 768 ? '1.5rem' : '1.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  boxShadow: '0 2px 4px -1px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '2rem' }}>💳</div>
                  <p style={{ 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                    fontWeight: '600', 
                    color: '#1e293b',
                    margin: 0
                  }}>
                    Facturación
                  </p>
                </button>
              )}
              
              {authState.user?.role === ROLES.ADMIN && (
                <React.Fragment>
                  <button style={{
                    padding: window.innerWidth <= 768 ? '1.5rem' : '1.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px -1px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '2rem' }}>👥</div>
                    <p style={{ 
                      fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: 0
                    }}>
                      Empleados
                    </p>
                  </button>
                  <button style={{
                    padding: window.innerWidth <= 768 ? '1.5rem' : '1.75rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'center',
                    minHeight: '140px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    boxShadow: '0 2px 4px -1px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '2rem' }}>📦</div>
                    <p style={{ 
                      fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: 0
                    }}>
                      Inventario
                    </p>
                  </button>
                </React.Fragment>
              )}
            </div>
          </div>
    </div>
  );
}