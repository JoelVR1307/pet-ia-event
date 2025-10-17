import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import json

# Rutas
MODEL_PATH = 'model_data/best_model.keras'
LABELS_PATH = 'model_data/class_labels.json'
TEST_IMAGE_PATH = r'C:\Users\LENOVO\Desktop\pet-id-ai\entrenamiento\Images\n02099601-golden_retriever\n02099601_280.jpg'
IMAGE_SIZE = (224, 224)

print("Cargando modelo...")
model = keras.models.load_model(MODEL_PATH)
print("✓ Modelo cargado\n")

print("Cargando etiquetas...")
with open(LABELS_PATH, 'r', encoding='utf-8') as f:
    metadata = json.load(f)
    class_names = metadata['class_names']
print(f"✓ {len(class_names)} razas\n")

# Buscar el índice de Golden Retriever
golden_idx = next((i for i, name in enumerate(class_names) if 'golden' in name.lower()), None)
print(f"Golden Retriever índice: {golden_idx} -> '{class_names[golden_idx]}'\n")

# Cargar y procesar imagen
print(f"Cargando imagen de prueba: {TEST_IMAGE_PATH}")
image = Image.open(TEST_IMAGE_PATH)

if image.mode != 'RGB':
    image = image.convert('RGB')

image = image.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
img_array = np.array(image, dtype=np.float32)

print(f"Original - Min: {img_array.min()}, Max: {img_array.max()}")

# Normalización MobileNetV2
img_array = (img_array / 127.5) - 1.0
print(f"Normalizada - Min: {img_array.min():.2f}, Max: {img_array.max():.2f}\n")

img_array = np.expand_dims(img_array, axis=0)

# Predecir
print("\nRealizando predicción...")
predictions = model.predict(img_array, verbose=0)

print(f"\nEstadísticas de predicción:")
print(f"  Shape: {predictions.shape}")
print(f"  Min: {predictions.min():.6f}")
print(f"  Max: {predictions.max():.6f}")
print(f"  Sum: {predictions.sum():.6f}")

# Top 10
top_10_indices = np.argsort(predictions[0])[-10:][::-1]

print("="*60)
print("TOP 10 PREDICCIONES:")
print("="*60)
for i, idx in enumerate(top_10_indices, 1):
    confidence = predictions[0][idx]
    is_golden = " ⭐ GOLDEN!" if idx == golden_idx else ""
    print(f"{i:2}. [{idx:3}] {class_names[idx]:35} {confidence*100:6.2f}%{is_golden}")

predicted_idx = np.argmax(predictions[0])
print(f"\n✅ PREDICCIÓN: {class_names[predicted_idx]} ({predictions[0][predicted_idx]*100:.2f}%)")
print(f"Golden confidence: {predictions[0][golden_idx]*100:.2f}%\n")