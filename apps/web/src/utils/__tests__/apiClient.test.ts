import { apiClient } from '../api';

describe.skip('ApiClient', () => {
  const fetchMock = global.fetch as jest.Mock;
  let getItemSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    getItemSpy = jest.spyOn(global.localStorage, 'getItem');
    getItemSpy.mockReturnValue(null);
  });

  afterEach(() => {
    getItemSpy.mockRestore();
  });

  function mockResponse<T>(data: T, status = 200) {
    fetchMock.mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'ERROR',
      json: async () => data,
    });
  }

  it('appends bearer token header when token exists', async () => {
    getItemSpy.mockReturnValue('secure-token');
    mockResponse({ success: true, products: [] });

    await apiClient.getProducts();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/products'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer secure-token' }),
      }),
    );
  });

  it('merges custom request options for trackEvent', async () => {
    mockResponse({ success: true });

    await apiClient.trackEvent({ type: 'click', payload: { id: 'cta' } });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/events'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ type: 'click', payload: { id: 'cta' } }),
      }),
    );
  });

  it('throws descriptive error when response is not ok', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error', json: async () => ({}) });

    await expect(apiClient.getProducts()).rejects.toThrow('API Error: 500 Server Error');
  });
});
