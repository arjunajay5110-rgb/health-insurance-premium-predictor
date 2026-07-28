export interface PredictionInput {
  age: number;
  gender: 'female' | 'male';
  smoker: 'yes' | 'no';
  region: 'northeast' | 'northwest' | 'southeast' | 'southwest';
  children: number;
  bmi?: number;
  height_cm?: number;
  weight_kg?: number;
}

export interface HealthSnapshotData {
  age: number;
  gender: string;
  bmi: number;
  bmi_status: string;
  smoker: string;
  children: number;
  region: string;
  risk_level: string;
  health_score: number;
  health_status: string;
}

export interface PredictionInputsSummary {
  age: number;
  gender: string;
  bmi: number;
  children: number;
  smoker: string;
  region: string;
  bmi_category_obese: boolean;
}

export interface PredictionResultData {
  success: boolean;
  annual_premium: number;
  monthly_premium: number;
  currency: string;
  model: string;
  processing_time_ms: number;
  health_snapshot: HealthSnapshotData;
  inputs: PredictionInputsSummary;
}

export interface ApiErrorResponse {
  detail: string | { msg: string; loc?: (string | number)[] }[];
}
