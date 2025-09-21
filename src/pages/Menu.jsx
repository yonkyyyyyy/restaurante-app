import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { ROLES } from '../context/AuthContext';

export default function Menu() {
  const { state: authState } = useAuth();
  const { state: restaurantState, actions } = useRestaurant();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'platos',
    available: true
  });

  // Solo admin puede gestionar el menú
  if (authState.user?.role !== ROLES.ADMIN) {
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
          Solo los administradores pueden gestionar el menú.
        </p>
      </div>
    );
  }

  const categories = ['platos', 'bebidas', 'postres', 'entradas'];

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      alert('Por favor completa todos los campos');
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      available: newProduct.available,
      image: '/api/placeholder/300/200'
    };

    // Aquí se agregaría al contexto
    console.log('Nuevo producto:', product);
    alert('Producto agregado exitosamente');
    
    setNewProduct({ name: '', price: '', category: 'platos', available: true });
    setShowAddProduct(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      available: product.available
    });
    setShowAddProduct(true);
  };

  const handleUpdateProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price) {
      alert('Por favor completa todos los campos');
      return;
    }

    const updatedProduct = {
      ...editingProduct,
      name: newProduct.name.trim(),
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      available: newProduct.available
    };

    console.log('Producto actualizado:', updatedProduct);
    alert('Producto actualizado exitosamente');
    
    setNewProduct({ name: '', price: '', category: 'platos', available: true });
    setEditingProduct(null);
    setShowAddProduct(false);
  };

  const toggleProductAvailability = (productId) => {
    console.log('Cambiar disponibilidad del producto:', productId);
    alert('Disponibilidad actualizada');
  };

  const formatCurrency = (amount) => `S/ ${amount.toFixed(2)}`;

  // Agrupar productos por categoría
  const menuByCategory = restaurantState.menu.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>
          🍽️ Gestión de Menú
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Administra los productos y categorías del menú
        </p>
      </div>

      {/* Botón agregar producto */}
      <div className="card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 className="card-title">Productos del Menú</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Total: {restaurantState.menu.length} productos
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setNewProduct({ name: '', price: '', category: 'platos', available: true });
              setShowAddProduct(true);
            }}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>➕</span>
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Menú por categorías */}
      {Object.entries(menuByCategory).map(([category, products]) => (
        <div key={category} className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ textTransform: 'capitalize' }}>
              {category} ({products.length})
            </h3>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {products.map(product => (
              <div key={product.id} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                background: product.available ? 'white' : '#f9fafb',
                opacity: product.available ? 1 : 0.7
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '0.25rem'
                    }}>
                      {product.name}
                    </h4>
                    <p style={{
                      fontSize: '1.125rem',
                      fontWeight: 'bold',
                      color: '#10b981',
                      marginBottom: '0.5rem'
                    }}>
                      {formatCurrency(product.price)}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        background: product.available ? '#d1fae5' : '#fee2e2',
                        color: product.available ? '#065f46' : '#991b1b'
                      }}>
                        {product.available ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => handleEditProduct(product)}
                    style={{
                      flex: 1,
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => toggleProductAvailability(product.id)}
                    style={{
                      flex: 1,
                      background: product.available ? '#f59e0b' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {product.available ? '⏸️ Pausar' : '▶️ Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal agregar/editar producto */}
      {showAddProduct && (
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
            padding: '2rem',
            maxWidth: '500px',
            width: '100%'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', price: '', category: 'platos', available: true });
                }}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Lomo Saltado"
                  style={{
                    width: '100%',
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
                  Precio (S/) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Ej: 18.50"
                  style={{
                    width: '100%',
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
                  Categoría *
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem'
                  }}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <input
                  type="checkbox"
                  id="available"
                  checked={newProduct.available}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, available: e.target.checked }))}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="available" style={{
                  fontSize: '0.875rem',
                  color: '#374151',
                  cursor: 'pointer'
                }}>
                  Producto disponible
                </label>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => {
                  setShowAddProduct(false);
                  setEditingProduct(null);
                  setNewProduct({ name: '', price: '', category: 'platos', available: true });
                }}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                style={{
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {editingProduct ? 'Actualizar' : 'Agregar'} Producto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}