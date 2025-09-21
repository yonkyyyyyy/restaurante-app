import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useRestaurant();
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: ''
  });
  const [showCart, setShowCart] = useState(false);

  // Agrupar productos por categoría
  const menuByCategory = state.menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const addToCart = (item) => {
    console.log('🛒 Agregando al carrito:', item);
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        const newCart = prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
        return newCart;
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleOrder = async () => {
    console.log('🛒 Intentando hacer pedido...');
    console.log('🛒 Carrito:', cart);
    console.log('🛒 Cliente:', customerInfo);
    console.log('🛒 TableId:', tableId);
    
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    if (!customerInfo.name.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    // Crear el pedido
    const order = {
      tableId: tableId,
      client: customerInfo.name,
      phone: customerInfo.phone,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: getTotal(),
      payment: 'unpaid',
      source: 'customer_menu'
    };

    console.log('📝 Pedido creado:', order);

    // Enviar pedido al servidor
    try {
      console.log('🔄 Enviando pedido al servidor...');
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Pedido enviado al servidor:', result);
      } else {
        throw new Error('Error del servidor');
      }
      
    } catch (error) {
      console.error('❌ Error al enviar pedido:', error);
      alert('Error al enviar el pedido. Por favor, intenta de nuevo.');
      return;
    }
    
    // Simular envío exitoso
    alert('¡Pedido enviado! El mesero se acercará a confirmar.');
    
    // Limpiar carrito
    setCart([]);
    setCustomerInfo({ name: '', phone: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0.5rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          🍽️ Menú Digital
        </h1>
        <p style={{
          fontSize: '0.75rem',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          Mesa {tableId} • Escanea y ordena
        </p>

        {/* Información del cliente */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <input
            type="text"
            placeholder="Tu nombre"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
            style={{
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="tel"
            placeholder="Tu teléfono (opcional)"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
            style={{
              padding: '0.75rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.875rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Botón del carrito */}
        <button
          onClick={() => setShowCart(true)}
          style={{
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          🛒 Ver Carrito ({cart.length})
        </button>
      </div>

      {/* Menú por categorías */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {Object.entries(menuByCategory).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '1.5rem' }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '0.75rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid #e2e8f0'
            }}>
              {category}
            </h2>
            
            <div style={{
              display: 'grid',
              gap: '0.75rem'
            }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#f8fafc'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {item.name}
                    </h3>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      marginBottom: '0.25rem'
                    }}>
                      {item.description}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#059669'
                    }}>
                      S/ {item.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => addToCart(item)}
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '60px'
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal del carrito */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxHeight: '80vh',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            padding: '1rem',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1e293b'
              }}>
                Tu Pedido
              </h3>
              <button
                onClick={() => setShowCart(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <p style={{
                textAlign: 'center',
                color: '#64748b',
                padding: '2rem'
              }}>
                Tu carrito está vacío
              </p>
            ) : (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#1e293b'
                        }}>
                          {item.name}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#64748b'
                        }}>
                          S/ {item.price.toFixed(2)} c/u
                        </p>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          -
                        </button>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          minWidth: '20px',
                          textAlign: 'center'
                        }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            background: '#f3f4f6',
                            border: 'none',
                            borderRadius: '4px',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderTop: '2px solid #e2e8f0',
                  marginBottom: '1rem'
                }}>
                  <span style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1e293b'
                  }}>
                    Total: S/ {getTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleOrder}
                  style={{
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  🚀 Enviar Pedido
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}