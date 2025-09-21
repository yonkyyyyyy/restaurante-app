import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useAuth();

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [ROLES.ADMIN]: 'Administrador',
      [ROLES.MESERO]: 'Mesero',
      [ROLES.COCINERO]: 'Cocinero',
      [ROLES.CAJERO]: 'Cajero'
    };
    return roleNames[role] || role;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        userRole={state.user?.role}
      />
      
      {/* Main Content */}
      <div style={{ marginLeft: sidebarOpen ? '250px' : '0', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          user={state.user}
          roleDisplayName={getRoleDisplayName(state.user?.role)}
        />
        
        {/* Page Content */}
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
