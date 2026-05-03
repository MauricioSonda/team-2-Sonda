# 🍅 Salsa de Tomate — Frontend

Aplicación web de recetas construida en **React 19 + Vite + Tailwind CSS**. Permite explorar, crear y gestionar recetas con un sistema de membresía premium integrado con Stripe.

**Producción:** `https://front-salsa.vercel.app`  
**Backend:** `https://salsadetomatebacknet-production.up.railway.app`

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | React 19 |
| Build tool | Vite 7 |
| Estilos | Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| HTTP | Axios |
| Editor de texto | React Quill |
| Deploy | Vercel |

---

## Estructura del proyecto

```
src/
├── api/
│   └── axios.js              # Cliente HTTP con interceptores de auth
├── assets/                   # Imágenes, logos y recursos estáticos
├── components/
│   ├── Modals.jsx             # Modales reutilizables
│   ├── PremiumRoute.jsx       # Guard de ruta para usuarios premium
│   └── Toast.jsx              # Notificaciones toast
├── hooks/
│   └── usePremium.js          # Hook para verificar estado de suscripción
├── pages/
│   ├── LandingPage.jsx        # Página de inicio pública
│   ├── Login.jsx              # Login con email/contraseña
│   ├── Register.jsx           # Registro de usuario
│   ├── Explore.jsx            # Explorar recetas (requiere premium)
│   ├── RecipeDetail.jsx       # Detalle de receta con modo cocina
│   ├── RecipeEditor.jsx       # Crear y editar recetas
│   ├── RecipeMedia.jsx        # Gestión de fotos y videos
│   ├── MyRecipes.jsx          # Mis recetas (borrador y publicadas)
│   ├── Categories.jsx         # Gestión de categorías
│   ├── Premium.jsx            # Planes de suscripción + checkout Stripe
│   ├── PremiumSuccess.jsx     # Confirmación post-pago
│   ├── PremiumCancel.jsx      # Cancelación de checkout
│   ├── CookingMode.jsx        # Modo cocina paso a paso
└── App.jsx                    # Rutas principales
```

---

## Requisitos locales

- [Node.js 20+](https://nodejs.org/)
- npm o yarn
- Backend corriendo en `http://localhost:5000`

---

## Instalación y configuración local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/salsadetomate-frontend.git
cd salsadetomate-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea el archivo `.env` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_DE_STRIPE
```

### 4. Correr en desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base del backend | `http://localhost:5000` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe | `pk_test_...` |

---

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Landing page con recetas destacadas |
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de usuario |
| `/explore` | 🔒 Premium | Explorar todas las recetas |
| `/recipe/:id` | 🔒 Premium | Detalle de receta |
| `/recipe/:id/cook` | 🔒 Premium | Modo cocina paso a paso |
| `/create` | 🔑 Auth | Crear nueva receta |
| `/edit/:id` | 🔑 Auth | Editar receta propia |
| `/edit/:id/media` | 🔑 Auth | Gestionar fotos y videos |
| `/my-recipes` | 🔑 Auth | Mis recetas |
| `/categories` | 🔑 Auth | Gestionar categorías |
| `/premium` | Público | Planes de suscripción |
| `/premium/success` | Público | Confirmación de pago |
| `/premium/cancel` | Público | Cancelación de pago |

> 🔒 **Premium** — requiere suscripción activa  
> 🔑 **Auth** — requiere solo estar autenticado

---

## Funcionalidades principales

### Autenticación
- Registro e inicio de sesión con email y contraseña
- Persistencia de sesión con token en `localStorage`

### Recetas
- Crear recetas con editor enriquecido (título, descripción, porciones, tiempos)
- Agregar ingredientes con cantidades, unidades y valores nutricionales
- Agregar pasos de preparación numerados
- Subir foto principal y galería de imágenes
- Agregar video (subida directa o enlace de YouTube)
- Publicar/despublicar recetas
- Sistema de likes, comentarios y calificaciones 1-5 estrellas
- Colecciones personales de recetas favoritas

### Modo cocina paso a paso
- Vista fullscreen optimizada para cocinar
- Un paso a la vez con navegación limpia
- Temporizador automático (detecta minutos mencionados en el paso)
- WakeLock: la pantalla no se apaga mientras cocinas
- Navegación con flechas del teclado `←` `→`
- Checklist de ingredientes desplegable en cualquier paso
- Calificación de 1-5 estrellas al terminar

### Suscripción premium (Stripe)
- Selector de plan mensual o anual
- Checkout hospedado en Stripe (no almacenamos datos de tarjeta)
- Portal de facturación para gestionar o cancelar
- Verificación de suscripción activa en tiempo real

---

## Build para producción

```bash
npm run build
```

Los archivos estáticos se generan en `dist/`.

---

## Despliegue en Vercel

### Requisitos para React Router en Vercel

Incluye el archivo `vercel.json` en la raíz del proyecto:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Sin este archivo, recargar la página en cualquier ruta que no sea `/` dará un error 404.

### Variables de entorno en Vercel

En **Vercel → tu proyecto → Settings → Environment Variables** agrega:

```
VITE_API_URL                = https://salsadetomatebacknet-production.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_...
```

### Pasos para desplegar

```bash
# 1. Haz push de tu código a GitHub
git add .
git commit -m "deploy"
git push origin main

# Vercel detecta el push y despliega automáticamente
# O importa el repo manualmente en vercel.com
```

---