'use client';

import React from 'react';
import { useFunnelStore } from '../../../stores/funnelStore';
import { StyleEditor } from './StyleEditor';
import { ActionEditor } from './ActionEditor';

export const PropertyPanel: React.FC = () => {
  const { selectedElement, currentFunnel, currentStep } = useFunnelStore();

  const currentStepData = currentFunnel?.steps.find(step => step.id === currentStep);
  const selectedElementData = selectedElement
    ? currentStepData?.elements.find(el => el.id === selectedElement)
    : null;

  if (!selectedElementData) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚙️</div>
          <p>Выберите элемент для настройки</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Настройки элемента
        </h2>
        <div className="text-sm text-gray-600">
          <strong>Тип:</strong> {selectedElementData.type}
        </div>
      </div>

      {/* Basic settings */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Позиция X
          </label>
          <input
            type="number"
            value={selectedElementData.position.x}
            onChange={(e) => {
              useFunnelStore.getState().updateElement(selectedElement!, {
                position: {
                  ...selectedElementData.position,
                  x: parseInt(e.target.value) || 0
                }
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Позиция Y
          </label>
          <input
            type="number"
            value={selectedElementData.position.y}
            onChange={(e) => {
              useFunnelStore.getState().updateElement(selectedElement!, {
                position: {
                  ...selectedElementData.position,
                  y: parseInt(e.target.value) || 0
                }
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ширина
          </label>
          <input
            type="number"
            value={selectedElementData.size.width}
            onChange={(e) => {
              useFunnelStore.getState().updateElement(selectedElement!, {
                size: {
                  ...selectedElementData.size,
                  width: parseInt(e.target.value) || 100
                }
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Высота
          </label>
          <input
            type="number"
            value={selectedElementData.size.height}
            onChange={(e) => {
              useFunnelStore.getState().updateElement(selectedElement!, {
                size: {
                  ...selectedElementData.size,
                  height: parseInt(e.target.value) || 50
                }
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Style editor */}
      <StyleEditor element={selectedElementData} />

      {/* Action editor */}
      <ActionEditor element={selectedElementData} />

      {/* Element-specific settings */}
      {selectedElementData.type === 'form' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Настройки формы</h3>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedElementData.settings.required || false}
                onChange={(e) => {
                  useFunnelStore.getState().updateElement(selectedElement!, {
                    settings: {
                      ...selectedElementData.settings,
                      required: e.target.checked
                    }
                  });
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Обязательное поле</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
