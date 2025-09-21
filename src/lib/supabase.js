import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Funciones de base de datos
export const db = {
  // Usuarios
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
    return { data, error }
  },

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    return { data, error }
  },

  // Productos
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createProduct(productData) {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
    return { data, error }
  },

  async updateProduct(id, productData) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteProduct(id) {
    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Pedidos
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createOrder(orderData) {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
    return { data, error }
  },

  async updateOrderStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async deleteOrder(id) {
    const { data, error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  // Reportes
  async getOrdersByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async getTotalRevenue() {
    const { data, error } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'completed')
    return { data, error }
  }
}
