import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.applications import MobileNetV2
import json
import os
import numpy as np
from pathlib import Path
import scipy.io

# Configuración
IMAGE_SIZE = (224, 224)
BATCH_SIZE = 16  # ⚠️ Reducido para mejor convergencia
EPOCHS = 50
BASE_PATH = r"C:\Users\LENOVO\Desktop\pet-id-ai\entrenamiento"
IMAGES_PATH = os.path.join(BASE_PATH, "Images")
MODEL_SAVE_PATH = r"C:\Users\LENOVO\Desktop\pet-id-ai\ai_service\model_data"

def load_stanford_splits():
    """Carga los splits oficiales del Stanford Dogs Dataset"""
    print("Cargando splits oficiales de Stanford Dogs Dataset...")
    
    file_list = scipy.io.loadmat(os.path.join(BASE_PATH, 'file_list.mat'))
    train_list = scipy.io.loadmat(os.path.join(BASE_PATH, 'train_list.mat'))
    test_list = scipy.io.loadmat(os.path.join(BASE_PATH, 'test_list.mat'))
    
    train_files = [f[0][0] for f in train_list['file_list']]
    test_files = [f[0][0] for f in test_list['file_list']]
    
    train_labels = [int(label[0]) - 1 for label in train_list['labels']]
    test_labels = [int(label[0]) - 1 for label in test_list['labels']]
    
    class_folders = sorted([d.name for d in Path(IMAGES_PATH).iterdir() if d.is_dir()])
    
    class_names = []
    for folder in class_folders:
        name = folder.split('-', 1)[1] if '-' in folder else folder
        name = name.replace('_', ' ')
        class_names.append(name)
    
    print(f"Total de clases: {len(class_names)}")
    print(f"Imágenes de entrenamiento: {len(train_files)}")
    print(f"Imágenes de prueba: {len(test_files)}")
    
    return train_files, train_labels, test_files, test_labels, class_names

def load_and_preprocess_image(file_path, label):
    """Carga imagen y convierte a 0-255"""
    full_path = tf.strings.join([IMAGES_PATH, '/', file_path])
    
    img = tf.io.read_file(full_path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, IMAGE_SIZE)
    img = tf.cast(img, tf.float32)
    
    return img, label

def augment_image(image, label):
    """Data augmentation MÁS AGRESIVO"""
    image = tf.image.random_flip_left_right(image)
    image = tf.image.random_brightness(image, max_delta=0.2)
    image = tf.image.random_contrast(image, lower=0.7, upper=1.3)
    image = tf.image.random_saturation(image, lower=0.7, upper=1.3)
    
    # Random crop y resize
    image = tf.image.random_crop(image, size=[int(IMAGE_SIZE[0]*0.9), int(IMAGE_SIZE[1]*0.9), 3])
    image = tf.image.resize(image, IMAGE_SIZE)
    
    image = tf.clip_by_value(image, 0.0, 255.0)
    
    return image, label

def normalize_for_mobilenet(image, label):
    """Normaliza usando el método de MobileNetV2"""
    # MobileNetV2 usa: (x / 127.5) - 1.0
    image = (image / 127.5) - 1.0
    return image, label

def create_tf_dataset(file_list, labels, is_training=True):
    """Crea dataset de TensorFlow"""
    
    dataset = tf.data.Dataset.from_tensor_slices((file_list, labels))
    
    if is_training:
        dataset = dataset.shuffle(buffer_size=2000, reshuffle_each_iteration=True)
    
    dataset = dataset.map(load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    if is_training:
        dataset = dataset.map(augment_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    dataset = dataset.map(normalize_for_mobilenet, num_parallel_calls=tf.data.AUTOTUNE)
    
    dataset = dataset.batch(BATCH_SIZE)
    dataset = dataset.prefetch(tf.data.AUTOTUNE)
    
    return dataset

def create_model(num_classes):
    """Crea modelo con MobileNetV2"""
    print("Creando modelo con MobileNetV2...")
    
    keras.backend.clear_session()
    
    # Usar MobileNetV2 - más ligero y estable
    base_model = MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights='imagenet',  # ⚠️ CON pesos pre-entrenados
        pooling=None,
        alpha=1.0
    )
    
    print("✓ Modelo base con pesos de ImageNet cargado")
    
    # Congelar capas base inicialmente
    base_model.trainable = False
    
    inputs = keras.Input(shape=IMAGE_SIZE + (3,))
    x = base_model(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(512, activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    model = keras.Model(inputs, outputs)
    
    # Compilar
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=[
            'accuracy',
            keras.metrics.SparseTopKCategoricalAccuracy(k=5, name='top5_accuracy')
        ]
    )
    
    print(f"\n{'='*60}")
    print(f"Modelo creado con {num_classes} clases")
    print(f"Parámetros totales: {model.count_params():,}")
    trainable = sum([tf.size(w).numpy() for w in model.trainable_weights])
    print(f"Parámetros entrenables: {trainable:,}")
    print(f"{'='*60}\n")
    
    return model, base_model

def train_model(model, train_ds, val_ds):
    """Entrena el modelo - FASE 1"""
    print(f"\n{'='*60}")
    print(f"FASE 1: Entrenamiento inicial (20 épocas)")
    print(f"{'='*60}\n")
    
    os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
    
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            os.path.join(MODEL_SAVE_PATH, "best_model.keras"),
            save_best_only=True,
            monitor='val_accuracy',
            mode='max',
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=5,
            restore_best_weights=True,
            verbose=1,
            mode='max'
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        ),
        keras.callbacks.CSVLogger(
            os.path.join(MODEL_SAVE_PATH, "training_log.csv")
        )
    ]
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=20,
        callbacks=callbacks,
        verbose=1
    )
    
    return history

