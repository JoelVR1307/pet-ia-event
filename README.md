# Pet ID AI

Aplicación de microservicios para identificar razas de perros, gestionar mascotas y eventos. Incluye:
- Frontend (React + Vite + Tailwind)
- Backend (NestJS + Prisma)
- Servicio de IA (Flask + TensorFlow)

## Puertos y rutas
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
  - Predicción: `POST /prediction/predict` (campo `image`)
  - Salud: `GET /prediction/health`
  - Mascotas: `GET/POST/PATCH/DELETE /pets` (campo `photo` en creación/edición)
- IA Python: `http://localhost:5000`
  - `POST /predict` (campo `image`)
  - `GET /health`, `GET /breeds`

## Requisitos
- Node.js 18+
- Python 3.10+
- MySQL 8+ (Prisma `DATABASE_URL`)

## Configuración rápida

### 1) Servicio de IA
```bash
cd ai_service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py  # http://localhost:5000
```

### 2) Backend
Crear `backend/.env` con:
```
PORT=3000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=mysql://USER:PASS@HOST:3306/DBNAME
JWT_SECRET=tu_secreto_seguro
AI_SERVICE_URL=http://localhost:5000
```
Instalar y migrar:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev  # http://localhost:3000
```
El backend sirve archivos en `./uploads` bajo `/uploads` (ej. fotos de mascotas en `/uploads/pets/...`).

### 3) Frontend
```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```
Vite proxy: las rutas que empiezan con `/api` se envían al backend (`http://localhost:3000`).

## Pruebas rápidas (cURL)
- Predicción (backend → IA):
```bash
curl -F "image=@ruta/a/tu_imagen.jpg" http://localhost:3000/prediction/predict
```
- Salud IA:
```bash
curl http://localhost:5000/health
```

## Estructura
```
pet-id-ai/
├── frontend/        # Vite + React
├── backend/         # NestJS + Prisma (MySQL)
└── ai_service/      # Flask + TensorFlow
```

## Notas
- Asegura que MySQL esté accesible y `DATABASE_URL` correcto.
- `JWT_SECRET` es obligatorio para autenticación.
- Si cambias puertos/orígenes, ajusta `FRONTEND_URL`, `PORT` y `AI_SERVICE_URL`.