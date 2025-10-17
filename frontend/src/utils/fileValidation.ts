export const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/bmp',
];

export const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateImageFile = (file: File): FileValidationResult => {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Por favor selecciona una imagen válida (JPG, PNG, GIF, BMP)',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: 'La imagen es demasiado grande. Máximo 16MB',
    };
  }

  return { isValid: true };
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};