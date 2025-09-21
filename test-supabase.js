import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'https://qctynsnqagumashmixn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdHluc25xYWd1bWFzaG1pd3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjE2NTgsImV4cCI6MjA3Mzk5NzY1OH0.nI3duiLYsWG8TLeNaFv6e3j09qke8kqNcIERJql_aYo';

console.log('🔧 Probando conexión a Supabase...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Intentando conectar...');
    
    // Probar una consulta simple
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
      console.log('💡 Detalles:', error);
    } else {
      console.log('✅ Conexión exitosa!');
      console.log('📊 Datos:', data);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

testConnection();
