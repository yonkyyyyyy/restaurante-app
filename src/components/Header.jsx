// src/components/Header.jsx
import React from 'react';
import './Header.css'; // Para estilos específicos si quieres

function Header() {
  return (
    <header className="header">
      <h1>Mi Restaurante</h1>
      <nav>
        <ul className="nav-list">
          <li>Inicio</li>
          <li>Menú</li>
          <li>Contacto</li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
