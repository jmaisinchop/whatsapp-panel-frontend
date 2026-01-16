# WhatsApp Panel Frontend - Kika

Frontend completo para el sistema de gestión de WhatsApp Panel construido con React + Vite.

## 🚀 Características

- **Autenticación JWT** con manejo de sesiones
- **Tiempo real** con Socket.IO para mensajes y notificaciones
- **Dashboard** con estadísticas y gráficos de encuestas
- **Chat en vivo** con envío de mensajes y archivos multimedia
- **Gestión de usuarios** (solo admin)
- **Configuración** del bot y WhatsApp (solo admin)
- **Diseño responsive** para móvil y desktop

## 📁 Estructura del Proyecto

```
src/
├── components/        # Componentes reutilizables
│   ├── Layout.jsx    # Layout principal con sidebar
│   ├── Modal.jsx     # Modal reutilizable
│   ├── Toast.jsx     # Notificaciones toast
│   ├── Loading.jsx   # Spinners y loading states
│   └── EmptyState.jsx
│
├── context/          # React Context para estado global
│   ├── AuthContext.jsx    # Autenticación
│   ├── SocketContext.jsx  # WebSocket connection
│   ├── ChatContext.jsx    # Estado de chats
│   └── ToastContext.jsx   # Sistema de notificaciones
│
├── hooks/            # Custom hooks
│   └── index.js      # useFetch, useDebounce, etc.
│
├── pages/            # Páginas de la aplicación
│   ├── Login.jsx     # Página de login
│   ├── Dashboard.jsx # Dashboard con estadísticas
│   ├── Chats.jsx     # Lista de chats y mensajería
│   ├── Users.jsx     # Gestión de usuarios (admin)
│   └── Settings.jsx  # Configuración (admin)
│
├── services/         # Servicios y API
│   ├── api.js        # Cliente HTTP para el backend
│   └── socket.js     # Cliente Socket.IO
│
├── styles/           # Estilos globales
│   └── global.css    # Variables CSS y estilos base
│
├── utils/            # Utilidades
│   ├── helpers.js    # Funciones de utilidad
│   └── constants.js  # Constantes de la aplicación
│
├── App.jsx           # Componente principal con rutas
└── main.jsx          # Entry point
```

## 🛠️ Instalación

```bash
# Clonar o copiar el proyecto
cd whatsapp-panel-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev
```

## ⚙️ Variables de Entorno

```env
VITE_API_URL=http://localhost:3000      # URL del backend
VITE_SOCKET_URL=http://localhost:3000   # URL del WebSocket
```

## 🔐 Roles y Permisos

### Admin
- Acceso completo al dashboard
- Gestión de usuarios (crear, editar, eliminar)
- Configuración del bot y WhatsApp
- Asignar chats a cualquier agente
- Ver agentes conectados

### Agent
- Ver dashboard (estadísticas)
- Gestionar chats asignados
- Enviar mensajes y archivos
- Tomar y liberar chats

## 📡 Eventos Socket.IO

### Eventos que escucha el frontend:

| Evento | Descripción |
|--------|-------------|
| `newMessage` | Nuevo mensaje recibido |
| `newChat` | Nueva conversación iniciada |
| `assignedChat` | Chat asignado a un agente |
| `releasedChat` | Chat liberado |
| `presenceUpdate` | Lista de agentes conectados actualizada |
| `admin:qr` | QR code para vincular WhatsApp |
| `admin:status` | Estado de conexión WhatsApp |
| `assignment-notification` | Notificación de asignación personal |
| `chat:newInternalNote` | Nueva nota interna agregada |
| `dashboard:surveyUpdate` | Actualización de encuestas |

## 📱 Responsive Design

El diseño se adapta a diferentes tamaños de pantalla:

- **Desktop (>900px)**: Layout completo con sidebar fijo
- **Tablet (768-900px)**: Sidebar colapsable
- **Móvil (<768px)**: Navegación en drawer, vistas a pantalla completa

## 🎨 Temas y Colores

Variables CSS principales definidas en `global.css`:

```css
:root {
  --primary: #2563eb;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --whatsapp: #25d366;
}
```

## 📦 Dependencias Principales

- **React 18** - Framework UI
- **React Router v6** - Navegación
- **Socket.IO Client** - WebSocket
- **date-fns** - Manejo de fechas
- **Lucide React** - Iconos

## 🔧 Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Construir para producción
npm run preview  # Previsualizar build de producción
```

## 📝 Notas de Desarrollo

1. **Proxy en desarrollo**: Vite proxy redirige `/api` al backend en `localhost:3000`
2. **Hot Reload**: Cambios en código se reflejan automáticamente
3. **TypeScript Ready**: Configurado pero usando JavaScript

## 🐛 Troubleshooting

### Error de CORS
Asegúrate de que el backend permita orígenes desde `localhost:5173`

### Socket no conecta
Verifica que el token JWT sea válido y el backend esté corriendo

### Archivos no cargan
Revisa que la ruta de media en el backend esté configurada correctamente

---

Desarrollado para WhatsApp Panel - Kika Bot 🤖
