# PawManager

Landing page de **PawManager**, un SaaS pensado para centros de adopción animal, refugios y rescatistas independientes. Centraliza fichas de mascotas, adopciones, vacunas y voluntarios en un solo lugar, sustituyendo hojas de Excel y chats dispersos de WhatsApp.

> **Estado actual:** versión beta — landing de captación con formulario de pre-registro. Los datos de la waitlist se guardan en `localStorage` del navegador.

## Características de la landing

| Sección | Descripción |
|---------|-------------|
| **Hero** | Propuesta de valor, badges de confianza y modal de demo interactivo |
| **Problemas** | Pain points habituales en refugios (Excel, WhatsApp, vacunas olvidadas) |
| **Solución** | Vista previa de funcionalidades del producto (fichas, Kanban de adopciones, recordatorios, etc.) |
| **Beneficios** | Impacto esperado: expedientes, adopciones más rápidas, seguimiento post-adopción |
| **Galería** | Bloque emocional con imágenes de mascotas |
| **Prueba social** | Testimonios y contador dinámico de refugios en la waitlist |
| **Formulario CTA** | Pre-registro a la beta (nombre del refugio, contacto, rango de mascotas) |
| **Footer** | Enlaces y cierre de marca |

## Stack tecnológico

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/) — bundler y servidor de desarrollo
- [Tailwind CSS 4](https://tailwindcss.com/) — estilos utilitarios
- [Motion](https://motion.dev/) — animaciones
- [Lucide React](https://lucide.dev/) — iconografía

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- npm (incluido con Node.js)

## Instalación

```bash
git clone https://github.com/MigueleArt/Paw-Manager.git
cd Paw-Manager
npm install
```

## Variables de entorno

Copia el archivo de ejemplo y ajusta los valores si vas a integrar servicios externos (p. ej. Gemini AI):

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `GEMINI_API_KEY` | Clave de la API de Gemini (uso futuro / AI Studio) |
| `APP_URL` | URL pública de la aplicación |

La landing actual **no requiere** estas variables para funcionar en local.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Compila la app para producción en `dist/` |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Comprueba tipos con TypeScript (`tsc --noEmit`) |

## Estructura del proyecto

```
pawmanager/
├── index.html
├── metadata.json          # Metadatos del applet (AI Studio)
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── App.tsx            # Layout principal y estado de la waitlist
    ├── main.tsx
    ├── index.css          # Tailwind, fuentes y tema
    └── components/
        ├── Navbar.tsx
        ├── Hero.tsx
        ├── Problems.tsx
        ├── Solution.tsx
        ├── Benefits.tsx
        ├── PetGallery.tsx
        ├── SocialProof.tsx
        ├── CTAForm.tsx
        └── Footer.tsx
```

## Paleta y tipografía

- **Colores:** verde bosque (`#1B4332`), coral (`#F4845F`), dorado (`#E9C46A`), crema (`#FDF8F0`)
- **Fuentes:** Playfair Display (títulos), Plus Jakarta Sans (cuerpo), JetBrains Mono (etiquetas)

## Roadmap del producto

PawManager está diseñado para evolucionar hacia un SaaS completo con:

- Ficha digital por mascota (fotos, vacunas, historial médico)
- Tablero Kanban de adopciones
- Recordatorios automáticos (vacunas, desparasitaciones)
- Comunicación centralizada y seguimiento post-adopción
- Reportes de impacto para donantes
- Roles y permisos para voluntarios

## Ejecución del proyecto

### Requisitos previos

Antes de ejecutar el proyecto es necesario contar con:

* Node.js
* npm

### Backend

Para instalar las dependencias y ejecutar el backend:

```bash
cd backend
npm install
npm run dev
```

El backend se ejecuta localmente en:

```text
http://localhost:3000
```

Para comprobar que el backend está funcionando correctamente, abre esa dirección en el navegador. Si el servidor responde, el indicador del dashboard mostrará **"Servidor activo"**.

### Frontend

Para instalar las dependencias y ejecutar el frontend:

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecuta localmente en:

```text
http://localhost:5173
```

## Variables de entorno

### Frontend

Crear un archivo `.env` dentro de la carpeta `frontend` con la siguiente variable:

```env
VITE_API_URL=http://localhost:3000
```

También se debe incluir un archivo `.env.example` para documentar las variables necesarias del proyecto.

### Backend

El backend utiliza su propio archivo `.env` para configurar las variables necesarias para la base de datos, autenticación y demás servicios utilizados por el sistema.

## Seguridad

No deben subirse al repositorio claves, credenciales, tokens o archivos `.env` con información real. Para documentar las variables necesarias se debe utilizar únicamente el archivo `.env.example`.

## Autor

-José Miguel Jimenez Enriquez
-Carlos Alberto Pacheco Avila
-José Alberto Herrera Flores 
-Jesús Emmanuel Cruz Orea 

