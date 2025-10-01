'use client';

import React from 'react';
import Image from 'next/image';
import { useFunnelStore, FunnelElement } from '../../stores/funnelStore';

interface FunnelPreviewProps {
  funnelId: string;
}

const FunnelElementDisplay: React.FC<{ element: FunnelElement }> = ({ element }) => {
  const baseClasses = "absolute";

  const renderElement = () => {
    switch (element.type) {
      case 'heading':
        return (
          <h1
            className={`${baseClasses} font-bold text-2xl`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              ...element.styles,
            }}
          >
            {element.content.text || 'Заголовок'}
          </h1>
        );

      case 'subheading':
        return (
          <h2
            className={`${baseClasses} font-semibold text-xl`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              ...element.styles,
            }}
          >
            {element.content.text || 'Подзаголовок'}
          </h2>
        );

      case 'paragraph':
      case 'text':
        return (
          <p
            className={`${baseClasses} text-base`}
            style={{
              left: element.position.x,
              top: element.position.y,
              width: element.size.width,
              height: element.size.height,
              ...element.styles,
            }}
          >
            {element.content.text || 'Ваш текст'}
          </p>
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

  return renderElement();
};

export const FunnelPreview: React.FC<FunnelPreviewProps> = ({ funnelId: _funnelId }) => {
  const { currentFunnel, currentStep } = useFunnelStore();

  if (!currentFunnel) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Воронка не найдена
          </h3>
          <p className="text-sm text-gray-500">
            Выберите существующую воронку для предпросмотра
          </p>
        </div>
      </div>
    );
  }

  const currentStepData = currentFunnel.steps.find(step => step.id === currentStep);

  if (!currentStepData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Шаг воронки не найден
          </h3>
          <p className="text-sm text-gray-500">
            Выберите существующий шаг для предпросмотра
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-100 p-8">
      <div 
        className="mx-auto bg-white shadow-lg rounded-lg relative"
        style={{
          width: '100%',
          minHeight: '600px',
          backgroundColor: currentStepData.settings.backgroundColor || '#ffffff',
          backgroundImage: currentStepData.settings.backgroundImage
            ? `url(${currentStepData.settings.backgroundImage})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {currentStepData.elements.map((element) => (
          <FunnelElementDisplay key={element.id} element={element} />
        ))}
      </div>
    </div>
  );
};
