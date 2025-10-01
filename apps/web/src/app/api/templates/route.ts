import { NextResponse } from 'next/server';

export interface FunnelTemplate {
  id: string;
  name: string;
  category: 'lead-magnet' | 'webinar' | 'product-launch' | 'newsletter' | 'consultation';
  description: string;
  thumbnail: string;
  content: {
    steps: Array<{
      name: string;
      elements: Array<{
        type: string;
        content: Record<string, unknown>; // 2025-09-29 - Claude Code: Fixed any type
        position: { x: number; y: number };
        size: { width: number; height: number };
        styles: Record<string, string>;
        settings: Record<string, unknown>; // 2025-09-29 - Claude Code: Fixed any type
      }>;
      settings: {
        backgroundColor?: string;
        backgroundImage?: string;
      };
    }>;
    settings: {
      theme: 'light' | 'dark';
      primaryColor: string;
    };
  };
  tags: string[];
  estimatedConversion: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const TEMPLATES: FunnelTemplate[] = [
  {
    id: 'lead-magnet-basic',
    name: 'Базовый Lead Magnet',
    category: 'lead-magnet',
    description: 'Простая воронка для сбора email через бесплатный гайд или чек-лист',
    thumbnail: '/templates/lead-magnet.png',
    content: {
      steps: [
        {
          name: 'Страница захвата',
          elements: [
            {
              type: 'text',
              content: { text: 'Получите бесплатный гайд' },
              position: { x: 50, y: 100 },
              size: { width: 400, height: 80 },
              styles: { fontSize: '24px', textAlign: 'center', color: '#1f2937' },
              settings: {},
            },
            {
              type: 'form',
              content: {
                placeholder: 'your@email.com',
                text: 'Получить гайд'
              },
              position: { x: 150, y: 200 },
              size: { width: 300, height: 150 },
              styles: {},
              settings: { required: true },
            },
          ],
          settings: {
            backgroundColor: '#f9fafb',
          },
        },
        {
          name: 'Спасибо страница',
          elements: [
            {
              type: 'text',
              content: { text: 'Спасибо! Проверьте email' },
              position: { x: 100, y: 150 },
              size: { width: 400, height: 60 },
              styles: { fontSize: '20px', textAlign: 'center', color: '#059669' },
              settings: {},
            },
          ],
          settings: {
            backgroundColor: '#f0fdf4',
          },
        },
      ],
      settings: {
        theme: 'light',
        primaryColor: '#3B82F6',
      },
    },
    tags: ['бесплатно', 'быстрый старт', 'email capture'],
    estimatedConversion: '15-25%',
    difficulty: 'beginner',
  },
  {
    id: 'webinar-funnel',
    name: 'Воронка вебинара',
    category: 'webinar',
    description: 'Многошаговая воронка для регистрации и проведения вебинара',
    thumbnail: '/templates/webinar.png',
    content: {
      steps: [
        {
          name: 'Регистрация',
          elements: [
            {
              type: 'text',
              content: { text: 'Бесплатный вебинар' },
              position: { x: 100, y: 80 },
              size: { width: 400, height: 60 },
              styles: { fontSize: '28px', textAlign: 'center', color: '#1f2937' },
              settings: {},
            },
            {
              type: 'form',
              content: {
                placeholder: 'your@email.com',
                text: 'Зарегистрироваться'
              },
              position: { x: 150, y: 180 },
              size: { width: 300, height: 120 },
              styles: {},
              settings: { required: true },
            },
          ],
          settings: {
            backgroundColor: '#f8fafc',
          },
        },
        {
          name: 'Подтверждение',
          elements: [
            {
              type: 'text',
              content: { text: 'Регистрация подтверждена!' },
              position: { x: 100, y: 120 },
              size: { width: 400, height: 80 },
              styles: { fontSize: '24px', textAlign: 'center', color: '#059669' },
              settings: {},
            },
          ],
          settings: {
            backgroundColor: '#f0fdf4',
          },
        },
      ],
      settings: {
        theme: 'light',
        primaryColor: '#8B5CF6',
      },
    },
    tags: ['вебинар', 'образование', 'лидогенерация'],
    estimatedConversion: '20-35%',
    difficulty: 'intermediate',
  },
  {
    id: 'product-launch',
    name: 'Запуск продукта',
    category: 'product-launch',
    description: 'Комплексная воронка для запуска цифрового продукта',
    thumbnail: '/templates/product-launch.png',
    content: {
      steps: [
        {
          name: 'Pre-launch',
          elements: [
            {
              type: 'text',
              content: { text: 'Скоро запуск!' },
              position: { x: 100, y: 100 },
              size: { width: 400, height: 60 },
              styles: { fontSize: '24px', textAlign: 'center', color: '#dc2626' },
              settings: {},
            },
            {
              type: 'form',
              content: {
                placeholder: 'your@email.com',
                text: 'Уведомить о запуске'
              },
              position: { x: 150, y: 200 },
              size: { width: 300, height: 120 },
              styles: {},
              settings: { required: true },
            },
          ],
          settings: {
            backgroundColor: '#fef2f2',
          },
        },
        {
          name: 'Sales page',
          elements: [
            {
              type: 'text',
              content: { text: 'Представляем новый продукт' },
              position: { x: 50, y: 50 },
              size: { width: 500, height: 80 },
              styles: { fontSize: '32px', textAlign: 'center', color: '#1f2937' },
              settings: {},
            },
            {
              type: 'button',
              content: { text: 'Купить сейчас' },
              position: { x: 200, y: 300 },
              size: { width: 200, height: 60 },
              styles: { backgroundColor: '#3B82F6', color: '#ffffff' },
              settings: { action: 'redirect', redirect: '/checkout' },
            },
          ],
          settings: {
            backgroundColor: '#ffffff',
          },
        },
      ],
      settings: {
        theme: 'light',
        primaryColor: '#3B82F6',
      },
    },
    tags: ['запуск', 'продукт', 'продажи'],
    estimatedConversion: '5-15%',
    difficulty: 'advanced',
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      templates: TEMPLATES,
      categories: [
        { id: 'lead-magnet', name: 'Lead Magnet', count: TEMPLATES.filter(t => t.category === 'lead-magnet').length },
        { id: 'webinar', name: 'Webinar', count: TEMPLATES.filter(t => t.category === 'webinar').length },
        { id: 'product-launch', name: 'Product Launch', count: TEMPLATES.filter(t => t.category === 'product-launch').length },
        { id: 'newsletter', name: 'Newsletter', count: TEMPLATES.filter(t => t.category === 'newsletter').length },
        { id: 'consultation', name: 'Consultation', count: TEMPLATES.filter(t => t.category === 'consultation').length },
      ],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
