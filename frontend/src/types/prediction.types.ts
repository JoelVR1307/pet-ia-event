export interface PredictionResult {
  success: boolean;
  breed: string;
  confidence: number;
  top_5_predictions?: Array<{
    breed: string;
    confidence: number;
  }>;
  model_info?: {
    architecture: string;
    dataset: string;
    num_classes: number;
    validation_accuracy: number;
  };
}

export interface PredictionError {
  message: string;
  statusCode?: number;
}