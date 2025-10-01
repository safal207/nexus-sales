'use client';

import React from 'react';
import { useFunnelStore, FunnelElement } from '../../../stores/funnelStore';

interface ActionEditorProps {
  element: FunnelElement;
}

export const ActionEditor: React.FC<ActionEditorProps> = ({ element }) => {
  const updateElement = useFunnelStore(state => state.updateElement);

  const handleActionChange = (action: string, value: string) => {
    updateElement(element.id, {
      settings: {
        ...element.settings,
        action,
        [action === 'redirect' ? 'redirect' : action === 'email' ? 'email' : 'webhook']: value
      }
    });
  };

  return (
    <div className="space-y-4 mb-6">
      <h3 className="font-medium text-gray-900">Действия</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Тип действия
        </label>
        <select
          value={element.settings.action || 'none'}
          onChange={(e) => handleActionChange(e.target.value, '')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="none">Без действия</option>
          <option value="redirect">Перенаправление</option>
          <option value="email">Отправка email</option>
          <option value="webhook">Webhook</option>
          <option value="download">Скачивание файла</option>
        </select>
      </div>

      {element.settings.action === 'redirect' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL перенаправления
          </label>
          <input
            type="url"
            value={element.settings.redirect || ''}
            onChange={(e) => handleActionChange('redirect', e.target.value)}
            placeholder="/checkout или https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {element.settings.action === 'email' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email адрес
          </label>
          <input
            type="email"
            value={(element.settings as Record<string, unknown>).email as string || ''} // 2025-09-29 - Claude Code: Fixed any type
            onChange={(e) => handleActionChange('email', e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {element.settings.action === 'webhook' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Webhook URL
          </label>
          <input
            type="url"
            value={(element.settings as Record<string, unknown>).webhook as string || ''} // 2025-09-29 - Claude Code: Fixed any type
            onChange={(e) => handleActionChange('webhook', e.target.value)}
            placeholder="https://api.example.com/webhook"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {element.settings.action === 'download' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Путь к файлу
          </label>
          <input
            type="text"
            value={(element.settings as Record<string, unknown>).download as string || ''} // 2025-09-29 - Claude Code: Fixed any type
            onChange={(e) => handleActionChange('download', e.target.value)}
            placeholder="/downloads/guide.pdf"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {element.settings.action && element.settings.action !== 'none' && (
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={(element.settings as Record<string, unknown>).openInNewTab as boolean || false} // 2025-09-29 - Claude Code: Fixed any type
              onChange={(e) => {
                updateElement(element.id, {
                  settings: {
                    ...element.settings,
                    ...(e.target.checked ? { openInNewTab: true } : { openInNewTab: false })
                  } as Record<string, unknown> // 2025-09-29 - Claude Code: Fixed any type
                });
              }}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Открывать в новой вкладке</span>
          </label>
        </div>
      )}
    </div>
  );
};
