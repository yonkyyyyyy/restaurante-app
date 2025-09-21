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
      const response = await fetch('http://192.168.0.9:3001/api/orders');
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

  function markPaid(id) {
    updateOrder(id, { payment: "paid" });
  }

  function cycleStatus(id) {
    const order = localOrders.find(o => o.id === id);
    if (!order) return;
    const seq = ["pending", "preparing", "ready", "delivered"];
    const i = seq.indexOf(order.status);
    const next = i === -1 || i === seq.length - 1 ? seq[0] : seq[i+1];
    
    // Actualizar en localStorage
    const updatedOrders = localOrders.map(o => 
      o.id === id ? { ...o, status: next } : o
    );
    localStorage.setItem('restaurant-orders', JSON.stringify(updatedOrders));
    setLocalOrders(updatedOrders);
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
      const response = await fetch('http://192.168.0.9:3001/api/orders', {
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '1.5rem', position: 'relative' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>Panel de Pedidos</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Pedidos hoy: {localOrders.length}</div>
          
          {/* Botones de control */}
          <button 
            onClick={refreshOrders}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            🔄 Actualizar
          </button>
          
          <button 
            onClick={clearAll}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            🗑️ Limpiar
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
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            🔍 Debug
          </button>
          
          <button 
            onClick={() => {
              // Crear un pedido de prueba directo
              const testOrder = {
                id: Date.now(),
                client: 'Cliente de Prueba',
                phone: '999999999',
                total: 25.50,
                status: 'pending',
                payment: 'unpaid',
                createdAt: new Date().toISOString(),
                source: 'test',
                items: [
                  { name: 'Producto de Prueba', quantity: 1, price: 25.50 }
                ]
              };
              
              // Obtener pedidos actuales
              const currentOrders = JSON.parse(localStorage.getItem('restaurant-orders') || '[]');
              const updatedOrders = [...currentOrders, testOrder];
              
              // Guardar en localStorage
              localStorage.setItem('restaurant-orders', JSON.stringify(updatedOrders));
              console.log('🧪 Pedido de prueba creado:', testOrder);
              console.log('🧪 Total de pedidos:', updatedOrders.length);
              
              // Recargar página
              window.location.reload();
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            🧪 Test
          </button>
          
          
          
        <button 
          onClick={async () => {
            // Crear pedido de prueba en el servidor
            const testOrder = {
              tableId: 'test',
              client: 'Cliente Test',
              phone: '999999999',
              items: [{ name: 'Producto Test', quantity: 1, price: 10 }],
              total: 10,
              payment: 'unpaid'
            };
            
            try {
              const response = await fetch('http://192.168.0.9:3001/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testOrder)
              });
              
              if (response.ok) {
                console.log('🧪 Pedido de prueba creado en servidor');
                loadOrdersFromServer(); // Recargar pedidos
              }
            } catch (error) {
              console.error('Error al crear pedido de prueba:', error);
            }
          }}
            style={{
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            🧪 Test
          </button>
              
        </div>
      </header>

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {localOrders.map(order => (
          <article key={order.id} style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '1rem', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pedido #{order.id}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: '500', marginTop: '0.25rem', color: '#1e293b' }}>{order.client}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{order.phone}</div>
                {order.tableId && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#1e40af', 
                    background: '#dbeafe', 
                    padding: '0.125rem 0.375rem', 
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginTop: '0.25rem'
                  }}>
                    📱 Mesa {order.tableId}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  ...statusBadge(order.status)
                }}>
                  {order.status}
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>S/ {order.total.toFixed(2)}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{new Date(order.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => cycleStatus(order.id)} 
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.875rem',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'white'}
              >
                Cambiar estado
              </button>
              <button 
                onClick={() => markPaid(order.id)} 
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '8px',
                  background: '#10b981',
                  color: 'white',
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#059669'}
                onMouseLeave={(e) => e.target.style.background = '#10b981'}
              >
                Marcar pagado
              </button>
            </div>

            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button 
                onClick={() => setSelected(order)} 
                style={{ fontSize: '0.875rem', color: '#0ea5e9', cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Ver detalle
              </button>
              <button 
                onClick={() => updateOrder(order.id, { status: 'cancelled' })} 
                style={{ fontSize: '0.875rem', color: '#ef4444', cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                Cancelar
              </button>
            </div>
          </article>
        ))}
      </main>

      {/* Botón flotante nuevo pedido */}
      <button 
        onClick={() => setShowNew(true)} 
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          background: '#0ea5e9',
          color: 'white',
          padding: '0.75rem 1.25rem',
          borderRadius: '9999px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#0284c7'}
        onMouseLeave={(e) => e.target.style.background = '#0ea5e9'}
      >
        + Nuevo Pedido
      </button>

      {/* Modal detalle */}
      {selected && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '32rem',
            padding: '1.5rem'
          }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Detalle Pedido #{selected.id}</h2>
              <button 
                onClick={() => setSelected(null)} 
                style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Cliente: {selected.client} — {selected.phone}</div>
              <div>
                <h3 style={{ fontWeight: '500', color: '#1e293b' }}>Items</h3>
                <ul style={{ marginTop: '0.5rem', listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                  {selected.items.map((it, idx) => (
                    <li key={idx} style={{ color: '#64748b' }}>
                      {it.quantity} x {it.name} — S/ {it.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ textAlign: 'right', fontWeight: '600', color: '#1e293b' }}>
                Total: S/ {selected.total.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo pedido */}
      {showNew && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '48rem',
            padding: '1.5rem',
            overflowY: 'auto',
            maxHeight: '90vh'
          }}>
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>Nuevo Pedido</h2>
              <button 
                onClick={() => setShowNew(false)} 
                style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {/* Cliente */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#1e293b', marginBottom: '0.5rem' }}>Cliente</label>
                <input 
                  value={client.name} 
                  onChange={e => setClient({ ...client, name: e.target.value })} 
                  placeholder="Nombre" 
                  style={{ 
                    marginBottom: '0.5rem',
                    width: '100%', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    padding: '0.5rem 0.75rem', 
                    fontSize: '0.875rem' 
                  }} 
                />
                <input 
                  value={client.phone} 
                  onChange={e => setClient({ ...client, phone: e.target.value })} 
                  placeholder="Teléfono" 
                  style={{ 
                    width: '100%', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    padding: '0.5rem 0.75rem', 
                    fontSize: '0.875rem' 
                  }} 
                />

                <label style={{ display: 'block', marginTop: '1rem', fontSize: '0.875rem', fontWeight: '500', color: '#1e293b', marginBottom: '0.5rem' }}>Método de pago</label>
                <select 
                  value={payment} 
                  onChange={e => setPayment(e.target.value)} 
                  style={{ 
                    width: '100%', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px', 
                    padding: '0.5rem 0.75rem', 
                    fontSize: '0.875rem' 
                  }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </select>
              </div>

              {/* Productos */}
              <div>
                <h3 style={{ fontWeight: '500', color: '#1e293b', marginBottom: '0.5rem' }}>Productos</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {restaurantState.menu.map(p => (
                    <li key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span>{p.name} — S/ {p.price.toFixed(2)}</span>
                      <button 
                        onClick={() => addToCart(p)} 
                        style={{ 
                          padding: '0.25rem 0.5rem', 
                          background: '#0ea5e9', 
                          color: 'white', 
                          borderRadius: '6px', 
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        Añadir
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Carrito */}
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontWeight: '500', color: '#1e293b', marginBottom: '0.5rem' }}>Carrito</h3>
              {cart.length === 0 && <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Vacío</p>}
              {cart.length > 0 && (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                  {cart.map(item => (
                    <li key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{item.qty} x {item.name}</span>
                      <span>S/ {(item.qty * item.price).toFixed(2)}</span>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        style={{ color: '#ef4444', fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div style={{ textAlign: 'right', fontWeight: '600', color: '#1e293b', marginTop: '0.5rem' }}>
                Total: S/ {cart.reduce((s, p) => s + p.qty * p.price, 0).toFixed(2)}
              </div>
            </div>

            <footer style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={saveOrder} 
                style={{ 
                  padding: '0.5rem 1rem', 
                  background: '#10b981', 
                  color: 'white', 
                  borderRadius: '8px', 
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#059669'}
                onMouseLeave={(e) => e.target.style.background = '#10b981'}
              >
                Guardar Pedido
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}