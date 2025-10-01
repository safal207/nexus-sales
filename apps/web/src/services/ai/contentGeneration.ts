/**
 * AI Content Generation Service
 * Локально формирует эмоциональные тексты для разных каналов и поддерживает многоязычность.
 */

export interface ContentGenerationInput {
  emotion: string;
  context: 'landing' | 'sales' | 'support' | 'email' | 'social';
  targetAudience?: string;
  product?: string;
  goal?: string;
  tone?: 'formal' | 'casual' | 'empathetic' | 'enthusiastic' | 'professional';
  length?: 'short' | 'medium' | 'long';
  language?: SupportedLanguage;
}

export interface ContentGenerationResult {
  content: string;
  suggestions: string[];
  seoOptimized: boolean;
  emotionalMatch: number;
  confidence: number;
  language: SupportedLanguage;
}

type SupportedLanguage = 'ru' | 'en';
type EmotionKey =
  | 'joy'
  | 'trust'
  | 'fear'
  | 'surprise'
  | 'sadness'
  | 'anger'
  | 'anticipation'
  | 'confusion';
type EmotionLookupKey = EmotionKey | 'default';
type ContentContext = ContentGenerationInput['context'];
type ReplacementMap = Record<string, string>;

const DEFAULT_LANGUAGE: SupportedLanguage = 'ru';

const CTA_LIBRARY: Record<SupportedLanguage, string> = {
  ru: 'призывом к действию — «Попробовать бесплатно» или «Записаться на демо»',
  en: 'a clear call to action such as “Start a free trial” or “Book a demo”',
};

const LONG_DETAILS: Record<SupportedLanguage, string> = {
  ru: 'Добавьте мини-кейс или цифры, показывающие, как {{product}} сопровождает {{audience}} и помогает достигать {{goalShort}}. Уточните, какой следующий шаг ждёт клиента.',
  en: 'Add a short case or metric showing how {{product}} supports {{audience}} and drives {{goalShort}}. Clarify the next step for the reader.',
};

const EMOTION_MESSAGES: Record<SupportedLanguage, Record<EmotionLookupKey, string>> = {
  ru: {
    joy: 'Создайте ощущение праздника: покажите, что клиент уже сделал правильный выбор.',
    trust: 'Подчеркните надёжность и прозрачность решения, чтобы укрепить доверие.',
    fear: 'Снимите тревогу: объясните, как вы снижаете риски и всегда поддерживаете клиента.',
    surprise: 'Добавьте элемент приятного сюрприза: расскажите о бонусах и неожиданных выгодах.',
    sadness: 'Покажите поддержку и заботу: объясните, как ваше решение улучшает повседневность.',
    anger: 'Направьте энергию клиента в действие, предложив честный и быстрый выход.',
    anticipation: 'Подогрейте ожидание: покажите, что будет после начала сотрудничества.',
    confusion: 'Разложите предложение по шагам и сделайте следующий шаг очевидным.',
    default: 'Сформулируйте ценность и объясните, что клиент получает прямо сейчас.',
  },
  en: {
    joy: 'Lean into celebration and show that the reader already made a smart decision.',
    trust: 'Underline reliability and transparency so the reader feels safe to proceed.',
    fear: 'Reduce anxiety by clarifying how you control the risk and stay beside the customer.',
    surprise: 'Add delightful extras—highlight unexpected bonuses or speed of delivery.',
    sadness: 'Respond with care: explain how your solution makes everyday work easier.',
    anger: 'Channel the frustration into action with a fast, honest way to fix the issue.',
    anticipation: 'Build anticipation by revealing what happens right after the purchase.',
    confusion: 'Break the message into simple steps and make the next move unmistakable.',
    default: 'State the core value and clarify what happens right after the reader says yes.',
  },
};

const EMOTION_FOCUS: Record<SupportedLanguage, Record<EmotionLookupKey, string>> = {
  ru: {
    joy: 'радость и ощущение победы',
    trust: 'чувство безопасности',
    fear: 'снижение тревоги',
    surprise: 'приятное удивление',
    sadness: 'поддержку и заботу',
    anger: 'желание быстро исправить ситуацию',
    anticipation: 'ожидание и предвкушение',
    confusion: 'потребность в ясности',
    default: 'эмоциональный отклик',
  },
  en: {
    joy: 'joy and a sense of achievement',
    trust: 'a feeling of safety',
    fear: 'lowering anxiety',
    surprise: 'pleasant surprise',
    sadness: 'care and reassurance',
    anger: 'the urge to fix things fast',
    anticipation: 'anticipation and excitement',
    confusion: 'a need for clarity',
    default: 'an emotional connection',
  },
};

