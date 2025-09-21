import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { db } from './supabase.js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Generar token JWT
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// Verificar token JWT
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Hash de contraseña
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

// Verificar contraseña
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

// Middleware de autenticación
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' })
  }

  const user = verifyToken(token)
  if (!user) {
    return res.status(403).json({ error: 'Token inválido' })
  }

  req.user = user
  next()
}

// Middleware de autorización por roles
export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    next()
  }
}

// Función de login
export const login = async (email, password) => {
  try {
    const { data: user, error } = await db.getUserByEmail(email)
    
    if (error || !user) {
      return { success: false, message: 'Credenciales inválidas' }
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, message: 'Credenciales inválidas' }
    }

    const token = generateToken(user)
    return { 
      success: true, 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      } 
    }
  } catch (error) {
    return { success: false, message: 'Error en el servidor' }
  }
}

// Función de registro
export const register = async (userData) => {
  try {
    const { data: existingUser } = await db.getUserByEmail(userData.email)
    
    if (existingUser) {
      return { success: false, message: 'El usuario ya existe' }
    }

    const hashedPassword = await hashPassword(userData.password)
    const newUser = {
      ...userData,
      password: hashedPassword,
      created_at: new Date().toISOString()
    }

    const { data, error } = await db.createUser(newUser)
    
    if (error) {
      return { success: false, message: 'Error al crear usuario' }
    }

    const token = generateToken(data[0])
    return { 
      success: true, 
      token, 
      user: { 
        id: data[0].id, 
        email: data[0].email, 
        role: data[0].role,
        name: data[0].name 
      } 
    }
  } catch (error) {
    return { success: false, message: 'Error en el servidor' }
  }
}

