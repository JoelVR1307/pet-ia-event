# Pet ID AI — Servicio de IA (Flask + TensorFlow)

Servicio Flask que clasifica la raza de un perro en una imagen y expone endpoints para salud, predicción y listado de razas. Usa un modelo Keras y MobileNetV2 para verificar si la imagen contiene un perro.

## Requisitos

- Python 3.10+
- `pip` instalado
- (Opcional) GPU con drivers/CUDA para acelerar inferencia

## Instalación

1. Crear entorno virtual (Windows):
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Verificar que existen los archivos de modelo en `model_data/`:
   - `best_model.keras`
   - `class_labels.json`

## Ejecución

Arranca el servidor en `http://localhost:5000`:
```bash
python app.py
```
CORS está habilitado, no requiere configuración adicional.

## Endpoints

- `GET /health`
  - Estado del servicio y carga de modelos.
- `POST /predict`
  - `multipart/form-data` con campo de archivo `image`.
  - Respuesta:
    ```json
    {
      "success": true,
      "breed": "Golden Retriever",
      "confidence": 0.87,
      "top_5_predictions": [ { "breed": "...", "confidence": 0.12 } ],
      "model_info": {
        "architecture": "MobileNetV2",
        "dataset": "Stanford Dogs Dataset",
        "num_classes": 120,
        "validation_accuracy": 0.7329
      }
    }
    ```
- `GET /breeds`
  - Devuelve listado de razas conocidas por el modelo.

## Ejemplos

- Salud:
  ```bash
  curl http://localhost:5000/health
  ```
- Predicción:
  ```bash
  curl -X POST http://localhost:5000/predict \
    -F image=@./perro.jpg
  ```
- Razas disponibles:
  ```bash
  curl http://localhost:5000/breeds
  ```

## Notas

- Este servicio no lee variables de entorno para el puerto (usa 5000). Si necesitas otro puerto, modifica `app.py`.
- El backend (NestJS) consume este servicio en `AI_SERVICE_URL` (por defecto `http://localhost:5000`).
- Si `best_model.keras` o `class_labels.json` no están disponibles, `/predict` responderá error.