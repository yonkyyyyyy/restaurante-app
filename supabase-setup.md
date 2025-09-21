# 🚀 CONFIGURACIÓN DE SUPABASE - PASO A PASO

## 📊 PASO 1: CREAR CUENTA EN SUPABASE

1. **Ir a**: https://supabase.com
2. **Hacer clic en "Start your project"**
3. **Registrarse** con GitHub/Google
4. **Crear nuevo proyecto**

## 🔐 PASO 2: CONFIGURAR PROYECTO

1. **Nombre del proyecto**: `restaurante-app`
2. **Contraseña de base de datos**: Generar automáticamente
3. **Región**: Seleccionar la más cercana
4. **Hacer clic en "Create new project"**

## 📋 PASO 3: EJECUTAR ESQUEMA SQL

1. **Ir a**: SQL Editor en el dashboard
2. **Crear nueva consulta**
3. **Copiar y pegar** el contenido de `database/schema.sql`
4. **Ejecutar** la consulta

## 🔑 PASO 4: OBTENER CREDENCIALES

1. **Ir a**: Settings > API
2. **Copiar**:
   - Project URL
   - anon/public key

## 📝 PASO 5: CONFIGURAR VARIABLES

Crear archivo `.env` en la raíz:
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anonima
JWT_SECRET=restaurante-super-secret-jwt-key-2024
PORT=3001
```

## ✅ RESULTADO ESPERADO

- ✅ Base de datos configurada
- ✅ Tablas creadas (users, products, orders)
- ✅ Datos de ejemplo insertados
- ✅ Credenciales obtenidas
- ✅ Variables configuradas

## 🚀 PRÓXIMO PASO

Una vez configurado Supabase, procederemos con el deployment en Railway.

