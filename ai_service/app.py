from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io
import json
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model_data', 'best_model.keras')
LABELS_PATH = os.path.join(os.path.dirname(__file__), 'model_data', 'class_labels.json')
IMAGE_SIZE = (224, 224)

print("Cargando modelo de clasificación de razas...")
try:
    breed_model = keras.models.load_model(MODEL_PATH)
    print("✓ Modelo de razas cargado")
except Exception as e:
    print(f"✗ Error: {e}")
    breed_model = None

print("Cargando modelo de detección de perros...")
try:
    # Usar MobileNetV2 pre-entrenado para detectar si es un perro
    dog_detector = keras.applications.MobileNetV2(
        weights='imagenet',
        include_top=True
    )
    print("✓ Detector de perros cargado")
    
    # Cargar etiquetas de ImageNet
    from tensorflow.keras.applications.mobilenet_v2 import decode_predictions
except Exception as e:
    print(f"✗ Error cargando detector: {e}")
    dog_detector = None

print("Cargando etiquetas de razas...")
try:
    with open(LABELS_PATH, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
        class_names = metadata.get('class_names', metadata)
        print(f"✓ {len(class_names)} razas cargadas")
except Exception as e:
    print(f"✗ Error: {e}")
    class_names = []

# Clases de ImageNet relacionadas con perros (151-268)
DOG_IMAGENET_CLASSES = set(range(151, 269))  # Todas las razas de perros en ImageNet

def is_dog_image(image_array):
    """Detecta si la imagen contiene un perro usando MobileNetV2"""
    try:
        if dog_detector is None:
            return True  # Si no hay detector, asumir que sí es perro
        
        # Preparar imagen para MobileNetV2 (224x224)
        img = tf.image.resize(image_array, (224, 224))
        img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
        img = tf.expand_dims(img, 0)
        
        # Predecir
        predictions = dog_detector.predict(img, verbose=0)
        decoded = decode_predictions(predictions, top=5)[0]
        
        print("\n🔍 Detección de objeto:")
        for i, (imagenet_id, label, score) in enumerate(decoded, 1):
            print(f"  {i}. {label}: {score*100:.2f}%")
        
        # Obtener los índices de clase numéricos de las top-5 predicciones
        top_5_indices = np.argsort(predictions[0])[-5:][::-1]
        
        # Verificar si hay perros en el top 5 (clases 151-268 de ImageNet)
        has_dog_class = any(idx in DOG_IMAGENET_CLASSES for idx in top_5_indices)
        
        # Obtener la confianza máxima si es clase de perro
        max_dog_confidence = 0.0
        if has_dog_class:
            for idx in top_5_indices:
                if idx in DOG_IMAGENET_CLASSES:
                    max_dog_confidence = max(max_dog_confidence, float(predictions[0][idx]))
        
        print(f"\n📊 Análisis:")
        print(f"  ¿Tiene clase de perro en top-5? {has_dog_class}")
        print(f"  Confianza máxima en perro: {max_dog_confidence*100:.2f}%")
        
        # Criterios simplificados:
        # 1. Debe tener una clase de perro en el top-5
        # 2. La confianza en esa clase debe ser > 20%
        is_valid_dog = has_dog_class and max_dog_confidence > 0.20
        
        print(f"  ✅ Resultado: {'ES PERRO' if is_valid_dog else 'NO ES PERRO'}")
        
        return is_valid_dog
        
    except Exception as e:
        print(f"⚠ Error en detección: {e}")
        import traceback
        traceback.print_exc()
        return True  # En caso de error, continuar

def preprocess_image(image_bytes):
    """Preprocesa con normalización de MobileNetV2"""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        image = image.resize(IMAGE_SIZE, Image.Resampling.BILINEAR)
        
        img_array = np.array(image, dtype=np.float32)
        print(f"  Original: min={img_array.min():.2f}, max={img_array.max():.2f}")
        
        return img_array
        
    except Exception as e:
        raise Exception(f"Error: {str(e)}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'breed_model_loaded': breed_model is not None,
        'dog_detector_loaded': dog_detector is not None,
        'num_classes': len(class_names)
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("\n" + "="*60)
        print("📸 Nueva predicción")
        
        if breed_model is None:
            return jsonify({'success': False, 'error': 'Modelo no disponible'}), 500
        
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No se envió imagen'}), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({'success': False, 'error': 'Archivo vacío'}), 400
        
        print(f"📁 {file.filename}")
        
        image_bytes = file.read()
        img_array = preprocess_image(image_bytes)
        
        # PASO 1: Verificar si es un perro
        if not is_dog_image(img_array):
            print("\n❌ No es un perro")
            print("="*60 + "\n")
            return jsonify({
                'success': False,
                'error': 'not_a_dog',
                'message': 'La imagen no parece ser de un perro. Por favor, sube una imagen de un perro para identificar su raza.'
            }), 400
        
        print("\n✅ Es un perro, continuando con identificación de raza...")
        
        # PASO 2: Normalizar para el modelo de razas
        img_normalized = (img_array / 127.5) - 1.0
        print(f"  Normalizada: min={img_normalized.min():.2f}, max={img_normalized.max():.2f}")
        
        img_normalized = np.expand_dims(img_normalized, axis=0)
        
        # PASO 3: Predecir raza
        print("\n🔮 Prediciendo raza...")
        predictions = breed_model.predict(img_normalized, verbose=0)
        
        print(f"📈 Min: {predictions.min():.6f}, Max: {predictions.max():.6f}")
        
        top_5_indices = np.argsort(predictions[0])[-5:][::-1]
        top_5_breeds = []
        
        print("\n🏆 Top 5:")
        for i, idx in enumerate(top_5_indices, 1):
            breed_name = class_names[idx]
            confidence = float(predictions[0][idx])
            print(f"  {i}. {breed_name}: {confidence*100:.2f}%")
            
            top_5_breeds.append({
                'breed': breed_name,
                'confidence': confidence
            })
        
        predicted_class = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class])
        breed_name = class_names[predicted_class]
        
        print(f"\n✅ {breed_name} ({confidence*100:.2f}%)")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'breed': breed_name,
            'confidence': confidence,
            'top_5_predictions': top_5_breeds,
            'model_info': {
                'architecture': 'MobileNetV2',
                'dataset': 'Stanford Dogs Dataset',
                'num_classes': len(class_names),
                'validation_accuracy': 0.7329
            }
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/breeds', methods=['GET'])
def get_breeds():
    return jsonify({
        'success': True,
        'breeds': sorted(class_names),
        'total': len(class_names)
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🐕 Servicio de Predicción de Razas")
    print("="*50)
    print(f"Modelo de razas: {'✓' if breed_model else '✗'}")
    print(f"Detector de perros: {'✓' if dog_detector else '✗'}")
    print(f"Razas: {len(class_names)}")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)