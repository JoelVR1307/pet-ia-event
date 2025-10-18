"""
🐾 Pet ID AI - Servicio Multi-Especies
Aplicación Flask mejorada que soporta perros, gatos, aves y conejos
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import traceback
from multi_species_predictor import MultiSpeciesPredictor, PetSpecies

app = Flask(__name__)
CORS(app)

# Configuración
MODEL_DATA_PATH = os.path.join(os.path.dirname(__file__), 'model_data')

# Inicializar predictor multi-especies
print("🚀 Inicializando Pet ID AI Multi-Especies...")
try:
    predictor = MultiSpeciesPredictor(MODEL_DATA_PATH)
    print("✅ Sistema multi-especies listo")
except Exception as e:
    print(f"❌ Error inicializando sistema: {e}")
    predictor = None

@app.route('/health', methods=['GET'])
def health():
    """Endpoint de salud del servicio"""
    if predictor is None:
        return jsonify({
            'status': 'error',
            'message': 'Sistema no inicializado'
        }), 500
    
    # Obtener información de especies soportadas
    species_info = predictor.get_supported_species()
    
    return jsonify({
        'status': 'healthy',
        'version': '2.0.0',
        'features': ['multi_species', 'breed_prediction', 'species_detection'],
        'supported_species': list(species_info.keys()),
        'species_details': species_info,
        'total_breeds': sum(info['breeds_count'] for info in species_info.values())
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint principal de predicción multi-especies
    Mantiene compatibilidad con la API anterior para perros
    """
    try:
        print("\n" + "="*60)
        print("📸 Nueva predicción multi-especies")
        
        if predictor is None:
            return jsonify({
                'success': False, 
                'error': 'service_unavailable',
                'message': 'Servicio de predicción no disponible'
            }), 500
        
        # Validar archivo
        if 'image' not in request.files:
            return jsonify({
                'success': False, 
                'error': 'no_image',
                'message': 'No se envió imagen'
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'success': False, 
                'error': 'empty_file',
                'message': 'Archivo vacío'
            }), 400
        
        print(f"📁 Procesando: {file.filename}")
        
        # Leer imagen
        image_bytes = file.read()
        
        # Realizar predicción multi-especies
        result = predictor.predict(image_bytes)
        
        # Si hay error, retornarlo
        if not result.get('success', False):
            return jsonify(result), 400
        
        # Formatear respuesta exitosa
        response = {
            'success': True,
            'species': result['species'],
            'species_confidence': result['species_confidence'],
            'breed': result['breed'],
            'confidence': result['breed_confidence'],  # Mantener compatibilidad
            'breed_confidence': result['breed_confidence'],
            'top_5_predictions': result['top_5_predictions'],
            'model_info': result['model_info'],
            'additional_info': result.get('additional_info', {})
        }
        
        # Para compatibilidad con frontend existente (solo perros)
        if result['species'] == 'dog':
            # Mantener formato original para perros
            response['model_info'].update({
                'architecture': 'MobileNetV2',
                'dataset': 'Stanford Dogs Dataset',
                'num_classes': result['model_info'].get('total_breeds', 0),
                'validation_accuracy': 0.7329
            })
        
        print(f"✅ Predicción exitosa: {result['species']} - {result['breed']}")
        print("="*60 + "\n")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error en predicción: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False, 
            'error': 'internal_error',
            'message': f'Error interno: {str(e)}'
        }), 500

