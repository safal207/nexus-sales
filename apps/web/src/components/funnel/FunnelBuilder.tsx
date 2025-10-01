'use client';

import React, { useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCenter } from '@dnd-kit/core';
import { useFunnelStore } from '../../stores/funnelStore';
import { FunnelCanvas } from './Canvas/FunnelCanvas';
// 2025-09-29 - Claude Code: Commented out unused import
// import { TemplateLibrary } from './Templates/TemplateLibrary';
import { PropertyPanel } from './Properties/PropertyPanel';
import { ElementPalette } from './Elements/ElementPalette';
import { FunnelPreview } from './FunnelPreview';
// 2025-09-29 - Claude Code: Commented out unused import
// import { useFunnelStore as useFunnelStoreType } from '../../stores/funnelStore';

interface DragItem {
  id: string;
  type: string;
  template?: {
    icon?: string;
    name?: string;
  }; // 2025-09-29 - Claude Code: Fixed template type to match usage
}

export const FunnelBuilder: React.FC = () => {
  const {
    currentFunnel,
    currentStep,
    isPreviewMode,
    createFunnel,
    addStep,
    setCurrentStep,
    setPreviewMode,
    trackView,
    addElement
  } = useFunnelStore();
  
  const [activeDragItem, setActiveDragItem] = React.useState<DragItem | null>(null);

  // Track view when component mounts
  useEffect(() => {
    trackView();
  }, [trackView]);

  const handleStepClick = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveDragItem(active.data.current as DragItem);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id === 'funnel-canvas' && active.data.current?.type === 'element-template') {
      const template = active.data.current.template;
      
      if (currentStep) {
        // Add the element to the current step at the drop position
        // For now, we'll add it at a default position
        addElement(currentStep, {
          type: template.type,
          content: { ...template.defaultContent },
          position: { x: 100, y: 100 }, // Default position
          size: { ...template.defaultSize },
          styles: {},
          settings: {},
        });
      }
    }

    setActiveDragItem(null);
  };

  if (!currentFunnel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Добро пожаловать в Funnel Builder
          </h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Создавайте эффективные воронки продаж с помощью нашего AI-powered конструктора
          </p>
          <button
            onClick={() => createFunnel('Новая воронка')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Создать первую воронку
          </button>
        </div>
      </div>
    );
  }

  return (
    <DndContext 
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex bg-gray-50 flex-col">
        {/* Top toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentFunnel.name}
              </h1>
              <div className="flex space-x-2">
                {currentFunnel.steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {step.name}
                  </button>
                ))}
              </div>
              <button
                onClick={() => addStep(`Шаг ${currentFunnel.steps.length + 1}`)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Добавить шаг
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreviewMode(!isPreviewMode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  isPreviewMode
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPreviewMode ? '👁️ Предварительный просмотр' : '🎯 Режим редактирования'}
              </button>
              <button
                onClick={() => useFunnelStore.getState().saveFunnel()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                💾 Сохранить
              </button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - Element Palette */}
          <ElementPalette />

          {/* Canvas area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {isPreviewMode ? (
              <FunnelPreview funnelId={currentFunnel.id} />
            ) : (
              <FunnelCanvas />
            )}
          </div>

          {/* Right sidebar - Properties */}
          <PropertyPanel />
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragItem ? (
            <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg cursor-grabbing">
              <div className="flex items-center space-x-2">
                <span className="text-xl">{activeDragItem.template?.icon}</span>
                <span className="font-medium text-gray-900">{activeDragItem.template?.name}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
