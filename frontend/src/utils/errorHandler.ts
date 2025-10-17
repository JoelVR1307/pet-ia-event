import { AxiosError } from 'axios';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      return 'Error al conectar con el servidor. Verifica que el backend esté en ejecución.';
    }
  }
  return 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
};