def fine_tune_model(model, base_model, train_ds, val_ds):
    """Fine-tuning - FASE 2"""
    print(f"\n{'='*60}")
    print(f"FASE 2: Fine-tuning (30 épocas)")
    print(f"{'='*60}\n")
    
    # Descongelar últimas capas
    base_model.trainable = True
    
    # Congelar todo excepto las últimas 30 capas
    for layer in base_model.layers[:-30]:
        layer.trainable = False
    
    trainable = sum([tf.size(w).numpy() for w in model.trainable_weights])
    print(f"Parámetros entrenables ahora: {trainable:,}\n")
    
    # Recompilar con learning rate más bajo
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.0001),
        loss='sparse_categorical_crossentropy',
        metrics=[
            'accuracy',
            keras.metrics.SparseTopKCategoricalAccuracy(k=5, name='top5_accuracy')
        ]
    )
    
    callbacks = [
        keras.callbacks.ModelCheckpoint(
            os.path.join(MODEL_SAVE_PATH, "best_model_finetuned.keras"),
            save_best_only=True,
            monitor='val_accuracy',
            mode='max',
            verbose=1
        ),
        keras.callbacks.EarlyStopping(
            monitor='val_accuracy',
            patience=5,
            restore_best_weights=True,
            verbose=1,
            mode='max'
        ),
        keras.callbacks.CSVLogger(
            os.path.join(MODEL_SAVE_PATH, "finetuning_log.csv")
        )
    ]
    
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=30,
        callbacks=callbacks,
        verbose=1
    )
    
    return history

def save_model_and_metadata(model, class_names, history):
    """Guarda el modelo y metadatos"""
    print(f"\n{'='*60}")
    print("Guardando modelo y metadatos...")
    print(f"{'='*60}\n")
    
    os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
    
    model_path = os.path.join(MODEL_SAVE_PATH, "pet_classifier_model.keras")
    model.save(model_path)
    print(f"✓ Modelo guardado en: {model_path}")
    
    metadata = {
        "class_names": class_names,
        "num_classes": len(class_names),
        "image_size": IMAGE_SIZE,
        "model_architecture": "MobileNetV2",
        "normalization": "mobilenet: (x / 127.5) - 1.0",
        "training_accuracy": float(history.history['accuracy'][-1]),
        "validation_accuracy": float(history.history['val_accuracy'][-1]),
        "top5_accuracy": float(history.history['top5_accuracy'][-1]),
        "dataset": "Stanford Dogs Dataset"
    }
    
    labels_path = os.path.join(MODEL_SAVE_PATH, "class_labels.json")
    with open(labels_path, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"✓ Metadatos guardados")

def main():
    """Función principal"""
    print("\n" + "="*60)
    print("ENTRENAMIENTO - CLASIFICADOR CON MOBILENETV2")
    print("="*60 + "\n")
    
    gpus = tf.config.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_memory_growth(gpu, True)
            print(f"✓ GPU: {gpus[0].name}\n")
        except RuntimeError as e:
            print(f"⚠ Error: {e}\n")
    else:
        print("⚠ Usando CPU\n")
    
    train_files, train_labels, test_files, test_labels, class_names = load_stanford_splits()
    
    print("\nCreando datasets...")
    train_ds = create_tf_dataset(train_files, train_labels, is_training=True)
    val_ds = create_tf_dataset(test_files, test_labels, is_training=False)
    print("✓ Datasets creados\n")
    
    model, base_model = create_model(len(class_names))
    
    # Fase 1: Entrenar solo las capas superiores
    history1 = train_model(model, train_ds, val_ds)
    
    # Fase 2: Fine-tuning
    history2 = fine_tune_model(model, base_model, train_ds, val_ds)
    
    save_model_and_metadata(model, class_names, history2)
    
    print("\n" + "="*60)
    print("ENTRENAMIENTO COMPLETADO")
    print("="*60)
    print(f"Precisión final: {history2.history['val_accuracy'][-1]*100:.2f}%")
    print(f"Top-5 Accuracy: {history2.history['top5_accuracy'][-1]*100:.2f}%")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()