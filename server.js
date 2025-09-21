import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento persistente en archivo JSON
const ordersFile = path.join(__dirname, 'data', 'orders.json');

// Crear directorio data si no existe
if (!fs.existsSync(path.dirname(ordersFile))) {
  fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
}

// Cargar pedidos desde archivo
let orders = [];
try {
  if (fs.existsSync(ordersFile)) {
    const data = fs.readFileSync(ordersFile, 'utf8');
    orders = JSON.parse(data);
    console.log('📁 Pedidos cargados desde archivo:', orders.length);
  }
} catch (error) {
  console.log('⚠️ Error al cargar pedidos desde archivo:', error.message);
  orders = [];
}

// Función para guardar pedidos
const saveOrders = () => {
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    console.log('💾 Pedidos guardados en archivo');
  } catch (error) {
    console.error('❌ Error al guardar pedidos:', error);
  }
};

// Ruta para obtener todos los pedidos
app.get('/api/orders', (req, res) => {
  try {
    console.log('📋 Obteniendo pedidos:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// Ruta para crear un nuevo pedido
app.post('/api/orders', (req, res) => {
  try {
    const orderData = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    orders.push(orderData);
    saveOrders();
    console.log('📝 Nuevo pedido creado:', orderData);
    res.json(orderData);
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

// Ruta para actualizar el estado de un pedido
app.put('/api/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment } = req.body;
    
    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Actualizar status si se proporciona
    if (status) {
      orders[orderIndex].status = status;
    }
    
    // Actualizar payment si se proporciona
    if (payment) {
      orders[orderIndex].payment = payment;
    }
    
    orders[orderIndex].updated_at = new Date().toISOString();
    saveOrders();
    
    console.log('✅ Pedido actualizado:', orders[orderIndex]);
    res.json(orders[orderIndex]);
  } catch (error) {
    console.error('❌ Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
});

// Ruta para eliminar un pedido
app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const orderIndex = orders.findIndex(order => order.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    orders.splice(orderIndex, 1);
    saveOrders();
    
    console.log('🗑️ Pedido eliminado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas del frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/order-links', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/menu/:tableId', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Cualquier otra ruta
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Servidor robusto corriendo en puerto', PORT);
  console.log('📱 API disponible en http://0.0.0.0:' + PORT + '/api');
  console.log('🌐 Frontend disponible en http://0.0.0.0:' + PORT);
  console.log('💾 Almacenamiento: Archivo JSON persistente');
});
