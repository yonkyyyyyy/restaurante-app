import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://qctynsnqagumashmixn.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdHluc25xYWd1bWFzaG1pd3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjE2NTgsImV4cCI6MjA3Mzk5NzY1OH0.nI3duiLYsWG8TLeNaFv6e3j09qke8kqNcIERJql_aYo';
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Almacenamiento persistente en archivo JSON
import fs from 'fs';
const ordersFile = path.join(__dirname, 'data', 'orders.json');

// Crear directorio data si no existe
if (!fs.existsSync(path.dirname(ordersFile))) {
  fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
}

// Cargar pedidos desde archivo
let tempOrders = [];
try {
  if (fs.existsSync(ordersFile)) {
    const data = fs.readFileSync(ordersFile, 'utf8');
    tempOrders = JSON.parse(data);
    console.log('📁 Pedidos cargados desde archivo:', tempOrders.length);
  }
} catch (error) {
  console.log('⚠️ Error al cargar pedidos desde archivo:', error.message);
  tempOrders = [];
}

// Función para guardar pedidos
const saveOrders = () => {
  try {
    fs.writeFileSync(ordersFile, JSON.stringify(tempOrders, null, 2));
    console.log('💾 Pedidos guardados en archivo');
  } catch (error) {
    console.error('❌ Error al guardar pedidos:', error);
  }
};

// Rutas de API
app.get('/api/orders', async (req, res) => {
  try {
    // Intentar conectar a Supabase primero
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log('⚠️ Error de Supabase, usando almacenamiento persistente:', error.message);
        res.json(tempOrders);
        return;
      }
      
      console.log('📋 Obteniendo pedidos desde Supabase:', data.length);
      res.json(data || []);
      return;
    } catch (supabaseError) {
      console.log('⚠️ Supabase no disponible, usando almacenamiento persistente:', supabaseError.message);
      res.json(tempOrders);
      return;
    }
  } catch (error) {
    console.error('❌ Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    // Intentar conectar a Supabase primero
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
      
      if (error) {
        console.log('⚠️ Error de Supabase, usando almacenamiento persistente:', error.message);
        tempOrders.push(orderData);
        saveOrders();
        console.log('📝 Nuevo pedido creado (persistente):', orderData);
        res.json(orderData);
        return;
      }
      
      console.log('📝 Nuevo pedido creado en Supabase:', data);
      res.json(data);
      return;
    } catch (supabaseError) {
      console.log('⚠️ Supabase no disponible, usando almacenamiento persistente:', supabaseError.message);
      tempOrders.push(orderData);
      saveOrders();
      console.log('📝 Nuevo pedido creado (persistente):', orderData);
      res.json(orderData);
      return;
    }
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error al actualizar estado:', error);
      return res.status(500).json({ error: 'Error al actualizar estado' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    console.log('✅ Estado actualizado:', data);
    res.json(data);
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error al eliminar pedido:', error);
      return res.status(500).json({ error: 'Error al eliminar pedido' });
    }
    
    console.log('🗑️ Pedido eliminado:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error al eliminar pedido:', error);
    res.status(500).json({ error: 'Error al eliminar pedido' });
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas específicas para React Router
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/menu', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/orders', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/order-links', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/menu/:tableId', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Ruta catch-all para cualquier otra ruta
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor simplificado corriendo en puerto ${PORT}`);
  console.log(`📱 API disponible en http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Frontend disponible en http://0.0.0.0:${PORT}`);
});