# Pet ID AI — Backend (NestJS + Prisma)

API para autenticación de usuarios, gestión de mascotas y predicción de razas de perros (vía servicio de IA). Sirve archivos estáticos en `/uploads` para fotos de mascotas.

## Requisitos

- Node.js 18+ (recomendado 20+)
- MySQL 8+ accesible (local o remoto)
- Servicio de IA en `http://localhost:5000` (Flask)

## Variables de entorno (`.env`)

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/pet_id_ai
JWT_SECRET=tu_super_secreto
AI_SERVICE_URL=http://localhost:5000
```

- `PORT`: puerto del backend (por defecto `3000`).
- `FRONTEND_URL`: origen permitido para CORS.
- `DATABASE_URL`: cadena de conexión de MySQL para Prisma.
- `JWT_SECRET`: clave para firmar/validar JWT.
- `AI_SERVICE_URL`: URL del servicio Flask.

## Instalación y ejecución

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Genera el cliente de Prisma y aplica migraciones:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
3. Arranca en desarrollo:
   ```bash
   npm run start:dev
   ```
4. Producción:
   ```bash
   npm run build
   npm run start:prod
   ```

## Endpoints principales

- Raíz: `GET /` — "Hello World!"

- Auth (`/auth`)
  - `POST /auth/register` — público
  - `POST /auth/login` — público
  - `GET /auth/validate` — requiere JWT
  - `GET /auth/profile` — requiere JWT

- Mascotas (`/pets`) — requiere JWT
  - `GET /pets` — lista mascotas del usuario
  - `GET /pets/:id`
  - `POST /pets` — `multipart/form-data` con campos `name`, `breed`, `age?`, `photo?`
  - `PATCH /pets/:id` — `multipart/form-data` (misma estructura)
  - `DELETE /pets/:id`
  - Archivos: se sirven en `/uploads/pets/<archivo>`

- Predicción (`/prediction`)
  - `GET /prediction/health` — verifica disponibilidad del servicio de IA
  - `POST /prediction/predict` — `multipart/form-data` con archivo `image` (hasta 10MB)

## CORS y estáticos

- CORS habilitado para `process.env.FRONTEND_URL` (por defecto `http://localhost:5173`).
- Archivos estáticos en `/uploads`.

## Ejemplos rápidos

- Login:
  ```bash
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"user@example.com","password":"123456"}'
  ```
- Predicción:
  ```bash
  curl -X POST http://localhost:3000/prediction/predict \
    -H "Authorization: Bearer <TOKEN>" \
    -F image=@./perro.jpg
  ```

## Estructura

- NestJS módulos principales: `AuthModule`, `PetsModule`, `PredictionModule`, `EventsModule`, `PrismaModule`.
- Guard global JWT aplicado; rutas públicas marcadas con `@Public()`.

## Notas

- Asegúrate de que MySQL esté accesible y que `DATABASE_URL` sea correcto.
- Cambios de puerto u origen requieren actualizar `FRONTEND_URL` y proxies del frontend.
- Si eliminas/actualizas fotos de mascotas, el servicio gestiona la limpieza en `uploads/pets`.
