import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qctynsnqagumashmixn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjdHluc25xYWd1bWFzaG1pd3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjE2NTgsImV4cCI6MjA3Mzk5NzY1OH0.nI3duiLYsWG8TLeNaFv6e3j09qke8kqNcIERJql_aYo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🔧 Configurando base de datos...');
  
  try {
    // Verificar si la tabla orders existe
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error al acceder a la tabla orders:', error.message);
      console.log('💡 Necesitas crear la tabla en Supabase primero');
      return;
    }
    
    console.log('✅ Tabla orders existe y es accesible');
    console.log('📊 Pedidos actuales:', data.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupDatabase();