const TONE_MODIFIERS: Record<SupportedLanguage, Partial<Record<NonNullable<ContentGenerationInput['tone']>, { prefix?: string; suffix?: string }>>> = {
  ru: {
    empathetic: { prefix: 'Покажите, что понимаете эмоции клиента: {{emotionFocus}}.' },
    formal: {
      prefix: 'Сформулируйте сообщение в деловом ключе и придерживайтесь структуры.',
      suffix: 'Завершите выдержанной формулировкой ценности.',
    },
    casual: { prefix: 'Пишите простым языком, будто разговариваете с коллегой.' },
    enthusiastic: { prefix: 'Передайте энергию и чувство победы, подчеркнув быстрый результат.' },
    professional: { prefix: 'Соберите текст из чётких тезисов и уберите всё лишнее.' },
  },
  en: {
    empathetic: { prefix: 'Open with empathy and acknowledge {{emotionFocus}}.' },
    formal: {
      prefix: 'Keep the structure sharp and business-oriented.',
      suffix: 'Close with a confident, data-backed statement of value.',
    },
    casual: { prefix: 'Use friendly, everyday language as if you were chatting with a teammate.' },
    enthusiastic: { prefix: 'Let the excitement shine through and celebrate the upcoming results.' },
    professional: { prefix: 'Lead with clarity and authority; remove any fluff.' },
  },
};

const CONTENT_BLUEPRINTS: Record<ContentContext, Record<SupportedLanguage, string>> = {
  landing: {
    ru: '{{emotionMessage}} Покажите, как {{product}} помогает {{audience}} быстрее добиваться {{goal}} и делиться измеримыми результатами. Усильте ценность конкретным преимуществом и завершите {{cta}}.',
    en: '{{emotionMessage}} Show how {{product}} helps {{audience}} reach {{goal}} faster and deliver measurable results. Highlight a proof point and close with {{cta}}.',
  },
  sales: {
    ru: '{{emotionMessage}} Разбейте предложение на понятные шаги и объясните, чем решение {{product}} отличается от альтернатив. Подчеркните выгоды для {{audience}} и покажите, как предложение помогает {{goalShort}}. Завершите {{cta}}.',
    en: '{{emotionMessage}} Break the offer into clear steps and explain how {{product}} stands apart from other solutions. Tie every benefit to {{audience}} and the outcome of {{goalShort}}. Finish with {{cta}}.',
  },
  support: {
    ru: '{{emotionMessage}} Объясните, как команда сопровождения отвечает клиентам: каналы связи, время реакции, база знаний. Покажите, что {{product}} остаётся рядом на каждом шаге и помогает достигать {{goalShort}}.',
    en: '{{emotionMessage}} Explain how the support team responds: channels, response times, knowledge base. Show that {{product}} stays close at every step and keeps customers moving toward {{goalShort}}.',
  },
  email: {
    ru: '{{emotionMessage}} Откройте письмо персональным обращением и напомните, как {{product}} помогает {{audience}} продвигаться к {{goalShort}}. Держите одно главное сообщение, добавьте доказательство и завершите {{cta}}.',
    en: '{{emotionMessage}} Open with a personal hook and remind how {{product}} helps {{audience}} advance toward {{goalShort}}. Keep one core message, add proof, and wrap up with {{cta}}.',
  },
  social: {
    ru: '{{emotionMessage}} Расскажите короткую историю: проблема → решение → результат, где {{product}} помогает {{audience}} делать {{goalShort}} быстрее. Завершите динамичным CTA и 2–3 хэштегами.',
    en: '{{emotionMessage}} Tell a short story—problem → solution → result—showing how {{product}} helps {{audience}} achieve {{goalShort}} faster. End with a lively CTA and a couple of hashtags.',
  },
};

