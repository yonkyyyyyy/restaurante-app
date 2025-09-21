import React, { useState } from "react";

// OrdersDashboard.jsx
// React component with:
// - Orders list as cards
// - Modal for order details
// - Modal for creating a new order
// Tailwind CSS for styling

export default function OrdersDashboard() {
  const sampleProducts = [
    { id: 1, name: "Lomo Saltado", price: 18 },
    { id: 2, name: "Pollo a la Brasa (1/4)", price: 12 },
    { id: 3, name: "Chicha Morada", price: 7.25 },
    { id: 4, name: "Soda", price: 3 }
  ];

  const initialOrders = [
    {
      id: 101,
      client: "Juan Pérez",
      phone: "987654321",
      total: 32.5,
      status: "pending",
      payment: "unpaid",
      createdAt: "2025-09-19T10:12:00",
      items: [
        { name: "Lomo Saltado", qty: 1, price: 18 },
        { name: "Chicha Morada", qty: 2, price: 7.25 }
      ]
    }
  ];

  const [orders, setOrders] = useState(initialOrders);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [cart, setCart] = useState([]);
  const [client, setClient] = useState({ name: "", phone: "" });
  const [payment, setPayment] = useState("efectivo");

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  function updateOrder(id, patch) {
    setOrders((prev) => prev.map(o => o.id === id ? { ...o, ...patch } : o));
  }

  function markPaid(id) {
    updateOrder(id, { payment: "paid" });
  }

  function cycleStatus(id) {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const seq = ["pending", "preparing", "ready", "delivered"];
    const i = seq.indexOf(order.status);
    const next = i === -1 || i === seq.length - 1 ? seq[0] : seq[i+1];
    updateOrder(id, { status: next });
  }

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
      id: Date.now(),
      client: client.name,
      phone: client.phone,
      total,
      status: "pending",
      payment,
      createdAt: new Date().toISOString(),
      items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }))
    };
    setOrders(prev => [newOrder, ...prev]);
    setShowNew(false);
    setCart([]);
    setClient({ name: "", phone: "" });
    setPayment("efectivo");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 relative">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Panel de Pedidos</h1>
        <div className="text-sm text-slate-600">Pedidos hoy: {orders.length}</div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map(order => (
          <article key={order.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-500">Pedido #{order.id}</div>
                <div className="text-lg font-medium mt-1">{order.client}</div>
                <div className="text-sm text-slate-500">{order.phone}</div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusBadge(order.status)}`}>
                  {order.status}
                </div>
                <div className="mt-2 text-lg font-semibold">S/ {order.total.toFixed(2)}</div>
                <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={() => cycleStatus(order.id)} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50">Cambiar estado</button>
              <button onClick={() => markPaid(order.id)} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">Marcar pagado</button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => setSelected(order)} className="text-sm text-sky-600 hover:underline">Ver detalle</button>
              <button onClick={() => updateOrder(order.id, { status: 'cancelled' })} className="text-sm text-red-600 hover:underline">Cancelar</button>
            </div>
          </article>
        ))}
      </main>

      {/* Botón flotante nuevo pedido */}
      <button onClick={() => setShowNew(true)} className="fixed bottom-6 right-6 bg-sky-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-sky-700">
        + Nuevo Pedido
      </button>

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detalle Pedido #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500">Cerrar</button>
            </header>
            <div className="grid grid-cols-1 gap-3">
              <div className="text-sm text-slate-600">Cliente: {selected.client} — {selected.phone}</div>
              <div>
                <h3 className="font-medium">Items</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {selected.items.map((it, idx) => (
                    <li key={idx}>{it.qty} x {it.name} — S/ {it.price.toFixed(2)}</li>
                  ))}
                </ul>
              </div>
              <div className="text-right font-semibold">Total: S/ {selected.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo pedido */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Nuevo Pedido</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-500">Cerrar</button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium">Cliente</label>
                <input value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} placeholder="Nombre" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" />
                <input value={client.phone} onChange={e => setClient({ ...client, phone: e.target.value })} placeholder="Teléfono" className="mt-2 w-full border rounded-lg px-3 py-2 text-sm" />

                <label className="block mt-4 text-sm font-medium">Método de pago</label>
                <select value={payment} onChange={e => setPayment(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </select>
              </div>

              {/* Productos */}
              <div>
                <h3 className="font-medium mb-2">Productos</h3>
                <ul className="space-y-2">
                  {sampleProducts.map(p => (
                    <li key={p.id} className="flex items-center justify-between text-sm">
                      <span>{p.name} — S/ {p.price.toFixed(2)}</span>
                      <button onClick={() => addToCart(p)} className="px-2 py-1 bg-sky-600 text-white rounded-lg text-xs">Añadir</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Carrito */}
            <div className="mt-6">
              <h3 className="font-medium mb-2">Carrito</h3>
              {cart.length === 0 && <p className="text-sm text-slate-500">Vacío</p>}
              {cart.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {cart.map(item => (
                    <li key={item.id} className="flex items-center justify-between">
                      <span>{item.qty} x {item.name}</span>
                      <span>S/ {(item.qty * item.price).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-600 text-xs">X</button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="text-right font-semibold mt-2">Total: S/ {cart.reduce((s, p) => s + p.qty * p.price, 0).toFixed(2)}</div>
            </div>

            <footer className="mt-6 flex justify-end">
              <button onClick={saveOrder} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Guardar Pedido</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
