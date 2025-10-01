'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useFunnelStore } from '../../../stores/funnelStore';
import { FunnelElementRenderer } from './FunnelElementRenderer';
import { Grid } from './Grid';

export const FunnelCanvas: React.FC = () => {
  const { currentFunnel, currentStep, zoom } = useFunnelStore(); // 2025-09-29 - Claude Code: Removed non-existent _isPreviewMode field
  const currentStepData = currentFunnel?.steps.find(step => step.id === currentStep);

  const { isOver, setNodeRef } = useDroppable({
    id: 'funnel-canvas',
  });

  if (!currentFunnel || !currentStepData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Создайте первую воронку
          </h3>
          <p className="text-sm text-gray-500">
            Начните с добавления шагов и элементов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50 p-4">
      {/* Grid background */}
      <Grid />

      {/* Canvas area */}
      <div
        ref={setNodeRef}
        className={`relative w-full h-full transition-transform duration-200 flex items-center justify-center ${
          isOver ? 'bg-blue-50' : ''
        }`}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
        }}
      >
        {/* Step content container */}
        <div
          className="bg-white shadow-lg rounded-lg relative overflow-hidden"
          style={{
            width: '800px',
            minHeight: '600px',
            backgroundColor: currentStepData.settings.backgroundColor || '#ffffff',
            backgroundImage: currentStepData.settings.backgroundImage
              ? `url(${currentStepData.settings.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Render elements */}
          {currentStepData.elements.map((element) => (
            <FunnelElementRenderer key={element.id} element={element} />
          ))}

          {/* Drop zone indicator */}
          {isOver && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-400 bg-blue-50 opacity-50 flex items-center justify-center">
              <div className="text-blue-600 font-medium">
                Отпустите элемент здесь
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 bg-white rounded-lg p-2 shadow-md">
        <button
          onClick={() => useFunnelStore.getState().setZoom(zoom * 1.2)}
          className="p-2 rounded hover:bg-gray-100"
          title="Приблизить"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </button>
        <button
          onClick={() => useFunnelStore.getState().setZoom(zoom / 1.2)}
          className="p-2 rounded hover:bg-gray-100"
          title="Отдалить"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={() => useFunnelStore.getState().setZoom(1)}
          className="p-2 rounded hover:bg-gray-100"
          title="Сбросить масштаб"
        >
          <span className="text-xs font-medium">{Math.round(zoom * 100)}%</span>
        </button>
      </div>
    </div>
  );
};
