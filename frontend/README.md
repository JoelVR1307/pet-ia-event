# Pet ID AI — Frontend (React + Vite)

Aplicación web en React para gestionar mascotas, autenticarse y realizar predicciones de raza de perros. Este frontend se integra con el backend (NestJS) y con el servicio de IA a través del backend.

## Requisitos

- Node.js 18+ (recomendado 20+)
- Backend en `http://localhost:3000` (NestJS)
- Servicio de IA en `http://localhost:5000` (Flask) — utilizado por el backend

## Instalación y ejecución

1. Instala dependencias:
   
   ```bash
   npm install
   ```

2. Crea el archivo `.env` en `frontend/` con la URL del backend:
   
   ```env
   VITE_BACKEND_URL=http://localhost:3000
   ```

3. Arranca el modo desarrollo y abre `http://localhost:5173`:
   
   ```bash
   npm run dev
   ```

4. Compila y vista previa de producción:
   
   ```bash
   npm run build
   npm run preview
   ```

## Rutas principales

- `/login` — Inicio de sesión
- `/register` — Registro de usuarios
- `/dashboard` — Panel principal (protegido)
- `/predict` — Predicción de raza de perro (protegido)
- `/pet/:petId` — Detalle de mascota (protegido)

## Integración con el backend

- Base de API: `VITE_BACKEND_URL` (por defecto `http://localhost:3000`).
- Autenticación: los tokens JWT se guardan en `localStorage` (`auth_token`) y el usuario en `auth_user`.
- Interceptores: si el backend responde `401`, se limpia el token y se redirige a `/login`.

### Endpoints utilizados

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/validate`.
- Mascotas: `GET /pets`, `GET /pets/:id`, `POST /pets`, `PATCH /pets/:id`, `DELETE /pets/:id`.
  - Crea/actualiza con `multipart/form-data`.
  - Campo de imagen: `photo`.
- Predicción: `POST /prediction/predict`.
  - `multipart/form-data` con el campo de archivo `image`.

## Proxy opcional (Vite)

Este proyecto incluye un proxy en `vite.config.ts` para `/api` hacia `http://localhost:3000`. Actualmente el cliente usa `VITE_BACKEND_URL` y llama directo al backend, por lo que el proxy no es necesario. Si prefieres usar el proxy, ajusta `baseURL` en `src/services/api.service.ts` a `'/api'`.

## Comandos útiles

- `npm run dev` — Desarrollo con Vite en `http://localhost:5173`.
- `npm run build` — Compilación de producción.
- `npm run preview` — Vista previa de la build.
- `npm run lint` — Linting del proyecto.

## Solución de problemas

- `401 Unauthorized`: verifica `JWT_SECRET` en el backend y que el token esté vigente.
- CORS: configura `FRONTEND_URL` en el backend como `http://localhost:5173`.
- Predicción fallida: confirma que el servicio de IA esté en `http://localhost:5000` y que el backend tenga `AI_SERVICE_URL` correcto.

## Tecnologías

- React 19 + Vite 7
- TypeScript
- Tailwind CSS
- Axios
- React Router