const SUGGESTION_LIBRARY: Record<ContentContext | 'generic', Record<SupportedLanguage, string[]>> = {
  landing: {
    ru: [
      'Соберите главный экран: заголовок + подзаголовок, где {{product}} решает задачу {{audience}}.',
      'Добавьте социальное доказательство — логотипы клиентов или короткий кейс про {{goalShort}}.',
      'Отделите CTA визуально, чтобы {{audience}} сразу увидели {{nextStep}}.',
    ],
    en: [
      'Use a headline plus subheadline that shows how {{product}} solves the main challenge for {{audience}}.',
      'Drop in a proof point—metric or quote—linked directly to {{goalShort}}.',
      'Make the CTA block visually distinct so {{audience}} instantly sees {{nextStep}}.',
    ],
  },
  sales: {
    ru: [
      'Используйте таблицу «проблема → решение» и покажите, как предложение усиливает {{emotionFocus}}.',
      'Добавьте бонус или гарантию для тех, кто хочет {{goalShort}} быстрее.',
      'Завершите блоком вопросов и ответов, чтобы снять сомнения {{audienceShort}}.',
    ],
    en: [
      'Map the “problem → solution” table and show how the offer amplifies {{emotionFocus}}.',
      'Offer a bonus or guarantee for teams pursuing {{goalShort}} faster.',
      'Close with a concise FAQ to remove friction for {{audienceShort}}.',
    ],
  },
  support: {
    ru: [
      'Опишите все каналы поддержки и время ответа, чтобы закрепить чувство {{emotionFocus}}.',
      'Вставьте ссылку на базу знаний и примеры сценариев сопровождения от {{productRaw}}.',
      'Покажите реальный кейс, как команда помогла достигнуть {{goalShort}} после внедрения.',
    ],
    en: [
      'List every support channel with response times to reinforce {{emotionFocus}}.',
      'Link to the knowledge base and onboarding materials powered by {{productRaw}}.',
      'Share a customer story that highlights progress toward {{goalShort}} after launch.',
    ],
  },
  email: {
    ru: [
      'В теме письма подчеркните выгоду: {{productRaw}} помогает {{audienceShort}}.',
      'Держите текст в одном экране и выделите кнопку с CTA, отражающую {{nextStep}}.',
      'Добавьте P.S. с бесплатным ресурсом или приглашением на встречу.',
    ],
    en: [
      'Craft the subject line around the benefit: {{productRaw}} helps {{audienceShort}}.',
      'Keep the message scannable, highlight one CTA, and make {{nextStep}} explicit.',
      'Use a P.S. to add a resource or invite the reader to a quick call.',
    ],
  },
  social: {
    ru: [
      'Используйте формат «до/после», чтобы аудитория увидела {{goalShort}} сразу.',
      'Задайте вопрос в конце поста, чтобы вовлечь {{audienceShort}} в обсуждение.',
      'Добавьте 2–3 релевантных хэштега и визуал, который поддерживает {{emotionFocus}}.',
    ],
    en: [
      'Use a before/after snapshot so people see {{goalShort}} immediately.',
      'Finish with a question to spark conversation with {{audienceShort}}.',
      'Pair the copy with 2–3 relevant hashtags and a visual supporting {{emotionFocus}}.',
    ],
  },
  generic: {
    ru: [
      'Начните с проблемы клиента и сразу покажите, как {{product}} решает её.',
      'Поясните, почему сейчас лучший момент действовать, и обозначьте {{nextStep}}.',
      'Завершите конкретным CTA и добавьте социальное доказательство.',
    ],
    en: [
      'Start with the customer problem and immediately show how {{product}} solves it.',
      'Explain why acting now matters and spell out {{nextStep}}.',
      'Close with a confident CTA backed by proof or social validation.',
    ],
  },
};

const CONTEXT_DESCRIPTIONS: Record<ContentContext, Record<SupportedLanguage, string>> = {
  landing: { ru: 'приветственное сообщение', en: 'landing page copy' },
  sales: { ru: 'продающий текст', en: 'sales copy' },
  support: { ru: 'поддерживающее сообщение', en: 'support copy' },
  email: { ru: 'email-сообщение', en: 'email copy' },
  social: { ru: 'пост для соцсетей', en: 'social post' },
};

