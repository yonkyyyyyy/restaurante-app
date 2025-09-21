import React, { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

export default function Orders() {
  const { state: authState } = useAuth();
  const { state: restaurantState, actions } = useRestaurant();
  
  // Cargar pedidos directamente desde localStorage
  const [localOrders, setLocalOrders] = useState([]);
  
  // Funciones para manejar cookies
  const setCookie = (name, value, hours) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  // Cargar pedidos desde el servidor
  const loadOrdersFromServer = async () => {
    try {
      console.log('🔄 Cargando pedidos desde servidor...');
      const response = await fetch('/api/orders');
      if (response.ok) {
        const orders = await response.json();
        setLocalOrders(orders);
        console.log('📋 Pedidos cargados desde servidor:', orders);
        console.log('📋 Total de pedidos:', orders.length);
      } else {
        console.error('Error al cargar pedidos del servidor');
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    loadOrdersFromServer();
  }, []);
  
  // Debug: Log de pedidos
  console.log('📋 Pedidos en Orders (contexto):', restaurantState.orders);
  console.log('📋 Pedidos locales:', localOrders);
  console.log('📋 Total de pedidos locales:', localOrders.length);
  
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [cart, setCart] = useState([]);
  const [client, setClient] = useState({ name: "", phone: "" });
  const [payment, setPayment] = useState("efectivo");

  // Escuchar eventos de sincronización entre pestañas
  useEffect(() => {
    const handleOrderAdded = (event) => {
      console.log('🔔 Evento recibido en Orders:', event.detail);
      // Actualizar pedidos locales
      const storedOrders = localStorage.getItem('restaurant-orders');
      if (storedOrders) {
        try {
          const orders = JSON.parse(storedOrders);
          console.log('📋 Pedidos recargados desde localStorage:', orders);
          setLocalOrders(orders);
        } catch (error) {
          console.error('Error al cargar pedidos:', error);
        }
      }
    };

    // Escuchar eventos de pedidos agregados
    window.addEventListener('restaurant-order-added', handleOrderAdded);

    return () => {
      window.removeEventListener('restaurant-order-added', handleOrderAdded);
    };
  }, []);

  // Polling automático para verificar nuevos pedidos cada 1 segundo
  // Polling para verificar nuevos pedidos desde el servidor
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrdersFromServer();
    }, 2000); // Verificar cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return { background: '#fef3c7', color: '#92400e' };
      case "preparing":
        return { background: '#fed7aa', color: '#9a3412' };
      case "ready":
        return { background: '#dbeafe', color: '#1e40af' };
      case "delivered":
        return { background: '#d1fae5', color: '#065f46' };
      case "cancelled":
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  function updateOrder(id, patch) {
    actions.updateOrder(id, patch);
  }

  async function markPaid(id) {
    try {
      console.log('💰 Marcando pedido como pagado:', id);
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payment: 'paid' })
      });
      
      if (response.ok) {
        console.log('✅ Pedido marcado como pagado');
        // Recargar pedidos desde el servidor
        loadOrdersFromServer();
      } else {
        console.error('❌ Error al marcar como pagado');
      }
    } catch (error) {
      console.error('❌ Error al marcar como pagado:', error);
    }
  }

  async function cycleStatus(id) {
    try {
      const order = localOrders.find(o => o.id === id);
      if (!order) return;
      
      const seq = ["pending", "preparing", "ready", "delivered"];
      const i = seq.indexOf(order.status);
      const next = i === -1 || i === seq.length - 1 ? seq[0] : seq[i+1];
      
      console.log('🔄 Cambiando estado del pedido:', id, 'de', order.status, 'a', next);
      
      const response = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: next })
      });
      
      if (response.ok) {
        console.log('✅ Estado cambiado correctamente');
        // Recargar pedidos desde el servidor
        loadOrdersFromServer();
      } else {
        console.error('❌ Error al cambiar estado');
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
    }
  }

  // Función única para actualizar pedidos
  const refreshOrders = () => {
    console.log('🔄 Refrescando pedidos desde servidor...');
    loadOrdersFromServer();
  };

  // Función para limpiar todo
  const clearAll = async () => {
    console.log('🗑️ Limpiando todo desde servidor...');
    try {
      const response = await fetch('/api/orders', {
        method: 'DELETE'
      });
      if (response.ok) {
        setLocalOrders([]);
        console.log('🗑️ Todos los pedidos eliminados del servidor');
      }
    } catch (error) {
      console.error('Error al limpiar pedidos:', error);
    }
  };

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(p => p.id !== id));
  }

  function saveOrder() {
    if (!client.name || !client.phone || cart.length === 0) return;
    const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
    const newOrder = {
      client: client.name,
      phone: client.phone,
      total,
      payment,
      items: cart.map(c => ({ name: c.name, quantity: c.qty, price: c.price }))
    };
    actions.addOrder(newOrder);
    setShowNew(false);
    setCart([]);
    setClient({ name: "", phone: "" });
    setPayment("efectivo");
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc', 
      padding: window.innerWidth <= 768 ? '0.5rem' : '1rem', 
      position: 'relative' 
    }}>
      {/* Header responsive */}
      <header style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        alignItems: window.innerWidth <= 768 ? 'stretch' : 'center', 
        justifyContent: 'space-between', 
        marginBottom: window.innerWidth <= 768 ? '1rem' : '1.5rem',
        gap: window.innerWidth <= 768 ? '0.75rem' : '0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <h1 style={{ 
            fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.5rem', 
            fontWeight: '600', 
            color: '#1e293b',
            margin: 0
          }}>
            Panel de Pedidos
          </h1>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem', 
            color: '#64748b',
            background: '#e2e8f0',
            padding: '0.25rem 0.5rem',
            borderRadius: '6px'
          }}>
            {localOrders.length} pedidos
          </div>
        </div>
        
        {/* Botones de control - Responsive */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: window.innerWidth <= 768 ? '0.75rem' : '0.5rem',
          justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-end'
        }}>
          <button 
            onClick={refreshOrders}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: window.innerWidth <= 768 ? '0.625rem 0.875rem' : '0.5rem 0.875rem',
              fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.75rem',
              cursor: 'pointer',
              minHeight: '40px',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            🔄 <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Actualizar</span>
          </button>
          
          <button 
            onClick={clearAll}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: window.innerWidth <= 768 ? '0.625rem 0.875rem' : '0.5rem 0.875rem',
              fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.75rem',
              cursor: 'pointer',
              minHeight: '40px',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            🗑️ <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Limpiar</span>
          </button>
          
          <button 
            onClick={() => {
              const stored = localStorage.getItem('restaurant-orders');
              console.log('🔍 DEBUG - localStorage actual:', stored);
              if (stored) {
                const orders = JSON.parse(stored);
                console.log('🔍 DEBUG - Pedidos parseados:', orders);
                console.log('🔍 DEBUG - Cantidad de pedidos:', orders.length);
                orders.forEach((order, index) => {
                  console.log(`🔍 DEBUG - Pedido ${index + 1}:`, order);
                });
              }
            }}
            style={{
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: window.innerWidth <= 768 ? '0.625rem 0.875rem' : '0.5rem 0.875rem',
              fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.75rem',
              cursor: 'pointer',
              minHeight: '40px',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            🔍 <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Debug</span>
          </button>
          
          <button 
            onClick={async () => {
              const testOrder = {
                tableId: 'test',
                client: 'Cliente Test',
                phone: '999999999',
                items: [{ name: 'Producto Test', quantity: 1, price: 10 }],
                total: 10,
                payment: 'unpaid'
              };
              
              try {
                const response = await fetch('/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(testOrder)
                });
                
                if (response.ok) {
                  console.log('🧪 Pedido de prueba creado en servidor');
                  loadOrdersFromServer();
                }
              } catch (error) {
                console.error('Error al crear pedido de prueba:', error);
              }
            }}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: window.innerWidth <= 768 ? '0.625rem 0.875rem' : '0.5rem 0.875rem',
              fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.75rem',
              cursor: 'pointer',
              minHeight: '40px',
              minWidth: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            🧪 <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Test</span>
          </button>
        </div>
      </header>

      {/* Lista de pedidos - Responsive */}
      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: window.innerWidth <= 768 ? '0.75rem' : '1rem' 
      }}>
        {localOrders.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>
              No hay pedidos
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Los pedidos aparecerán aquí cuando los clientes hagan sus órdenes
            </p>
          </div>
        ) : (
          localOrders.map(order => (
            <article key={order.id} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: window.innerWidth <= 768 ? '0.875rem' : '1rem', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'box-shadow 0.2s ease',
              border: '1px solid #e2e8f0'
            }}>
              {/* Header del pedido */}
              <div style={{ 
                display: 'flex', 
                flexDirection: window.innerWidth <= 480 ? 'column' : 'row',
                alignItems: window.innerWidth <= 480 ? 'stretch' : 'flex-start', 
                justifyContent: 'space-between',
                gap: window.innerWidth <= 480 ? '0.75rem' : '0',
                marginBottom: '1rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem', 
                    color: '#64748b',
                    marginBottom: '0.25rem'
                  }}>
                    Pedido #{order.id}
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.125rem', 
                    fontWeight: '600', 
                    marginBottom: '0.25rem', 
                    color: '#1e293b' 
                  }}>
                    {order.client}
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                    color: '#64748b',
                    marginBottom: '0.5rem'
                  }}>
                    📞 {order.phone}
                  </div>
                  {order.tableId && (
                    <div style={{ 
                      fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem', 
                      color: '#1e40af', 
                      background: '#dbeafe', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      📱 Mesa {order.tableId}
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  textAlign: window.innerWidth <= 480 ? 'left' : 'right',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                    fontWeight: '500',
                    ...statusBadge(order.status)
                  }}>
                    {order.status}
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.125rem', 
                    fontWeight: '700', 
                    color: '#1e293b' 
                  }}>
                    S/ {order.total.toFixed(2)}
                  </div>
                  <div style={{ 
                    fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem', 
                    color: '#64748b' 
                  }}>
                    {new Date(order.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Botones de acción - Responsive */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : '1fr 1fr',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <button 
                  onClick={() => cycleStatus(order.id)} 
                  style={{
                    padding: window.innerWidth <= 768 ? '0.75rem 1rem' : '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '44px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.background = 'white'}
                >
                  🔄 Cambiar estado
                </button>
                <button 
                  onClick={() => markPaid(order.id)} 
                  style={{
                    padding: window.innerWidth <= 768 ? '0.75rem 1rem' : '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: 'white',
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minHeight: '44px',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#059669'}
                  onMouseLeave={(e) => e.target.style.background = '#10b981'}
                >
                  💰 Marcar pagado
                </button>
              </div>

              {/* Botones secundarios */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <button 
                  onClick={() => setSelected(order)} 
                  style={{ 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                    color: '#0ea5e9', 
                    cursor: 'pointer', 
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f0f9ff'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  👁️ Ver detalle
                </button>
                <button 
                  onClick={() => cycleStatus(order.id)} 
                  style={{ 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                    color: '#ef4444', 
                    cursor: 'pointer', 
                    textDecoration: 'none',
                    background: 'none',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s ease',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  ❌ Cancelar
                </button>
              </div>
            </article>
          ))
        )}
      </main>

      {/* Botón flotante nuevo pedido - Responsive */}
      <button 
        onClick={() => setShowNew(true)} 
        style={{
          position: 'fixed',
          bottom: window.innerWidth <= 768 ? '1rem' : '1.5rem',
          right: window.innerWidth <= 768 ? '1rem' : '1.5rem',
          background: '#0ea5e9',
          color: 'white',
          padding: window.innerWidth <= 768 ? '1rem 1.5rem' : '0.75rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          cursor: 'pointer',
          fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
          fontWeight: '600',
          transition: 'all 0.2s ease',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          zIndex: 1000
        }}
        onMouseEnter={(e) => e.target.style.background = '#0284c7'}
        onMouseLeave={(e) => e.target.style.background = '#0ea5e9'}
      >
        <span style={{ fontSize: window.innerWidth <= 768 ? '1.25rem' : '1rem' }}>+</span>
        <span style={{ display: window.innerWidth <= 480 ? 'none' : 'inline' }}>Nuevo Pedido</span>
      </button>

      {/* Modal detalle - Responsive */}
      {selected && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: window.innerWidth <= 768 ? '0.5rem' : '1rem',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: window.innerWidth <= 768 ? '100%' : '32rem',
            maxHeight: window.innerWidth <= 768 ? '90vh' : '80vh',
            padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
            overflowY: 'auto'
          }}>
            <header style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <h2 style={{ 
                fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.125rem', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: 0
              }}>
                Detalle Pedido #{selected.id}
              </h2>
              <button 
                onClick={() => setSelected(null)} 
                style={{ 
                  color: '#64748b', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '1.5rem',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </header>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr', 
              gap: '1rem' 
            }}>
              <div style={{ 
                fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                color: '#64748b',
                background: '#f8fafc',
                padding: '0.75rem',
                borderRadius: '8px'
              }}>
                <strong>Cliente:</strong> {selected.client}<br/>
                <strong>Teléfono:</strong> {selected.phone}
              </div>
              <div>
                <h3 style={{ 
                  fontWeight: '600', 
                  color: '#1e293b',
                  fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem',
                  marginBottom: '0.75rem'
                }}>
                  📋 Items del Pedido
                </h3>
                <ul style={{ 
                  marginTop: '0.5rem', 
                  listStyle: 'none', 
                  padding: 0, 
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {selected.items.map((it, idx) => (
                    <li key={idx} style={{ 
                      color: '#1e293b',
                      background: 'white',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>
                        <strong>{it.quantity}x</strong> {it.name}
                      </span>
                      <span style={{ fontWeight: '600', color: '#059669' }}>
                        S/ {it.price.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ 
                textAlign: 'center', 
                fontWeight: '700', 
                color: '#1e293b',
                fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.125rem',
                background: '#f0f9ff',
                padding: '1rem',
                borderRadius: '8px',
                border: '2px solid #0ea5e9'
              }}>
                💰 Total: S/ {selected.total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo pedido - Responsive */}
      {showNew && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: window.innerWidth <= 768 ? '0.5rem' : '1rem',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: window.innerWidth <= 768 ? '100%' : '48rem',
            maxHeight: window.innerWidth <= 768 ? '95vh' : '90vh',
            padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
            overflowY: 'auto'
          }}>
            <header style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <h2 style={{ 
                fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.125rem', 
                fontWeight: '600', 
                color: '#1e293b',
                margin: 0
              }}>
                📝 Nuevo Pedido
              </h2>
              <button 
                onClick={() => setShowNew(false)} 
                style={{ 
                  color: '#64748b', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '1.5rem',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </header>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {/* Cliente */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '0.75rem' 
                }}>
                  👤 Información del Cliente
                </label>
                <input 
                  value={client.name} 
                  onChange={e => setClient({ ...client, name: e.target.value })} 
                  placeholder="Nombre completo" 
                  style={{ 
                    marginBottom: '0.75rem',
                    width: '100%', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: window.innerWidth <= 768 ? '0.75rem 1rem' : '0.5rem 0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                    minHeight: '44px'
                  }} 
                />
                <input 
                  value={client.phone} 
                  onChange={e => setClient({ ...client, phone: e.target.value })} 
                  placeholder="Número de teléfono" 
                  style={{ 
                    width: '100%', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: window.innerWidth <= 768 ? '0.75rem 1rem' : '0.5rem 0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                    minHeight: '44px',
                    marginBottom: '1rem'
                  }} 
                />

                <label style={{ 
                  display: 'block', 
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem', 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '0.5rem' 
                }}>
                  💳 Método de pago
                </label>
                <select 
                  value={payment} 
                  onChange={e => setPayment(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '8px', 
                    padding: window.innerWidth <= 768 ? '0.75rem 1rem' : '0.5rem 0.75rem', 
                    fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                    minHeight: '44px'
                  }}
                >
                  <option value="efectivo">💰 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                  <option value="yape">📱 Yape</option>
                  <option value="plin">📱 Plin</option>
                </select>
              </div>

              {/* Productos */}
              <div>
                <h3 style={{ 
                  fontWeight: '600', 
                  color: '#1e293b', 
                  marginBottom: '1rem',
                  fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem'
                }}>
                  🍽️ Productos Disponibles
                </h3>
                <div style={{ 
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.5rem'
                }}>
                  {restaurantState.menu.map(p => (
                    <div key={p.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                      padding: '0.75rem',
                      borderBottom: '1px solid #f1f5f9',
                      gap: '0.5rem'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#1e293b' }}>{p.name}</div>
                        <div style={{ color: '#059669', fontWeight: '600' }}>S/ {p.price.toFixed(2)}</div>
                      </div>
                      <button 
                        onClick={() => addToCart(p)} 
                        style={{ 
                          padding: window.innerWidth <= 768 ? '0.5rem 1rem' : '0.25rem 0.5rem', 
                          background: '#0ea5e9', 
                          color: 'white', 
                          borderRadius: '6px', 
                          fontSize: window.innerWidth <= 768 ? '0.875rem' : '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          minHeight: '44px',
                          fontWeight: '500'
                        }}
                      >
                        ➕ Añadir
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carrito */}
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ 
                fontWeight: '600', 
                color: '#1e293b', 
                marginBottom: '1rem',
                fontSize: window.innerWidth <= 768 ? '1.125rem' : '1rem'
              }}>
                🛒 Carrito de Compras
              </h3>
              {cart.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  color: '#64748b'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                  <p style={{ fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem' }}>
                    El carrito está vacío
                  </p>
                </div>
              )}
              {cart.length > 0 && (
                <div style={{
                  background: '#f8fafc',
                  borderRadius: '8px',
                  padding: '1rem',
                  border: '1px solid #e2e8f0'
                }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      background: 'white',
                      borderRadius: '6px',
                      marginBottom: '0.5rem',
                      fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem'
                    }}>
                      <span style={{ fontWeight: '500' }}>
                        {item.qty} x {item.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: '600', color: '#059669' }}>
                          S/ {(item.qty * item.price).toFixed(2)}
                        </span>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          style={{ 
                            color: '#ef4444', 
                            fontSize: '1.25rem', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '4px',
                            minHeight: '32px',
                            minWidth: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ❌
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ 
                    textAlign: 'center', 
                    fontWeight: '700', 
                    color: 'white', 
                    marginTop: '1rem',
                    fontSize: window.innerWidth <= 768 ? '1.25rem' : '1.125rem',
                    background: '#0ea5e9',
                    padding: '1rem',
                    borderRadius: '8px'
                  }}>
                    💰 Total: S/ {cart.reduce((s, p) => s + p.qty * p.price, 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <footer style={{ 
              marginTop: '1.5rem', 
              display: 'flex', 
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <button 
                onClick={() => setShowNew(false)} 
                style={{ 
                  padding: window.innerWidth <= 768 ? '0.75rem 1.5rem' : '0.5rem 1rem', 
                  background: '#6b7280', 
                  color: 'white', 
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                  minHeight: '44px',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = '#4b5563'}
                onMouseLeave={(e) => e.target.style.background = '#6b7280'}
              >
                ❌ Cancelar
              </button>
              <button 
                onClick={saveOrder} 
                style={{ 
                  padding: window.innerWidth <= 768 ? '0.75rem 1.5rem' : '0.5rem 1rem', 
                  background: '#10b981', 
                  color: 'white', 
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                  fontSize: window.innerWidth <= 768 ? '1rem' : '0.875rem',
                  minHeight: '44px',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.target.style.background = '#059669'}
                onMouseLeave={(e) => e.target.style.background = '#10b981'}
              >
                💾 Guardar Pedido
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}