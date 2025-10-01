import { AnalysisResult } from './AnalysisResult';

// Simple Value Object for the ID
export class AnalysisId {
    constructor(private readonly value: string) {
        if (!value) {
            throw new Error("AnalysisId cannot be empty");
        }
    }

    toString(): string {
        return this.value;
    }
}


export class EmotionAnalysis {
  private constructor(
    public readonly id: AnalysisId,
    public readonly text: string,
    public readonly result: AnalysisResult,
    public readonly analyzedAt: Date,
  ) {}

  public static create(
    id: AnalysisId,
    text: string,
    result: AnalysisResult,
  ): EmotionAnalysis {
    if (!text) {
      throw new Error('Text for analysis cannot be empty.');
    }
    return new EmotionAnalysis(id, text, result, new Date());
  }
}
