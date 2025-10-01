import { v4 as uuid } from 'uuid';

// Let's adjust the import path to be relative for now.
// The final path might need to be adjusted once the project is properly configured.
import {
  AnalysisId as DomainAnalysisId,
  Emotion as DomainEmotion,
  AnalysisResult as DomainAnalysisResult,
  EmotionAnalysis as DomainEmotionAnalysis,
} from '@nexus/domain/emotion';


export class EmotionAnalysisBuilder {
  private _id: DomainAnalysisId = new DomainAnalysisId(uuid());
  private _text: string = 'This is a test text for analysis.';
  private _emotion: DomainEmotion = DomainEmotion.NEUTRAL;
  private _confidence: number = 0.99;

  withId(id: string): EmotionAnalysisBuilder {
    this._id = new DomainAnalysisId(id);
    return this;
  }

  withText(text: string): EmotionAnalysisBuilder {
    this._text = text;
    return this;
  }

  withEmotion(emotion: DomainEmotion): EmotionAnalysisBuilder {
    this._emotion = emotion;
    return this;
  }

  withConfidence(confidence: number): EmotionAnalysisBuilder {
    this._confidence = confidence;
    return this;
  }

  build(): DomainEmotionAnalysis {
    const result = DomainAnalysisResult.create(this._emotion, this._confidence);
    return DomainEmotionAnalysis.create(this._id, this._text, result);
  }
}
