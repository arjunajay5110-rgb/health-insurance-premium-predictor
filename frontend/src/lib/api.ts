import { PredictionInput, PredictionResultData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getHealthStatus(): Promise<{ status: string; model_loaded: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.error('Backend health check error:', err);
    return { status: 'offline', model_loaded: false };
  }
}

export async function predictPremium(data: PredictionInput): Promise<PredictionResultData> {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    let errorMessage = 'Failed to generate premium prediction';
    
    if (typeof errorData.detail === 'string') {
      errorMessage = errorData.detail;
    } else if (Array.isArray(errorData.detail)) {
      errorMessage = errorData.detail.map((e: { msg: string }) => e.msg).join(', ');
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}
