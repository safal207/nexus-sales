import 'server-only';
import { Emotion, AnalysisResult } from '@nexus/domain/emotion';

// Interface for the service, good for dependency inversion
export interface IEmotionAnalysisService {
  analyzeText(text: string): Promise<AnalysisResult>;
}

// The structure of the response from the Hugging Face API
type HuggingFaceApiResponse = {
  label: string;
  score: number;
}[][];

type CacheEntry = {
  value: AnalysisResult;
  expiresAt: number;
};

export class HuggingFaceEmotionService implements IEmotionAnalysisService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly requestTimeoutMs: number;
  private readonly cacheTtlMs: number;
  private cache: Map<string, CacheEntry> = new Map();
  private pending: Map<string, Promise<AnalysisResult>> = new Map();

  constructor(model: string = 'SamLowe/roberta-base-go_emotions', options?: { timeoutMs?: number; cacheTtlMs?: number }) {
    this.apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    
    // As per ARCHITECTURE_V1.md, the key is in the environment variables
    this.apiKey = process.env.HUGGING_FACE_KEY || '';
    if (!this.apiKey) {
      console.warn('HUGGING_FACE_KEY environment variable not set. API calls will likely fail.');
    }

    this.requestTimeoutMs = Math.max(500, options?.timeoutMs ?? 2500);
    this.cacheTtlMs = Math.max(5000, options?.cacheTtlMs ?? 60_000);
  }

  public async analyzeText(text: string): Promise<AnalysisResult> {
    if (!text.trim()) {
      return AnalysisResult.create(Emotion.NEUTRAL, 1.0);
    }

    const key = this.buildCacheKey(text);

    // Return cached value if fresh
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    // De-duplicate concurrent requests for the same text
    const existing = this.pending.get(key);
    if (existing) return existing;

    const exec = (async (): Promise<AnalysisResult> => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

        const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
        signal: controller.signal,
      });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text();
          console.error('Hugging Face API Error:', response.status, errorBody);
          throw new Error(`Hugging Face API request failed with status ${response.status}`);
        }

        const predictions: HuggingFaceApiResponse = await response.json();
      
        const [firstPrediction] = predictions;
        if (!firstPrediction || firstPrediction.length === 0) {
          throw new Error('Could not determine top emotion from API response: empty predictions.');
        }

        // Find the emotion with the highest score
        const topEmotion = firstPrediction.reduce((prev, current) => (prev.score > current.score ? prev : current));

        // Map the API response label to our domain Emotion
        const emotion = Emotion.create(topEmotion.label);
        const confidence = topEmotion.score;

        const result = AnalysisResult.create(emotion, confidence);
        // Cache the result
        this.cache.set(key, { value: result, expiresAt: Date.now() + this.cacheTtlMs });
        return result;

      } catch (error) {
        console.error('Failed to analyze emotion:', error);
        throw error;
      } finally {
        this.pending.delete(key);
      }
    })();

    this.pending.set(key, exec);
    return exec;
  }

  private buildCacheKey(text: string): string {
    return text.trim().toLowerCase();
  }
}
