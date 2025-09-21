import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento en memoria para pedidos
let orders = [];

// Rutas de API
app.get('/api/orders', (req, res) => {
  console.log('📋 Obteniendo pedidos:', orders.length);
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  try {
    const order = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    orders.push(order);
    console.log('📝 Nuevo pedido creado:', order);
    res.json(order);
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updated_at = new Date().toISOString();
    
    console.log('✅ Estado actualizado:', orders[orderIndex]);
    res.json(orders[orderIndex]);
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    orders.splice(orderIndex, 1);
    console.log('🗑️ Pedido eliminado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta catch-all para React Router (debe ir al final)
app.get('*', (req, res) => {
  // Solo servir index.html para rutas que no sean API
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor simplificado corriendo en puerto ${PORT}`);
  console.log(`📱 API disponible en http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend disponible en http://0.0.0.0:${PORT}`);
});