import { Emotion } from './Emotion';

export class AnalysisResult {
  private constructor(
    public readonly emotion: Emotion,
    public readonly confidence: number,
  ) {}

  public static create(emotion: Emotion, confidence: number): AnalysisResult {
    if (confidence < 0 || confidence > 1) {
      throw new Error('Confidence must be between 0 and 1.');
    }
    return new AnalysisResult(emotion, confidence);
  }
}
