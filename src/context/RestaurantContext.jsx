import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Estado inicial
const initialState = {
  menu: [
    { id: 1, name: 'Lomo Saltado', price: 18, category: 'platos', image: '/api/placeholder/300/200', available: true },
    { id: 2, name: 'Pollo a la Brasa (1/4)', price: 12, category: 'platos', image: '/api/placeholder/300/200', available: true },
    { id: 3, name: 'Chicha Morada', price: 7.25, category: 'bebidas', image: '/api/placeholder/300/200', available: true },
    { id: 4, name: 'Soda', price: 3, category: 'bebidas', image: '/api/placeholder/300/200', available: true },
    { id: 5, name: 'Ceviche de Pescado', price: 22, category: 'platos', image: '/api/placeholder/300/200', available: true },
    { id: 6, name: 'Arroz con Pollo', price: 15, category: 'platos', image: '/api/placeholder/300/200', available: true }
  ],
  orders: [
    {
      id: 101,
      client: "Juan Pérez",
      phone: "987654321",
      total: 32.5,
      status: "pending",
      payment: "unpaid",
      createdAt: "2025-01-19T10:12:00",
      items: [
        { name: "Lomo Saltado", quantity: 1, price: 18 },
        { name: "Chicha Morada", quantity: 2, price: 7.25 }
      ]
    },
    {
      id: 102,
      client: "María González",
      phone: "987654322",
      total: 45.0,
      status: "preparing",
      payment: "paid",
      createdAt: "2025-01-19T11:30:00",
      items: [
        { name: "Ceviche de Pescado", quantity: 1, price: 22 },
        { name: "Pollo a la Brasa (1/4)", quantity: 1, price: 12 },
        { name: "Soda", quantity: 2, price: 3 }
      ]
    }
  ],
  currentOrder: null,
  cart: [],
  loading: false,
  error: null
};

// Tipos de acciones
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  DELETE_ORDER: 'DELETE_ORDER',
  SET_CURRENT_ORDER: 'SET_CURRENT_ORDER',
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_ORDERS: 'LOAD_ORDERS'
};

// Reducer
function restaurantReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.ADD_ORDER:
      return {
        ...state,
        orders: [action.payload, ...state.orders],
        cart: [],
        loading: false
      };
    
    case ACTIONS.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, ...action.payload.updates } : order
        )
      };
    
    case ACTIONS.DELETE_ORDER:
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload)
      };
    
    case ACTIONS.SET_CURRENT_ORDER:
      return { ...state, currentOrder: action.payload };
    
    case ACTIONS.ADD_TO_CART:
      const existingItem = state.cart.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          cart: state.cart.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }]
      };
    
    case ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload)
      };
    
    case ACTIONS.CLEAR_CART:
      return { ...state, cart: [] };
    
    case ACTIONS.LOAD_ORDERS:
      return { ...state, orders: action.payload };
    
    default:
      return state;
  }
}

// Context
const RestaurantContext = createContext();

