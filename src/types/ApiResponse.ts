export interface DetectionResult {
  classification: "Original" | "AI-Generated" | "Deepfake";
  confidenceScore: number;
  analyzedAt?: Date;
  mediaUrl?: string;
  modelUsed?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;

  // Authentication / user system
  isAuthenticated?: boolean;
  tokensRemaining?: number;

  // Detection response
  detectionResult?: DetectionResult;

  // Upload & history
  uploadedFileUrl?: string;
  detectionHistory?: DetectionResult[];

  // Error handling
  error?: string;
}