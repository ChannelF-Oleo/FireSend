# Estructura del Proyecto FireSend

## 📁 Estructura Reorganizada

```
firesend/
├── src/                          # Código fuente principal
│   ├── app/                      # Next.js App Router
│   │   ├── dashboard/           # Rutas protegidas del dashboard
│   │   │   ├── settings/        # Página de configuración
│   │   │   ├── layout.tsx       # Layout con sidebar
│   │   │   └── page.tsx         # Dashboard principal
│   │   ├── login/               # Página de login
│   │   │   └── page.tsx
│   │   ├── globals.css          # Estilos globales
│   │   ├── layout.tsx           # Root layout con AuthProvider
│   │   └── page.tsx             # Landing page
│   │
│   ├── components/              # Componentes reutilizables
│   │   └── ui/                  # Componentes UI (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── textarea.tsx
│   │       └── sonner.tsx
│   │
│   ├── context/                 # React Context
│   │   └── AuthContext.tsx      # Autenticación y protección de rutas
│   │
│   └── lib/                     # Utilidades y configuraciones
│       ├── firebase.ts          # Configuración de Firebase
│       └── utils.ts             # Funciones helper (cn)
│
├── functions/                   # Firebase Cloud Functions
│   └── src/
│       └── index.ts
│
├── public/                      # Archivos estáticos
├── .env.local                   # Variables de entorno
├── components.json              # Configuración shadcn/ui
├── tsconfig.json                # Configuración TypeScript
├── next.config.ts               # Configuración Next.js
└── package.json

```

## 🔧 Configuración de Imports

### Path Aliases (tsconfig.json)

```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Uso de Imports

Todos los imports usan el alias `@/` que apunta a `src/`:

```typescript
// ✅ CORRECTO
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

// ❌ INCORRECTO (ya no usar)
import { Button } from "@/src/components/ui/button";
```

## 📝 Cambios Realizados

### Eliminados (duplicados)

- ❌ `/app/` (carpeta raíz duplicada)
- ❌ `/components/` (carpeta raíz vacía)
- ❌ `/lib/` (carpeta raíz con utils duplicado)
- ❌ `/app/globals.css` (duplicado)
- ❌ `/app/layout.tsx` (sin AuthProvider)

### Consolidados en `/src/`

- ✅ Todo el código de la aplicación
- ✅ Imports consistentes con `@/`
- ✅ Estructura clara y organizada

## 🚀 Rutas de la Aplicación

- `/` - Landing page (público)
- `/login` - Página de login (público)
- `/dashboard` - Panel principal (protegido)
- `/dashboard/settings` - Configuración (protegido)

## 🔐 Protección de Rutas

El `AuthContext` maneja automáticamente:

- Redirección a `/login` si no hay usuario autenticado
- Redirección a `/dashboard` si ya hay sesión activa
- Loading state durante verificación de autenticación
