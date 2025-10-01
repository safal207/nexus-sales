'use client';

import React from 'react';
import { useFunnelStore, FunnelElement } from '../../../stores/funnelStore';

interface StyleEditorProps {
  element: FunnelElement;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({ element }) => {
  const updateElement = useFunnelStore(state => state.updateElement);

  const handleStyleChange = (property: string, value: string) => {
    updateElement(element.id, {
      styles: {
        ...element.styles,
        [property]: value
      }
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <h3 className="font-medium text-gray-900">Стили</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Цвет фона
        </label>
        <input
          type="color"
          value={element.styles.backgroundColor || '#ffffff'}
          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Цвет текста
        </label>
        <input
          type="color"
          value={element.styles.color || '#000000'}
          onChange={(e) => handleStyleChange('color', e.target.value)}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Размер шрифта
        </label>
        <select
          value={element.styles.fontSize || '16px'}
          onChange={(e) => handleStyleChange('fontSize', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="32px">32px</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Выравнивание текста
        </label>
        <select
          value={element.styles.textAlign || 'left'}
          onChange={(e) => handleStyleChange('textAlign', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="left">Слева</option>
          <option value="center">По центру</option>
          <option value="right">Справа</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Скругление углов
        </label>
        <input
          type="range"
          min="0"
          max="50"
          value={parseInt(element.styles.borderRadius || '0')}
          onChange={(e) => handleStyleChange('borderRadius', e.target.value + 'px')}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          {element.styles.borderRadius || '0px'}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Толщина границы
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={parseInt(element.styles.borderWidth || '0')}
          onChange={(e) => handleStyleChange('borderWidth', e.target.value + 'px')}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          {element.styles.borderWidth || '0px'}
        </div>
      </div>
    </div>
  );
};
