'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
// 2025-09-29 - Claude Code: Commented out unused import
// import { useFunnelStore } from '../../../stores/funnelStore';

interface ElementTemplate {
  type: 'text' | 'button' | 'form' | 'image' | 'video' | 'heading' | 'subheading' | 'paragraph';
  name: string;
  icon: string;
  description: string;
  defaultContent: {
    text?: string;
    src?: string;
    alt?: string;
    placeholder?: string;
  };
  defaultSize: { width: number; height: number };
}

const ELEMENT_TEMPLATES: ElementTemplate[] = [
  {
    type: 'heading',
    name: 'Заголовок',
    icon: '🏷️',
    description: 'Заголовок H1',
    defaultContent: { text: 'Заголовок воронки' },
    defaultSize: { width: 400, height: 60 },
  },
  {
    type: 'subheading',
    name: 'Подзаголовок',
    icon: '📝',
    description: 'Подзаголовок H2 или H3',
    defaultContent: { text: 'Подзаголовок воронки' },
    defaultSize: { width: 400, height: 40 },
  },
  {
    type: 'paragraph',
    name: 'Текст',
    icon: '📄',
    description: 'Текстовый абзац',
    defaultContent: { text: 'Ваш текст здесь...' },
    defaultSize: { width: 400, height: 100 },
  },
  {
    type: 'button',
    name: 'Кнопка',
    icon: '🔘',
    description: 'Кнопка призыва к действию',
    defaultContent: { text: 'Нажмите здесь' },
    defaultSize: { width: 200, height: 50 },
  },
  {
    type: 'form',
    name: 'Форма',
    icon: '📋',
    description: 'Форма для сбора email или других данных',
    defaultContent: {
      placeholder: 'your@email.com',
      text: 'Отправить'
    },
    defaultSize: { width: 300, height: 150 },
  },
  {
    type: 'image',
    name: 'Изображение',
    icon: '🖼️',
    description: 'Изображение или графика',
    defaultContent: { alt: 'Изображение' },
    defaultSize: { width: 300, height: 200 },
  },
  {
    type: 'video',
    name: 'Видео',
    icon: '🎥',
    description: 'Видео контент',
    defaultContent: {},
    defaultSize: { width: 400, height: 225 },
  },
];

interface DraggableElementProps {
  template: ElementTemplate;
}

const DraggableElement: React.FC<DraggableElementProps> = ({ template }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element-${Date.now()}-${template.type}`,
    data: {
      type: 'element-template',
      template,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : ''}
        flex items-center space-x-3
      `}
    >
      <span className="text-xl">{template.icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{template.name}</h3>
        <p className="text-xs text-gray-500 truncate">{template.description}</p>
      </div>
    </div>
  );
};

export const ElementPalette: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Библиотека элементов
        </h2>
        <p className="text-sm text-gray-600">
          Перетащите элементы на холст для создания воронки
        </p>
      </div>

      <div className="space-y-3 flex-1">
        {ELEMENT_TEMPLATES.map((template) => (
          <DraggableElement key={template.type} template={template} />
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Подсказки</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Перетащите элемент на холст</li>
          <li>• Двойной клик для редактирования</li>
          <li>• Клик для выделения и настройки</li>
        </ul>
      </div>
    </div>
  );
};