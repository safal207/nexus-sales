
export class Emotion {
  public static readonly JOY = new Emotion('joy');
  public static readonly SADNESS = new Emotion('sadness');
  public static readonly ANGER = new Emotion('anger');
  public static readonly FEAR = new Emotion('fear');
  public static readonly SURPRISE = new Emotion('surprise');
  public static readonly NEUTRAL = new Emotion('neutral');

  private static readonly validEmotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral'];

  private constructor(public readonly value: string) {}

  public static create(value: string): Emotion {
    const lowerCaseValue = value.toLowerCase();
    if (!Emotion.validEmotions.includes(lowerCaseValue)) {
      throw new Error(`Invalid emotion: ${value}. Must be one of [${Emotion.validEmotions.join(', ')}].`);
    }
    return new Emotion(lowerCaseValue);
  }

  public equals(other: Emotion): boolean {
    return this.value === other.value;
  }
}