const EMOTION_SYNONYMS: Record<string, EmotionKey> = {
  happiness: 'joy',
  happy: 'joy',
  delight: 'joy',
  trustworthiness: 'trust',
  safe: 'trust',
  safety: 'trust',
  anxiety: 'fear',
  anxious: 'fear',
  worried: 'fear',
  excitement: 'anticipation',
  excited: 'anticipation',
  hopeful: 'anticipation',
  surprise: 'surprise',
  surprised: 'surprise',
  frustrated: 'anger',
  frustration: 'anger',
  angry: 'anger',
  sadness: 'sadness',
  sad: 'sadness',
  support: 'sadness',
  clarity: 'confusion',
  confused: 'confusion',
};

const SYSTEM_PROMPTS: Record<SupportedLanguage, string> = {
  ru: 'Ты — эксперт по маркетинговым текстам и эмоциям. Пиши на русском языке, держи фокус на выгоде, эмоции и призыве к действию.',
  en: 'You are an expert marketing copywriter who specialises in emotional resonance. Write in English, focus on value, emotion, and a clear call to action.',
};

function resolveLanguage(language?: string): SupportedLanguage {
  if (language === 'en') return 'en';
  if (language === 'ru') return 'ru';
  return DEFAULT_LANGUAGE;
}

function normalizeEmotionKey(emotion?: string): EmotionLookupKey {
  if (!emotion) return 'default';
  const normalized = emotion.toLowerCase().trim();
  if ((['joy', 'trust', 'fear', 'surprise', 'sadness', 'anger', 'anticipation', 'confusion'] as const).includes(normalized as EmotionKey)) {
    return normalized as EmotionKey;
  }
  return EMOTION_SYNONYMS[normalized] ?? 'default';
}

function renderTemplate(template: string, replacements: ReplacementMap): string {
  const rendered = template.replace(/\{\{(.*?)\}\}/g, (_, key: string) => {
    const value = replacements[key.trim()];
    return value !== undefined ? value : '';
  });
  return rendered.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1').trim();
}

function trimToLength(content: string, maxLength: number): string {
  if (content.length <= maxLength) {
    return content;
  }
  const truncated = content.slice(0, maxLength);
  const sentenceEnd = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'));
  if (sentenceEnd > maxLength * 0.6) {
    return truncated.slice(0, sentenceEnd + 1).trim();
  }
  return `${truncated.trim().replace(/[.,!?]*$/, '')}…`;
}

function buildReplacements(
  input: ContentGenerationInput,
  language: SupportedLanguage,
  emotionMessage: string,
  emotionFocus: string,
): ReplacementMap {
  const productRaw = input.product ?? (language === 'ru' ? 'вашего продукта' : 'your product');
  const product = input.product
    ? language === 'ru'
      ? `продукт «${input.product}»`
      : input.product
    : language === 'ru'
      ? 'ваш продукт'
      : 'your product';

  const audienceBase = input.targetAudience ?? (language === 'ru' ? 'ваших клиентов' : 'your customers');
  const audience = input.targetAudience
    ? language === 'ru'
      ? `клиентам из сегмента ${input.targetAudience}`
      : `customers like ${input.targetAudience}`
    : language === 'ru'
      ? 'вашим клиентам'
      : 'your customers';

  const goalShort = input.goal ?? (language === 'ru' ? 'ключевых результатов' : 'key results');
  const goal = input.goal
    ? language === 'ru'
      ? `целей вроде «${input.goal}»`
      : `goals such as "${input.goal}"`
    : language === 'ru'
      ? 'своих ключевых целей'
      : 'their key goals';

  return {
    product,
    productRaw,
    audience,
    audienceShort: audienceBase,
    goal,
    goalShort,
    cta: CTA_LIBRARY[language],
    emotionMessage,
    emotionFocus,
    nextStep: language === 'ru' ? 'следующий шаг' : 'the next step',
  };
}

class ContentGenerationService {
  private readonly openaiApiKey: string;
  private readonly model = 'gpt-4';

  constructor() {
    this.openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  }

