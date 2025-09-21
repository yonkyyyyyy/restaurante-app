import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

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
        console.log('🛒 Carrito actualizado (existente):', newCart);
        return newCart;
      }
      const newCart = [...prev, { ...item, quantity: 1 }];
      console.log('🛒 Carrito actualizado (nuevo):', newCart);
      return newCart;
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('💰 Total calculado:', total, 'Carrito:', cart);
    return total;
  };

  const handleOrder = async () => {
    console.log('🛒 Intentando hacer pedido...');
    console.log('🛒 Carrito:', cart);
    console.log('🛒 Cliente:', customerInfo);
    console.log('🛒 TableId:', tableId);
    console.log('🛒 Acciones disponibles:', Object.keys(actions));
    
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
      
      const response = await fetch('http://192.168.0.9:3001/api/orders', {
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
      padding: '1rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            🍽️ Menú Digital
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Mesa {tableId} • Haz tu pedido directamente
          </p>
        </div>
      </div>

      {/* Información del cliente */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '1rem'
        }}>
          Información del Cliente
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Nombre *
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Tu nombre"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '500',
              color: '#374151'
            }}>
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Tu teléfono"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>
      </div>

      {/* Botón del carrito */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '1rem',
          right: '1rem',
          zIndex: 50
        }}>
          <button
            onClick={() => setShowCart(true)}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              padding: '1rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>🛒</span>
            Ver Carrito ({cart.length})
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem'
            }}>
              S/ {getTotal().toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Menú por categorías */}
      {Object.entries(menuByCategory).map(([category, items]) => (
        <div key={category} style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '1rem',
            textTransform: 'capitalize'
          }}>
            {category}
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {items.map(item => (
              <div key={item.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {item.name}
                    </h3>
                    <p style={{
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      color: '#10b981'
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
                      padding: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}
                  >
                    Agregar
                  </button>
                </div>
                {!item.available && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#ef4444',
                    fontStyle: 'italic'
                  }}>
                    No disponible
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal del carrito */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
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
                  borderTop: '2px solid #e2e8f0',
                  paddingTop: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <span style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      Total:
                    </span>
                    <span style={{
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      S/ {getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  style={{
                    width: '100%',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Enviar Pedido
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
