const fetchMock = global.fetch as jest.Mock;

describe('EmotionAnalysisService', () => {
  const originalEnv = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY = originalEnv;
  });

  it('falls back to mock analysis when API key missing', async () => {
    const { emotionAnalysisService } = await import('../emotionAnalysis');
    fetchMock.mockClear();

    const result = await emotionAnalysisService.analyzeEmotion({ text: 'generic text' });

    expect(result.dominantEmotion).toBe('neutral');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('calls Hugging Face API when key is present', async () => {
    process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY = 'test-key';
    const { emotionAnalysisService } = await import('../emotionAnalysis');

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [[{ label: 'joy', score: 0.9 }]],
    });

    const result = await emotionAnalysisService.analyzeEmotion({ text: 'We are thrilled!' });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('huggingface'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-key' }),
      }),
    );
    expect(result.dominantEmotion).toBe('joy');
    expect(result.confidence).toBe(0.9);
  });

  it('returns neutral fallback when API call fails', async () => {
    process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY = 'test-key';
    const { emotionAnalysisService } = await import('../emotionAnalysis');

    fetchMock.mockResolvedValue({ ok: false, status: 500, statusText: 'error', json: async () => ({}) });

    const result = await emotionAnalysisService.analyzeEmotion({ text: 'failure case' });

    expect(result.dominantEmotion).toBe('neutral');
    expect(result.emotions[0]).toEqual({ label: 'neutral', score: 0.5 });
  });
});
