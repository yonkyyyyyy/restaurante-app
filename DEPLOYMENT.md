# 🚀 Guía de Deployment Profesional

## 📊 PASO 1: CONFIGURAR SUPABASE

1. **Crear cuenta en Supabase**: https://supabase.com
2. **Crear nuevo proyecto**
3. **Ejecutar el esquema SQL**:
   ```sql
   -- Copiar y ejecutar el contenido de database/schema.sql
   ```
4. **Obtener credenciales**:
   - URL del proyecto
   - Clave anónima

## 🔐 PASO 2: CONFIGURAR VARIABLES DE ENTORNO

```bash
# Crear archivo .env
JWT_SECRET=tu-clave-secreta-muy-segura
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-clave-anonima
```

## ☁️ PASO 3: DEPLOYMENT EN RAILWAY

1. **Instalar Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login y deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configurar variables**:
   ```bash
   railway variables set JWT_SECRET=tu-clave-secreta
   railway variables set SUPABASE_URL=tu-url
   railway variables set SUPABASE_KEY=tu-clave
   ```

## 🌐 PASO 4: DEPLOYMENT EN VERCEL

1. **Instalar Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configurar variables en Vercel Dashboard**

## 📱 PASO 5: DEPLOYMENT DEL FRONTEND

1. **Build del proyecto**:
   ```bash
   npm run build
   ```

2. **Deploy en Vercel/Netlify**:
   - Conectar repositorio
   - Configurar build command: `npm run build`
   - Configurar publish directory: `dist`

## 🔧 CONFIGURACIÓN FINAL

### URLs de Producción:
- **Backend**: `https://tu-app.railway.app`
- **Frontend**: `https://tu-app.vercel.app`
- **Base de Datos**: Supabase Dashboard

### Credenciales por Defecto:
- **Admin**: admin@restaurante.com / password
- **Mesero**: mesero@restaurante.com / password  
- **Embalador**: embalador@restaurante.com / password

## 🚀 COMANDOS DE DESARROLLO

```bash
# Desarrollo local
npm run dev

# Servidor de producción
npm run server

# Build para producción
npm run build

# Deploy
npm run deploy
```

## 📊 MONITOREO

- **Logs**: Railway Dashboard
- **Base de Datos**: Supabase Dashboard
- **Analytics**: Supabase Analytics
- **Performance**: Vercel Analytics


