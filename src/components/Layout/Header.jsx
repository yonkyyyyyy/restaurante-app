import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onMenuClick, user, roleDisplayName }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { actions } = useAuth();

  const handleLogout = () => {
    actions.logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        {/* Left side */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onMenuClick}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              color: 'white',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              cursor: 'pointer',
              marginRight: '1rem'
            }}
          >
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="logo">
            <div className="logo-icon">
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span>Sistema de Restaurante</span>
          </div>
        </div>

        {/* Right side */}
        <div className="user-info">
          {/* Notifications */}
          <button style={{
            padding: '0.5rem',
            color: 'rgba(255,255,255,0.8)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5L9 15H4.5v4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            </svg>
            <span style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444'
            }}></span>
          </button>

          {/* User menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                cursor: 'pointer',
                color: 'white'
              }}
            >
              <div className="user-avatar">
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div style={{ textAlign: 'left', minWidth: '120px', overflow: 'visible' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, whiteSpace: 'nowrap', overflow: 'visible' }}>{user?.name || 'Usuario'}</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', margin: 0, whiteSpace: 'nowrap', overflow: 'visible' }}>{roleDisplayName}</p>
              </div>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '0.5rem',
                width: '200px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 50,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e293b', margin: 0 }}>{user?.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>{user?.email}</p>
                  <p style={{ fontSize: '0.75rem', color: '#2563eb', margin: 0 }}>{roleDisplayName}</p>
                </div>
                
                <button style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Mi Perfil
                </button>
                
                <button style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                  color: '#374151',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Configuración
                </button>
                
                <div style={{ borderTop: '1px solid #e2e8f0' }}></div>
                
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#dc2626',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
