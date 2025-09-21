import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Roles del sistema
export const ROLES = {
  ADMIN: 'admin',
  CAJERO: 'cajero',
  EMBALADOR: 'embalador'
};

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Tipos de acciones
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, loading: true, error: null };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Context
const AuthContext = createContext();

// Usuarios de prueba (en producción esto vendría de una API)
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'Administrador',
    role: ROLES.ADMIN,
    email: 'admin@restaurante.com'
  },
  {
    id: 2,
    username: 'cajero1',
    password: 'cajero123',
    name: 'Luis Cajero',
    role: ROLES.CAJERO,
    email: 'luis@restaurante.com'
  },
  {
    id: 3,
    username: 'embalador1',
    password: 'embalador123',
    name: 'María Embaladora',
    role: ROLES.EMBALADOR,
    email: 'maria@restaurante.com'
  }
];

// Provider
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('restaurant-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      } catch (error) {
        localStorage.removeItem('restaurant-user');
      }
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Acciones
  const actions = {
    login: async (username, password) => {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUsers.find(u => u.username === username && u.password === password);
      
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem('restaurant-user', JSON.stringify(userWithoutPassword));
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userWithoutPassword });
        return { success: true };
      } else {
        const error = 'Usuario o contraseña incorrectos';
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error });
        return { success: false, error };
      }
    },
    
    logout: () => {
      localStorage.removeItem('restaurant-user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    },
    
    clearError: () => {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    },
    
    // Verificar permisos
    hasPermission: (requiredRole) => {
      if (!state.user) return false;
      
      const roleHierarchy = {
        [ROLES.ADMIN]: 3,
        [ROLES.CAJERO]: 2,
        [ROLES.EMBALADOR]: 1
      };
      
      return roleHierarchy[state.user.role] >= roleHierarchy[requiredRole];
    },
    
    // Verificar si es admin
    isAdmin: () => {
      return state.user?.role === ROLES.ADMIN;
    }
  };

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