  async generateContent(input: ContentGenerationInput): Promise<ContentGenerationResult> {
    const language = resolveLanguage(input.language);
    try {
      return await this.getMockContentGeneration(input, language);
    } catch (error) {
      console.error('Error generating content:', error);
      const emotionKey = normalizeEmotionKey(input.emotion);
      const emotionMessage = EMOTION_MESSAGES[language][emotionKey] ?? EMOTION_MESSAGES[language].default;
      const emotionFocus = EMOTION_FOCUS[language][emotionKey] ?? EMOTION_FOCUS[language].default;
      const replacements = buildReplacements(input, language, emotionMessage, emotionFocus);
      return {
        content: this.getFallbackContent(input, language),
        suggestions: this.generateSuggestions(input.context, language, replacements),
        seoOptimized: false,
        emotionalMatch: 0.5,
        confidence: 0.3,
        language,
      };
    }
  }

  private async getMockContentGeneration(
    input: ContentGenerationInput,
    language: SupportedLanguage,
  ): Promise<ContentGenerationResult> {
    const emotionKey = normalizeEmotionKey(input.emotion);
    const emotionMessage = EMOTION_MESSAGES[language][emotionKey] ?? EMOTION_MESSAGES[language].default;
    const emotionFocus = EMOTION_FOCUS[language][emotionKey] ?? EMOTION_FOCUS[language].default;
    const replacements = buildReplacements(input, language, emotionMessage, emotionFocus);

    const blueprint = CONTENT_BLUEPRINTS[input.context]?.[language] ?? CONTENT_BLUEPRINTS.landing[language];
    let content = renderTemplate(blueprint, replacements);
    content = this.applyTone(content, input.tone, language, replacements);
    content = this.applyLength(content, input.length, language, replacements);

    const suggestions = this.generateSuggestions(input.context, language, replacements);
    const emotionalMatch = this.estimateEmotionalMatch(emotionKey, input.tone);
    const confidence = this.estimateConfidence(emotionalMatch, input.tone, input.length);
    const seoOptimized = this.isSeoOptimized(content, language);

    return {
      content,
      suggestions,
      seoOptimized,
      emotionalMatch,
      confidence,
      language,
    };
  }

  private applyTone(
    content: string,
    tone: ContentGenerationInput['tone'] | undefined,
    language: SupportedLanguage,
    replacements: ReplacementMap,
  ): string {
    if (!tone) {
      return content;
    }
    const modifier = TONE_MODIFIERS[language]?.[tone];
    if (!modifier) {
      return content;
    }
    let result = content;
    if (modifier.prefix) {
      result = `${renderTemplate(modifier.prefix, replacements)} ${result}`.trim();
    }
    if (modifier.suffix) {
      result = `${result} ${renderTemplate(modifier.suffix, replacements)}`.trim();
    }
    return result;
  }

  private applyLength(
    content: string,
    length: ContentGenerationInput['length'] | undefined,
    language: SupportedLanguage,
    replacements: ReplacementMap,
  ): string {
    if (!length) {
      return content;
    }
    if (length === 'short') {
      return trimToLength(content, language === 'ru' ? 260 : 230);
    }
    if (length === 'long') {
      const appendix = renderTemplate(LONG_DETAILS[language], replacements);
      return `${content} ${appendix}`.trim();
    }
    return content;
  }

  private generateSuggestions(
    context: ContentContext,
    language: SupportedLanguage,
    replacements: ReplacementMap,
  ): string[] {
    const templates = SUGGESTION_LIBRARY[context]?.[language] || SUGGESTION_LIBRARY.generic[language];
    return templates.map((template) => renderTemplate(template, replacements));
  }

  private estimateEmotionalMatch(
    emotionKey: EmotionLookupKey,
    tone: ContentGenerationInput['tone'] | undefined,
  ): number {
    let score = emotionKey === 'default' ? 0.72 : 0.84;
    if (tone === 'empathetic' && (emotionKey === 'sadness' || emotionKey === 'fear')) {
      score += 0.05;
    }
    if (tone === 'enthusiastic' && (emotionKey === 'joy' || emotionKey === 'anticipation')) {
      score += 0.04;
    }
    if (tone === 'professional' && emotionKey === 'anger') {
      score -= 0.03;
    }
    return Number(Math.min(0.95, Math.max(0.55, score)).toFixed(2));
  }

