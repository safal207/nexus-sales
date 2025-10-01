'use client';

import React from 'react';
import Image from 'next/image';
import { useDraggable } from '@dnd-kit/core';
import { useFunnelStore, FunnelElement } from '../../../stores/funnelStore';

interface FunnelElementRendererProps {
  element: FunnelElement;
}

export const FunnelElementRenderer: React.FC<FunnelElementRendererProps> = ({
  element
}) => {
  const { selectedElement, selectElement } = useFunnelStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: element.id,
  });

  const isSelected = selectedElement === element.id;

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const baseClasses = `
    absolute cursor-move transition-all duration-200
    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
    ${isDragging ? 'opacity-50 scale-105 z-50' : ''}
    hover:shadow-lg
  `;

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            className={`${baseClasses} bg-white border border-gray-200 rounded-lg p-4`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.styles,
            }}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              className="w-full h-full outline-none"
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={() => selectElement(element.id)}
            >
              {element.content.text || 'Текст'}
            </div>
          </div>
        );

      case 'button':
        return (
          <button
            className={`${baseClasses} bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 shadow-lg`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.styles,
            }}
          >
            {element.content.text || 'Кнопка'}
          </button>
        );

      case 'form':
        return (
          <div
            className={`${baseClasses} bg-white border border-gray-200 rounded-lg p-6 shadow-sm`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.styles,
            }}
          >
            <form className="space-y-4">
              <input
                type="email"
                placeholder={element.content.placeholder || "Email"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={element.settings.required}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {element.content.text || 'Отправить'}
              </button>
            </form>
          </div>
        );

      case 'image':
        return (
          <div
            className={`${baseClasses} relative bg-white border border-gray-200 rounded-lg overflow-hidden`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.styles,
            }}
          >
            {element.content.src ? (
              <Image
                src={element.content.src}
                alt={element.content.alt || 'Изображение'}
                fill
                sizes="100%"
                className="object-cover"
                priority={false}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                📷 Изображение
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div
            className={`${baseClasses} bg-white border border-gray-200 rounded-lg overflow-hidden`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.styles,
            }}
          >
            {element.content.src ? (
              <video
                src={element.content.src}
                className="w-full h-full object-cover"
                controls
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                🎥 Видео
              </div>
            )}
          </div>
        );

      default:
        return (
          <div
            className={`${baseClasses} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.styles,
            }}
          >
            <span className="text-gray-500 text-sm">Неизвестный элемент</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        selectElement(element.id);
      }}
    >
      {renderElement()}

      {/* Resize handles for selected element */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 rounded-full cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full cursor-se-resize" />
        </>
      )}
    </div>
  );
};
