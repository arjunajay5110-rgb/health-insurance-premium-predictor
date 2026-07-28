import { PredictionInput, PredictionResultData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function predictPremium(input: PredictionInput): Promise<PredictionResultData> {
  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail
      ? typeof errorData.detail === 'string'
        ? errorData.detail
        : JSON.stringify(errorData.detail)
      : 'Failed to generate prediction from backend API';
    throw new Error(message);
  }

  return response.json();
}

export async function predictFamilyPremium(familyPayload: {
  region: string;
  members: any[];
}): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/predict/family`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(familyPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || 'Failed to estimate family floater premium';
    throw new Error(message);
  }

  return response.json();
}

export async function sendAdvisorChat(
  message: string,
  predictionContext?: PredictionResultData | null,
  history?: { role: string; content: string }[]
): Promise<{ success: boolean; reply: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/api/advisor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      prediction_context: predictionContext,
      history,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || 'AI Advisor service is currently unavailable';
    throw new Error(message);
  }

  return response.json();
}

export async function searchGlossaryTerm(query: string): Promise<{ success: boolean; term: string; definition: string; source: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/api/advisor/glossary-search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || 'Glossary search service unavailable';
    throw new Error(message);
  }

  return response.json();
}
