import { track, trackBatch } from '../tracking';

jest.mock('../api', () => ({
  apiClient: {
    trackEvent: jest.fn(),
    trackBatchEvents: jest.fn(),
  },
}));

const apiModule = jest.requireMock('../api') as { apiClient: { trackEvent: jest.Mock; trackBatchEvents: jest.Mock } };
const trackEventMock = apiModule.apiClient.trackEvent;
const trackBatchEventsMock = apiModule.apiClient.trackBatchEvents;

describe.skip('tracking utilities', () => {
  const consoleError = console.error as jest.Mock;
  let sessionGetSpy: jest.SpyInstance;
  let sessionSetSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    sessionGetSpy = jest.spyOn(sessionStorage, 'getItem');
    sessionSetSpy = jest.spyOn(sessionStorage, 'setItem');
    sessionGetSpy.mockReturnValue('session-123');
  });

  afterEach(() => {
    sessionGetSpy.mockRestore();
    sessionSetSpy.mockRestore();
  });

  it('enriches events before forwarding to API', async () => {
    await track({ type: 'page_view', context: '/home' });

    expect(trackEventMock).toHaveBeenCalledTimes(1);
    const payload = trackEventMock.mock.calls[0][0];
    expect(payload.type).toBe('page_view');
    expect(payload.context).toBe('/home');
    expect(payload.sessionId).toBe('session-123');
    expect(payload.metadata).toMatchObject({ userAgent: expect.any(String), url: expect.any(String) });
  });

  it('creates session id when missing', async () => {
    sessionGetSpy.mockReturnValueOnce(null);
    sessionSetSpy.mockImplementation(() => undefined);

    await track({ type: 'button_click', context: '/pricing' });

    expect(sessionSetSpy).toHaveBeenCalled();
    expect(trackEventMock).toHaveBeenCalled();
  });

  it('reports errors from api client gracefully', async () => {
    trackEventMock.mockRejectedValueOnce(new Error('network down'));

    await track({ type: 'form_input', context: '/signup' });

    expect(consoleError).toHaveBeenCalledWith('Failed to track event:', expect.any(Error));
  });

  it('tracks batches with derived metadata', async () => {
    await trackBatch([
      { type: 'page_view', context: '/one' },
      { type: 'page_view', context: '/two', metadata: { campaign: 'launch' } },
    ]);

    expect(trackBatchEventsMock).toHaveBeenCalledTimes(1);
    const batchPayload = trackBatchEventsMock.mock.calls[0][0];
    expect(batchPayload).toHaveLength(2);
    expect(batchPayload[0].sessionId).toBe('session-123');
    expect(batchPayload[1].metadata).toMatchObject({ campaign: 'launch', userAgent: expect.any(String) });
  });

  it('handles batch errors', async () => {
    trackBatchEventsMock.mockRejectedValueOnce(new Error('timeout'));

    await trackBatch([{ type: 'page_view', context: '/err' }]);

    expect(consoleError).toHaveBeenCalledWith('Failed to track batch events:', expect.any(Error));
  });
});
