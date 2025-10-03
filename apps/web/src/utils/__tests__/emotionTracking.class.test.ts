import { EmotionTracker } from '../emotionTracking';

describe('EmotionTracker', () => {
  const fetchMock = global.fetch as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does nothing when disabled', async () => {
    const tracker = new EmotionTracker({ enabled: false });

    await tracker.trackTextInput('This should be ignored', 'context');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('skips short text inputs', async () => {
    const tracker = new EmotionTracker();

    await tracker.trackTextInput('hi', 'context');

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts input text to emotion analysis endpoint', async () => {
    const tracker = new EmotionTracker();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true, analysis: { primary_emotion: 'joy' } }) });

    await tracker.trackTextInput('Long enough text', 'hero', 5);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/emotions/analyze',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ text: 'Long enough text', context: 'hero', userId: 5 }),
      }),
    );
  });

  it('swallows non-ok responses gracefully', async () => {
    const tracker = new EmotionTracker({ debug: true });
    fetchMock.mockResolvedValue({ ok: false, status: 500, statusText: 'Error', json: async () => ({}) });

    await expect(tracker.trackTextInput('Valid text', 'ctx')).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('delegates interaction events to text tracking', async () => {
    const tracker = new EmotionTracker();
    const spy = jest.spyOn(tracker, 'trackTextInput') as jest.SpyInstance<Promise<void>, Parameters<EmotionTracker['trackTextInput']>>;
    spy.mockResolvedValue();

    await tracker.trackPageInteraction({
      type: 'button_click',
      element: 'Signup',
      timestamp: Date.now(),
      context: '/pricing',
    });

    expect(spy).toHaveBeenCalledWith(expect.any(String), '/pricing', undefined, 'interaction');
    spy.mockRestore();
  });
});
