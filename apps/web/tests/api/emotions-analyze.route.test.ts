import type { NextResponse } from 'next/server';

import { createMockNextRequest, readJsonResponse } from '../test-utils/api';

const analyzeEmotion = jest.fn();
const verifyToken = jest.fn();

jest.mock('@/services/ai/emotionAnalysis', () => ({
  emotionAnalysisService: {
    analyzeEmotion,
  },
}));

jest.mock('@/utils/auth', () => ({
  verifyToken,
}));

describe('/api/emotions/analyze routes', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete (globalThis as { __emotionHistoryCache?: unknown }).__emotionHistoryCache;
  });

  it('analyzes emotion for valid payload', async () => {
    const module = await import('@/app/api/emotions/analyze/route');
    analyzeEmotion.mockResolvedValue({ dominantEmotion: 'joy', confidence: 0.9 });

    const request = createMockNextRequest({
      method: 'POST',
      body: { text: 'Great launch!', context: 'marketing', userId: 5 },
    });

    const response = await module.POST(request);
    const payload = await readJsonResponse<{ success: boolean; analysis: { dominantEmotion: string } }>(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.success).toBe(true);
    expect(payload.body.analysis.dominantEmotion).toBe('joy');
    expect(analyzeEmotion).toHaveBeenCalledWith({ text: 'Great launch!', context: 'marketing', userId: 5 });
  });

  it('validates text presence on POST', async () => {
    const module = await import('@/app/api/emotions/analyze/route');
    const request = createMockNextRequest({ method: 'POST', body: { context: 'marketing' } });

    const response = await module.POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body).toEqual({ success: false, message: 'Text is required for analysis' });
    expect(analyzeEmotion).not.toHaveBeenCalled();
  });

  it('handles analysis service failures', async () => {
    const module = await import('@/app/api/emotions/analyze/route');
    analyzeEmotion.mockRejectedValue(new Error('service down'));

    const request = createMockNextRequest({
      method: 'POST',
      body: { text: 'oops', context: 'test', userId: 1 },
    });

    const response = await module.POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(500);
    expect(payload.body).toEqual({ success: false, message: 'Analysis failed' });
  });

  it('rejects missing authorization header on GET', async () => {
    verifyToken.mockReturnValue(null);
    const module = await import('@/app/api/emotions/analyze/route');
    const request = createMockNextRequest({ method: 'GET' });

    const response = await module.GET(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(401);
    expect(payload.body).toEqual({ success: false, message: 'Unauthorized' });
  });

  it.skip('returns cached emotion history', async () => {
    verifyToken.mockReturnValue({ userId: 77 });
    const module = await import('@/app/api/emotions/analyze/route');

    const originalGet = Map.prototype.get;
    const sampleEmotions = [{ emotion: 'joy', score: 0.8 }];
    const getSpy = jest.spyOn(Map.prototype, 'get').mockImplementation(function (this: Map<number, unknown[]>, key: number) {
      if (key === 77) {
        return sampleEmotions;
      }
      return originalGet.call(this, key);
    });

    const request = createMockNextRequest({ method: 'GET', headers: { authorization: 'Bearer token' } });

    const response = await module.GET(request);
    const payload = await readJsonResponse<{ success: boolean; stats: { total_emotions: number } }>(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.success).toBe(true);
    expect(payload.body.stats.total_emotions).toBe(sampleEmotions.length);

    getSpy.mockClear();

    const cachedResponse = await module.GET(createMockNextRequest({ method: 'GET', headers: { authorization: 'Bearer token' } }));
    const cachedPayload = await readJsonResponse(cachedResponse as NextResponse);

    expect(cachedPayload.status).toBe(200);
    expect(cachedPayload.body).toEqual(payload.body);
    expect(getSpy).not.toHaveBeenCalled();

    getSpy.mockRestore();
  });
});
