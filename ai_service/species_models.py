"""
🐾 Modelos específicos por especie
Configuraciones y datos para cada tipo de animal soportado
"""

import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class SpeciesModelConfig:
    """Configuración de modelo para una especie específica"""
    name: str
    model_file: Optional[str]
    labels_file: Optional[str]
    breeds: List[str]
    imagenet_classes: List[int]
    confidence_threshold: float
    status: str  # 'trained', 'placeholder', 'training'
    description: str

class SpeciesModelsManager:
    """Gestor de modelos específicos por especie"""
    
    def __init__(self, model_data_path: str):
        self.model_data_path = model_data_path
        self.species_configs = self._initialize_species_configs()
    
    def _initialize_species_configs(self) -> Dict[str, SpeciesModelConfig]:
        """Inicializar configuraciones de todas las especies"""
        
        # Cargar razas de perros existentes
        dog_breeds = self._load_dog_breeds()
        
        configs = {
            'dog': SpeciesModelConfig(
                name='Perros',
                model_file='best_model.keras',
                labels_file='class_labels.json',
                breeds=dog_breeds,
                imagenet_classes=list(range(151, 269)),  # Clases 151-268 son perros
                confidence_threshold=0.15,
                status='trained',
                description='Modelo entrenado con Stanford Dogs Dataset - 120+ razas'
            ),
            
            'cat': SpeciesModelConfig(
                name='Gatos',
                model_file=None,  # Pendiente de entrenar
                labels_file=None,
                breeds=self._get_cat_breeds(),
                imagenet_classes=[281, 282, 283, 284, 285],  # Clases de gatos en ImageNet
                confidence_threshold=0.20,
                status='placeholder',
                description='Modelo en desarrollo - Razas comunes de gatos'
            ),
            
            'bird': SpeciesModelConfig(
                name='Aves',
                model_file=None,  # Pendiente de entrenar
                labels_file=None,
                breeds=self._get_bird_breeds(),
                imagenet_classes=list(range(80, 101)) + list(range(127, 147)),  # Aves en ImageNet
                confidence_threshold=0.18,
                status='placeholder',
                description='Modelo en desarrollo - Aves domésticas y exóticas'
            ),
            
            'rabbit': SpeciesModelConfig(
                name='Conejos',
                model_file=None,  # Pendiente de entrenar
                labels_file=None,
                breeds=self._get_rabbit_breeds(),
                imagenet_classes=[330, 331],  # Conejos en ImageNet
                confidence_threshold=0.25,
                status='placeholder',
                description='Modelo en desarrollo - Razas de conejos domésticos'
            )
        }
        
        return configs
    
    def _load_dog_breeds(self) -> List[str]:
        """Cargar razas de perros desde el archivo existente"""
        try:
            labels_path = os.path.join(self.model_data_path, 'class_labels.json')
            if os.path.exists(labels_path):
                with open(labels_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # El archivo tiene la estructura: {"class_names": [...], "num_classes": 120, ...}
                    if isinstance(data, dict) and 'class_names' in data:
                        print(f"✅ Cargadas {len(data['class_names'])} razas de perros desde {labels_path}")
                        return data['class_names']
                    elif isinstance(data, list):
                        print(f"✅ Cargadas {len(data)} razas de perros desde {labels_path}")
                        return data
                    else:
                        print(f"⚠️ Formato inesperado en {labels_path}, usando razas por defecto")
                        return self._get_default_dog_breeds()
            else:
                print(f"⚠️ Archivo {labels_path} no encontrado, usando razas por defecto")
                return self._get_default_dog_breeds()
        except Exception as e:
            print(f"⚠️ Error cargando razas de perros: {e}")
            return self._get_default_dog_breeds()
    
    def _get_default_dog_breeds(self) -> List[str]:
        """Razas de perros por defecto si no se puede cargar el archivo"""
        return [
            "Chihuahua", "Maltese dog", "Pekinese", "Shih-Tzu", "Beagle",
            "Afghan hound", "Basset", "Bloodhound", "Bluetick", "Black-and-tan coonhound",
            "Walker hound", "English foxhound", "Redbone", "Borzoi", "Irish wolfhound",
            "Italian greyhound", "Whippet", "Ibizan hound", "Norwegian elkhound", "Otterhound",
            "Saluki", "Scottish deerhound", "Weimaraner", "Staffordshire bullterrier", "American Staffordshire terrier",
            "Bedlington terrier", "Border terrier", "Kerry blue terrier", "Irish terrier", "Norfolk terrier",
            "Norwich terrier", "Yorkshire terrier", "Wire-haired fox terrier", "Lakeland terrier", "Sealyham terrier",
            "Airedale", "Cairn", "Australian terrier", "Dandie Dinmont", "Boston bull",
            "Miniature schnauzer", "Giant schnauzer", "Standard schnauzer", "Scotch terrier", "Tibetan terrier",
            "Silky terrier", "Soft-coated wheaten terrier", "West Highland white terrier"
        ]
    
    def _get_cat_breeds(self) -> List[str]:
        """Razas de gatos más comunes para el modelo futuro"""
        return [
            # Razas populares
            "Persian", "Maine Coon", "British Shorthair", "Ragdoll", "Bengal",
            "Abyssinian", "Birman", "Oriental Shorthair", "Sphynx", "Devon Rex",
            "American Shorthair", "Scottish Fold", "Siamese", "Norwegian Forest Cat", "Russian Blue",
            
            # Razas adicionales
            "Exotic Shorthair", "Cornish Rex", "Selkirk Rex", "Manx", "Turkish Angora",
            "Burmese", "Tonkinese", "Bombay", "Chartreux", "Turkish Van",
            "Balinese", "Javanese", "Ocicat", "Egyptian Mau", "Korat",
            
            # Razas menos comunes pero reconocibles
            "Singapura", "LaPerm", "Munchkin", "Savannah", "Pixie-bob",
            "American Curl", "Japanese Bobtail", "Havana Brown", "Somali", "Nebelung",
            
            # Categorías generales
            "Domestic Shorthair", "Domestic Longhair", "Mixed Breed"
        ]
    
    def _get_bird_breeds(self) -> List[str]:
        """Especies de aves domésticas y exóticas comunes"""
        return [
            # Loros y cotorras
            "Budgerigar", "Cockatiel", "Lovebird", "Conure", "African Grey Parrot",
            "Amazon Parrot", "Macaw", "Cockatoo", "Caique", "Eclectus",
            "Quaker Parrot", "Senegal Parrot", "Meyer's Parrot", "Pionus", "Lorikeet",
            
            # Canarios y pinzones
            "Canary", "Goldfinch", "Zebra Finch", "Society Finch", "Gouldian Finch",
            "Java Sparrow", "Waxbill", "Cordon Bleu", "Star Finch", "Owl Finch",
            
            # Otras aves domésticas
            "Dove", "Pigeon", "Chicken", "Duck", "Goose",
            "Quail", "Pheasant", "Guinea Fowl", "Turkey", "Peacock",
            
            # Aves exóticas
            "Toucan", "Hornbill", "Mynah", "Starling", "Robin",
            "Cardinal", "Blue Jay", "Crow", "Raven", "Magpie",
            
            # Categorías generales
            "Songbird", "Waterfowl", "Game Bird", "Exotic Bird", "Mixed Species"
        ]
    
    def _get_rabbit_breeds(self) -> List[str]:
        """Razas de conejos domésticos más comunes"""
        return [
            # Razas grandes
            "Flemish Giant", "Continental Giant", "Giant Chinchilla", "Checkered Giant", "French Lop",
            "English Lop", "Giant Angora", "New Zealand", "Californian", "Champagne D'Argent",
            
            # Razas medianas
            "Dutch", "Mini Lop", "Holland Lop", "Rex", "Mini Rex",
            "English Angora", "French Angora", "Satin Angora", "American Fuzzy Lop", "Lionhead",
            "Jersey Wooly", "English Spot", "Harlequin", "Rhinelander", "Thrianta",
            
            # Razas pequeñas
            "Netherland Dwarf", "Polish", "Himalayan", "Florida White", "Havana",
            "Tan", "Silver", "Lilac", "American Sable", "Smoke Pearl",
            
            # Razas menos comunes
            "Belgian Hare", "Blanc de Hotot", "Cinnamon", "Crème D'Argent", "Silver Fox",
            "Standard Chinchilla", "Palomino", "Satin", "Silver Marten", "Velveteen Lop",
            
            # Categorías generales
            "Lop-eared", "Upright-eared", "Angora Type", "Rex Type", "Mixed Breed"
        ]
    
    def get_species_config(self, species: str) -> Optional[SpeciesModelConfig]:
        """Obtener configuración de una especie específica"""
        return self.species_configs.get(species.lower())
    
    def get_all_species(self) -> Dict[str, SpeciesModelConfig]:
        """Obtener todas las configuraciones de especies"""
        return self.species_configs
    
    def is_model_trained(self, species: str) -> bool:
        """Verificar si el modelo de una especie está entrenado"""
        config = self.get_species_config(species)
        return config is not None and config.status == 'trained'
    
    def get_model_path(self, species: str) -> Optional[str]:
        """Obtener ruta del modelo para una especie"""
        config = self.get_species_config(species)
        if config and config.model_file:
            return os.path.join(self.model_data_path, config.model_file)
        return None
    
    def get_labels_path(self, species: str) -> Optional[str]:
        """Obtener ruta del archivo de etiquetas para una especie"""
        config = self.get_species_config(species)
        if config and config.labels_file:
            return os.path.join(self.model_data_path, config.labels_file)
        return None
    
    def create_placeholder_labels(self, species: str) -> bool:
        """Crear archivo de etiquetas placeholder para una especie"""
        try:
            config = self.get_species_config(species)
            if not config:
                return False
            
            labels_file = f"{species}_labels.json"
            labels_path = os.path.join(self.model_data_path, labels_file)
            
            with open(labels_path, 'w', encoding='utf-8') as f:
                json.dump(config.breeds, f, indent=2, ensure_ascii=False)
            
            # Actualizar configuración
            config.labels_file = labels_file
            print(f"✅ Archivo de etiquetas creado para {species}: {labels_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error creando etiquetas para {species}: {e}")
            return False
    
    def get_species_summary(self) -> Dict[str, Dict]:
        """Obtener resumen de todas las especies"""
        summary = {}
        
        for species, config in self.species_configs.items():
            summary[species] = {
                'name': config.name,
                'breeds_count': len(config.breeds),
                'model_status': config.status,
                'description': config.description,
                'breeds': config.breeds[:10] if len(config.breeds) > 10 else config.breeds,  # Primeras 10 razas
                'has_more_breeds': len(config.breeds) > 10
            }
        
        return summary

def initialize_species_labels(model_data_path: str) -> SpeciesModelsManager:
    """
    Función de inicialización para crear y configurar el gestor de especies
    """
    print("🔧 Inicializando gestor de modelos multi-especies...")
    manager = SpeciesModelsManager(model_data_path)
    
    print(f"✅ Gestor inicializado con {len(manager.get_all_species())} especies:")
    for species_name, config in manager.get_all_species().items():
        status_emoji = "✅" if config.status == 'trained' else "📝"
        print(f"  {status_emoji} {species_name.title()}: {len(config.breeds)} razas ({config.status})")
    
    return manager