@app.route('/predict/species', methods=['POST'])
def predict_species_only():
    """
    Endpoint para detectar solo la especie (sin raza específica)
    """
    try:
        if predictor is None:
            return jsonify({'success': False, 'error': 'Servicio no disponible'}), 500
        
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No se envió imagen'}), 400
        
        file = request.files['image']
        image_bytes = file.read()
        image_array = predictor._preprocess_image(image_bytes)
        
        # Solo detectar especie
        species, confidence = predictor.detect_species(image_array)
        
        return jsonify({
            'success': True,
            'species': species.value,
            'confidence': confidence,
            'species_name': species.value.title()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/breeds', methods=['GET'])
def get_breeds():
    """
    Endpoint para obtener todas las razas soportadas
    Mantiene compatibilidad con API anterior
    """
    try:
        if predictor is None:
            return jsonify({'success': False, 'error': 'Servicio no disponible'}), 500
        
        # Obtener parámetro de especie (opcional)
        species_param = request.args.get('species', 'dog').lower()
        
        species_info = predictor.get_supported_species()
        
        if species_param == 'all':
            # Retornar todas las especies y sus razas
            return jsonify({
                'success': True,
                'species': species_info,
                'total_species': len(species_info),
                'total_breeds': sum(info['breeds_count'] for info in species_info.values())
            })
        else:
            # Retornar solo una especie específica (compatibilidad)
            species_data = species_info.get(species_param, species_info.get('dog'))
            
            if species_data:
                return jsonify({
                    'success': True,
                    'breeds': sorted(species_data['breeds']),
                    'total': species_data['breeds_count'],
                    'species': species_param,
                    'model_status': species_data['model_status']
                })
            else:
                return jsonify({
                    'success': False,
                    'error': f'Especie no soportada: {species_param}'
                }), 400
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/species', methods=['GET'])
def get_species():
    """
    Endpoint para obtener información sobre especies soportadas
    """
    try:
        if predictor is None:
            return jsonify({'success': False, 'error': 'Servicio no disponible'}), 500
        
        species_info = predictor.get_supported_species()
        
        return jsonify({
            'success': True,
            'supported_species': species_info,
            'total_species': len(species_info),
            'capabilities': {
                'species_detection': True,
                'breed_prediction': True,
                'multi_species': True
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/model/info', methods=['GET'])
def get_model_info():
    """
    Endpoint para obtener información detallada del modelo
    """
    try:
        if predictor is None:
            return jsonify({'success': False, 'error': 'Servicio no disponible'}), 500
        
        species_info = predictor.get_supported_species()
        
        return jsonify({
            'success': True,
            'version': '2.0.0',
            'architecture': 'Multi-Species MobileNetV2',
            'species_detector': 'MobileNetV2 + ImageNet',
            'supported_species': species_info,
            'features': [
                'Detección automática de especies',
                'Predicción de razas específicas',
                'Soporte para perros, gatos, aves y conejos',
                'API compatible con versión anterior'
            ],
            'performance': {
                'dog_breeds': {
                    'accuracy': 0.73,
                    'dataset': 'Stanford Dogs Dataset',
                    'breeds_count': len(species_info.get('dog', {}).get('breeds', []))
                },
                'species_detection': {
                    'method': 'ImageNet pre-trained classes',
                    'confidence_threshold': 0.15
                }
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.errorhandler(413)
def too_large(e):
    return jsonify({
        'success': False,
        'error': 'file_too_large',
        'message': 'El archivo es demasiado grande. Máximo 16MB.'
    }), 413

@app.errorhandler(400)
def bad_request(e):
    return jsonify({
        'success': False,
        'error': 'bad_request',
        'message': 'Solicitud inválida.'
    }), 400

@app.errorhandler(500)
def internal_error(e):
    return jsonify({
        'success': False,
        'error': 'internal_server_error',
        'message': 'Error interno del servidor.'
    }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🐾 Pet ID AI - Servicio Multi-Especies")
    print("="*60)
    
    if predictor:
        species_info = predictor.get_supported_species()
        print("📊 Especies soportadas:")
        for species, info in species_info.items():
            status = "✅" if info['model_status'] == 'trained' else "🔄"
            print(f"  {status} {species.title()}: {info['breeds_count']} razas")
        
        print(f"\n🎯 Total de razas: {sum(info['breeds_count'] for info in species_info.values())}")
    else:
        print("❌ Sistema no inicializado correctamente")
    
    print("="*60)
    print("🌐 Servidor iniciando en http://localhost:5000")
    print("📚 Endpoints disponibles:")
    print("  POST /predict - Predicción multi-especies")
    print("  POST /predict/species - Solo detección de especie")
    print("  GET  /breeds - Obtener razas (por especie)")
    print("  GET  /species - Información de especies")
    print("  GET  /model/info - Información del modelo")
    print("  GET  /health - Estado del servicio")
    print("="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)