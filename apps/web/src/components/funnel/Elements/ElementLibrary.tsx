'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useFunnelStore } from '../../../stores/funnelStore';

interface ElementTemplate {
  type: 'text' | 'button' | 'form' | 'image' | 'video';
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
    type: 'text',
    name: 'Текст',
    icon: '📝',
    description: 'Текстовый блок для заголовков и описаний',
    defaultContent: { text: 'Ваш текст здесь' },
    defaultSize: { width: 300, height: 100 },
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
    defaultSize: { width: 400, height: 200 },
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
    id: `template-${template.type}`,
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
        p-4 bg-white border border-gray-200 rounded-lg cursor-grab hover:shadow-md transition-all
        ${isDragging ? 'opacity-50 scale-105 shadow-lg' : ''}
      `}
    >
      <div className="flex items-center space-x-3 mb-2">
        <span className="text-2xl">{template.icon}</span>
        <div>
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.description}</p>
        </div>
      </div>
    </div>
  );
};

export const ElementLibrary: React.FC = () => {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Библиотека элементов
        </h2>
        <p className="text-sm text-gray-600">
          Перетащите элементы на холст для создания воронки
        </p>
      </div>

      <div className="space-y-3">
        {ELEMENT_TEMPLATES.map((template) => (
          <DraggableElement key={template.type} template={template} />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Быстрые действия</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              // Создать пустой элемент в центре canvas
              const centerX = 400;
              const centerY = 300;
              useFunnelStore.getState().addElement('current-step', {
                type: 'text',
                content: { text: 'Новый элемент' },
                position: { x: centerX, y: centerY },
                size: { width: 300, height: 100 },
                styles: {},
                settings: {},
              });
            }}
            className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
          >
            ➕ Добавить текст
          </button>
          <button
            onClick={() => {
              const centerX = 400;
              const centerY = 300;
              useFunnelStore.getState().addElement('current-step', {
                type: 'button',
                content: { text: 'Кнопка' },
                position: { x: centerX, y: centerY },
                size: { width: 200, height: 50 },
                styles: {},
                settings: { action: 'redirect', redirect: '/checkout' },
              });
            }}
            className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
          >
            🔘 Добавить кнопку
          </button>
        </div>
      </div>
    </div>
  );
};
