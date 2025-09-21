import React from 'react';
import './Menu.css';

function Menu() {
  const platos = [
    { id: 1, nombre: 'Pizza Margherita', precio: '$12', img: '/assets/pizza.jpg' },
    { id: 2, nombre: 'Hamburguesa', precio: '$10', img: '/assets/burger.jpg' },
    { id: 3, nombre: 'Ensalada César', precio: '$8', img: '/assets/salad.jpg' },
  ];

  return (
    <section className="menu">
      <h2>Menú</h2>
      <div className="platos">
        {platos.map(plato => (
          <div key={plato.id} className="plato">
            <img src={plato.img} alt={plato.nombre} />
            <h3>{plato.nombre}</h3>
            <p>{plato.precio}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Menu;
