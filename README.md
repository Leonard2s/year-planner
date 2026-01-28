# 📊 Planificador Anual de Metas

Aplicación web para planificación y seguimiento de metas personales anuales.

## 🎯 Características

- **3 tipos de metas**: Ahorro 💰, Viajes ✈️, Compras 🛒
- **Seguimiento mensual** con evaluación automática
- **Arrastre automático** de metas no cumplidas al siguiente mes
- **Persistencia de datos** con IndexedDB (funciona sin conexión)
- **Resumen visual** del progreso anual y mensual
- **Evaluación clara**: Cumplido 🎉 / Vas bien 👍 / Atrasado ⚠️

## 🚀 Despliegue en Vercel (Gratis)

### Opción 1: Desde GitHub

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Crea una cuenta gratuita
4. Click en "New Project"
5. Importa tu repositorio de GitHub
6. Vercel detectará automáticamente Vite
7. Click en "Deploy"

### Opción 2: Desde CLI

```bash
npm install -g vercel
vercel login
vercel
```

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📦 Tecnologías

- Vue 3 (Composition API)
- TypeScript
- TailwindCSS v4
- IndexedDB para persistencia
- Vite

## 📝 Uso

1. Selecciona un mes
2. Agrega metas con el botón "+ Nueva Meta"
3. Actualiza el progreso directamente en cada meta
4. Cierra el mes para arrastrar metas pendientes
5. Revisa tu progreso anual en el resumen superior

## 💾 Datos

Los datos se guardan automáticamente en IndexedDB del navegador. Funcionan sin conexión y persisten entre sesiones.
