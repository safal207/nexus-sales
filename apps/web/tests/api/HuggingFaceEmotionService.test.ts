import { HuggingFaceEmotionService } from '../../src/services/ai/huggingface/HuggingFaceEmotionService';
import { Emotion } from '@nexus/domain/emotion';

// Mock the global fetch function
global.fetch = jest.fn();

describe('HuggingFaceEmotionService', () => {
  let service: HuggingFaceEmotionService;

  beforeEach(() => {
    // Reset mocks before each test
    (global.fetch as jest.Mock).mockClear();
    service = new HuggingFaceEmotionService();
    // Mock the API key
    process.env.HUGGING_FACE_KEY = 'test-api-key';
  });

  it('should return a neutral emotion for empty text without calling the API', async () => {
    const result = await service.analyzeText('   ');
    expect(result.emotion).toEqual(Emotion.NEUTRAL);
    expect(result.confidence).toBe(1.0);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should analyze text and return the top emotion', async () => {
    const mockApiResponse = [[
      { label: 'joy', score: 0.9 },
      { label: 'sadness', score: 0.1 },
    ]];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await service.analyzeText('I am so happy!');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: 'I am so happy!' }),
      })
    );
    expect(result.emotion).toEqual(Emotion.JOY);
    expect(result.confidence).toBe(0.9);
  });

  it('should throw an error if the API request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    await expect(service.analyzeText('This will fail')).rejects.toThrow(
      'Hugging Face API request failed with status 500'
    );
  });
  
  it('should throw an error if the API response is malformed', async () => {
    const mockApiResponse = [[]]; // Empty array in the response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    await expect(service.analyzeText('This will also fail')).rejects.toThrow(
      'Could not determine top emotion from API response'
    );
  });
});
