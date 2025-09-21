import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar módulos de autenticación y base de datos
import { authenticateToken, authorizeRole, login, register } from './src/lib/auth.js';
import { db } from './src/lib/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const result = await register(req.body);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Rutas de productos
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await db.getProducts();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.post('/api/products', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await db.createProduct(req.body);
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/api/products/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await db.updateProduct(req.params.id, req.body);
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.delete('/api/products/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await db.deleteProduct(req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// Rutas de pedidos
app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await db.getOrders();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await db.createOrder(orderData);
    if (error) throw error;
    
    console.log('📝 Nuevo pedido creado:', data[0]);
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const { data, error } = await db.updateOrderStatus(req.params.id, status);
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

app.delete('/api/orders/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await db.deleteOrder(req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// Rutas de reportes
app.get('/api/reports/revenue', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { data, error } = await db.getTotalRevenue();
    if (error) throw error;
    
    const totalRevenue = data.reduce((sum, order) => sum + order.total, 0);
    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
});

app.get('/api/reports/orders', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { data, error } = await db.getOrdersByDateRange(startDate, endDate);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor profesional corriendo en puerto ${PORT}`);
  console.log(`📱 API disponible en http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend disponible en http://0.0.0.0:${PORT}`);
});