// Provider
export function RestaurantProvider({ children }) {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

      // Cargar órdenes del localStorage al inicializar
      useEffect(() => {
        const savedOrders = localStorage.getItem('restaurant-orders');
        if (savedOrders) {
          try {
            const orders = JSON.parse(savedOrders);
            dispatch({ type: ACTIONS.LOAD_ORDERS, payload: orders });
            console.log('📂 Órdenes cargadas desde localStorage:', orders);
          } catch (error) {
            console.error('Error loading orders:', error);
          }
        }
      }, []);

      // Escuchar eventos de nuevas órdenes desde otras pestañas
      useEffect(() => {
        const handleNewOrder = (event) => {
          const { order, allOrders } = event.detail;
          console.log('🔄 Sincronizando pedido desde otra pestaña:', order);
          console.log('🔄 Total de pedidos recibidos:', allOrders.length);
          dispatch({ type: ACTIONS.SET_ORDERS, payload: allOrders });
        };

        // Escuchar cambios en localStorage
        const handleStorageChange = (e) => {
          if (e.key === 'restaurant-orders' && e.newValue) {
            try {
              const orders = JSON.parse(e.newValue);
              console.log('🔄 Sincronización desde localStorage:', orders);
              dispatch({ type: ACTIONS.SET_ORDERS, payload: orders });
            } catch (error) {
              console.error('Error al sincronizar:', error);
            }
          }
        };

        // Polling manual cada 2 segundos para verificar cambios
        const pollingInterval = setInterval(() => {
          const storedOrders = localStorage.getItem('restaurant-orders');
          if (storedOrders) {
            try {
              const orders = JSON.parse(storedOrders);
              if (orders.length !== state.orders.length) {
                console.log('🔄 Polling detectó cambio:', orders.length, 'vs', state.orders.length);
                console.log('🔄 Actualizando estado desde polling...');
                dispatch({ type: ACTIONS.SET_ORDERS, payload: orders });
              }
            } catch (error) {
              console.error('Error en polling:', error);
            }
          }
        }, 2000);

        window.addEventListener('restaurant-order-added', handleNewOrder);
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
          window.removeEventListener('restaurant-order-added', handleNewOrder);
          window.removeEventListener('storage', handleStorageChange);
          clearInterval(pollingInterval);
        };
      }, [state.orders.length]);

  // Guardar órdenes en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('restaurant-orders', JSON.stringify(state.orders));
  }, [state.orders]);

  // Acciones
  const actions = {
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    
    addOrder: (orderData) => {
      const newOrder = {
        id: Date.now(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        total: orderData.total || state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
      dispatch({ type: ACTIONS.ADD_ORDER, payload: newOrder });
    },

    // Función específica para pedidos de clientes
    addCustomerOrder: (orderData) => {
      console.log('🔄 addCustomerOrder llamado con:', orderData);
      
      const newOrder = {
        id: Date.now(),
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        source: 'customer_menu'
      };
      
      console.log('📝 Nuevo pedido creado:', newOrder);
      
      // Obtener pedidos actuales del localStorage
      const currentOrders = JSON.parse(localStorage.getItem('restaurant-orders') || '[]');
      console.log('📋 Pedidos actuales en localStorage:', currentOrders);
      
      // Agregar el nuevo pedido
      const updatedOrders = [...currentOrders, newOrder];
      console.log('📋 Pedidos actualizados:', updatedOrders);
      
      // Guardar en localStorage inmediatamente
      localStorage.setItem('restaurant-orders', JSON.stringify(updatedOrders));
      console.log('💾 Pedido guardado en localStorage, total:', updatedOrders.length);
      
      // Actualizar el estado local
      dispatch({ type: ACTIONS.SET_ORDERS, payload: updatedOrders });
      
      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new CustomEvent('restaurant-order-added', {
        detail: { order: newOrder, allOrders: updatedOrders }
      }));
      
      console.log('✅ Pedido procesado completamente');
      return newOrder;
    },
    
    updateOrder: (id, updates) => {
      dispatch({ type: ACTIONS.UPDATE_ORDER, payload: { id, updates } });
    },
    
    deleteOrder: (id) => {
      dispatch({ type: ACTIONS.DELETE_ORDER, payload: id });
    },
    
    setCurrentOrder: (order) => {
      dispatch({ type: ACTIONS.SET_CURRENT_ORDER, payload: order });
    },
    
    addToCart: (item) => {
      dispatch({ type: ACTIONS.ADD_TO_CART, payload: item });
    },
    
    removeFromCart: (id) => {
      dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: id });
    },
    
    clearCart: () => {
      dispatch({ type: ACTIONS.CLEAR_CART });
    },
    
    // Funciones de utilidad
    getOrdersByStatus: (status) => {
      return state.orders.filter(order => order.status === status);
    },
    
    getTotalRevenue: () => {
      return state.orders
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => sum + order.total, 0);
    },
    
    getCartTotal: () => {
      return state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
  };

  return (
    <RestaurantContext.Provider value={{ state, actions }}>
      {children}
    </RestaurantContext.Provider>
  );
}

// Hook personalizado
export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant debe ser usado dentro de RestaurantProvider');
  }
  return context;
}