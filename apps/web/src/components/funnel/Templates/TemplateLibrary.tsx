'use client';

import React, { useEffect, useState } from 'react';
import { useFunnelStore } from '../../../stores/funnelStore';
import { FunnelTemplate } from '../../../app/api/templates/route';

interface TemplateCardProps {
  template: FunnelTemplate;
  onSelect: (template: FunnelTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onSelect(template)}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-4xl">{getCategoryIcon(template.category)}</div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${
            template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
            template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {template.difficulty}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Конверсия: {template.estimatedConversion}
          </div>
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'lead-magnet': return '🧲';
    case 'webinar': return '🎥';
    case 'product-launch': return '🚀';
    case 'newsletter': return '📧';
    case 'consultation': return '💼';
    default: return '📋';
  }
};

export const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [categories, setCategories] = useState<{id: string; name: string; count: number}[]>([]); // 2025-09-29 - Claude Code: Fixed type to match usage
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const createFunnel = useFunnelStore(state => state.createFunnel);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();

      if (data.templates) {
        setTemplates(data.templates);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = async (template: FunnelTemplate) => {
    // Create new funnel based on template
    try {
      await createFunnel(template.name);

      // If we get here, creation was successful
      // Load template content into the new funnel
      const { currentFunnel, updateStep } = useFunnelStore.getState();

      if (currentFunnel && template.content.steps.length > 0) {
        // Add template steps
        template.content.steps.forEach((step, index) => {
          if (index === 0) {
            // Update the first step
            if (currentFunnel.steps[0]?.id) {
              updateStep(currentFunnel.steps[0].id, step as Record<string, unknown>); // 2025-09-29 - Claude Code: Fixed any type
            }
          } else {
            // Add additional steps
            useFunnelStore.getState().addStep(step.name);
          }
        });
      }
    } catch (error) {
      console.error('Failed to create funnel from template:', error);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="w-80 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Шаблоны воронок
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Выберите готовый шаблон для быстрого старта
        </p>

        {/* Search */}
        <input
          type="text"
          placeholder="Поиск шаблонов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все ({templates.length})
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={handleTemplateSelect}
          />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">🔍</div>
          <p>Шаблоны не найдены</p>
          <p className="text-sm">Попробуйте изменить поиск или категорию</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-2">Быстрые действия</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              const { currentStep, addElement } = useFunnelStore.getState();
              if (currentStep) {
                const centerX = 400;
                const centerY = 300;
                addElement(currentStep, {
                  type: 'text',
                  content: { text: 'Новый элемент' },
                  position: { x: centerX, y: centerY },
                  size: { width: 300, height: 100 },
                  styles: {},
                  settings: {},
                });
              }
            }}
            className="w-full p-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded"
          >
            ➕ Добавить текст
          </button>
          <button
            onClick={() => {
              const { currentStep, addElement } = useFunnelStore.getState();
              if (currentStep) {
                const centerX = 400;
                const centerY = 300;
                addElement(currentStep, {
                  type: 'button',
                  content: { text: 'Кнопка' },
                  position: { x: centerX, y: centerY },
                  size: { width: 200, height: 50 },
                  styles: {},
                  settings: { action: 'redirect', redirect: '/checkout' },
                });
              }
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
