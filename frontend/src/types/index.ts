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

export interface PredictionInputsSummary {
  age: number;
  gender: string;
  bmi: number;
  children: number;
  smoker: string;
  region: string;
  bmi_category_obese: boolean;
}

export interface CurrencyConfig {
  rate: number;
  symbol: string;
  flag: string;
  name: string;
}

export interface PredictionResultData {
  success: boolean;
  estimated_premium: number;
  estimated_premium_inr: number;
  base_usd_premium: number;
  currency: string;
  currency_code: string;
  model: string;
  processing_time_ms: number;
  exchange_rates: Record<string, CurrencyConfig>;
  inputs: PredictionInputsSummary;
}

export interface ApiErrorResponse {
  detail: string | { msg: string; loc?: (string | number)[] }[];
}