  private estimateConfidence(
    emotionalMatch: number,
    tone: ContentGenerationInput['tone'] | undefined,
    length: ContentGenerationInput['length'] | undefined,
  ): number {
    let score = 0.6 + (emotionalMatch - 0.7) * 0.6;
    if (tone) {
      score += 0.03;
    }
    if (length === 'long') {
      score += 0.04;
    }
    if (length === 'short') {
      score -= 0.02;
    }
    return Number(Math.min(0.93, Math.max(0.5, score)).toFixed(2));
  }

  private isSeoOptimized(content: string, language: SupportedLanguage): boolean {
    const normalized = content.toLowerCase();
    const keywordList = language === 'ru'
      ? ['решение', 'клиент', 'результ', 'команда', 'платформ']
      : ['solution', 'customer', 'result', 'team', 'platform'];
    const callToActionList = language === 'ru'
      ? ['попроб', 'узнай', 'запиш', 'оставьте заявку']
      : ['try', 'discover', 'schedule', 'book', 'request'];
    const benefitList = language === 'ru'
      ? ['эконом', 'ускор', 'повыш', 'сниж']
      : ['save', 'accelerate', 'increase', 'reduce'];

    const hasKeyword = keywordList.some((word) => normalized.includes(word));
    const hasCallToAction = callToActionList.some((word) => normalized.includes(word));
    const hasBenefit = benefitList.some((word) => normalized.includes(word));

    return hasKeyword && hasCallToAction && hasBenefit;
  }

  private getFallbackContent(input: ContentGenerationInput, language: SupportedLanguage): string {
    const contextLabel = CONTEXT_DESCRIPTIONS[input.context]?.[language] ?? CONTEXT_DESCRIPTIONS.landing[language];
    const product = input.product ?? (language === 'ru' ? 'ваш продукт' : 'your product');
    if (language === 'ru') {
      return `Сформулируйте ${contextLabel}, которое показывает, как ${product} помогает клиентам двигаться к результату. Завершите текст чётким призывом к действию.`;
    }
    return `Draft ${contextLabel} that shows how ${product} helps customers move toward results and finish with a clear call to action.`;
  }

  async generateWithOpenAI(input: ContentGenerationInput): Promise<ContentGenerationResult> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const language = resolveLanguage(input.language);
    const emotionKey = normalizeEmotionKey(input.emotion);
    const emotionMessage = EMOTION_MESSAGES[language][emotionKey] ?? EMOTION_MESSAGES[language].default;
    const emotionFocus = EMOTION_FOCUS[language][emotionKey] ?? EMOTION_FOCUS[language].default;
    const replacements = buildReplacements(input, language, emotionMessage, emotionFocus);
    const systemPrompt = SYSTEM_PROMPTS[language];
    const prompt = this.buildPrompt(input, language, replacements);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = (data.choices?.[0]?.message?.content as string | undefined)?.trim() ?? '';

    const emotionalMatch = this.estimateEmotionalMatch(emotionKey, input.tone);
    const confidence = this.estimateConfidence(emotionalMatch, input.tone, input.length);
    const seoOptimized = this.isSeoOptimized(content, language);
    const suggestions = this.generateSuggestions(input.context, language, replacements);

    return {
      content,
      suggestions,
      seoOptimized,
      emotionalMatch,
      confidence,
      language,
    };
  }

  private buildPrompt(
    input: ContentGenerationInput,
    language: SupportedLanguage,
    replacements: ReplacementMap,
  ): string {
    const parts: string[] = [];
    parts.push(`Write ${input.context} copy in ${language === 'ru' ? 'Russian' : 'English'} that resonates with the emotion "${input.emotion}".`);
    parts.push(`Product: ${replacements.productRaw}.`);
    parts.push(`Audience: ${replacements.audienceShort}.`);
    parts.push(`Desired outcome: ${replacements.goalShort}.`);
    if (input.tone) {
      parts.push(`Preferred tone: ${input.tone}.`);
    }
    if (input.length) {
      parts.push(`Length preference: ${input.length}.`);
    }
    parts.push('Keep the message conversion-focused, include a clear call to action, and respect the stated emotion.');
    return parts.join(' ');
  }
}

export const contentGenerationService = new ContentGenerationService();
