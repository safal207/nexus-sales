import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Legend, Tooltip } from 'recharts';
import type { TooltipProps } from 'recharts';

type ChartValueType = number | string | (number | string)[];
type ChartNameType = string | number;
import type { EmotionJourneyEvent, EmotionJourneyGraph } from '../../utils/api';

// Lazy-load heavy recharts primitives on client
const ResponsiveContainer = dynamic(async () => ({ default: (await import('recharts')).ResponsiveContainer }), { ssr: false });
const LineChart = dynamic(async () => ({ default: (await import('recharts')).LineChart }), { ssr: false });
const Line = dynamic(async () => ({ default: (await import('recharts')).Line }), { ssr: false });
const XAxis = dynamic(async () => ({ default: (await import('recharts')).XAxis }), { ssr: false });
const YAxis = dynamic(async () => ({ default: (await import('recharts')).YAxis }), { ssr: false });
const CartesianGrid = dynamic(async () => ({ default: (await import('recharts')).CartesianGrid }), { ssr: false });

type EmotionalJourneyChartProps = {
  userId: string;
  productId?: string;
  hoursBack?: number;
};

type JourneyResponse = {
  journey?: EmotionJourneyGraph;
};

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

const buildHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } satisfies HeadersInit;
};

const EmotionalJourneyChartComponent = ({
  userId,
  productId,
  hoursBack = 24,
}: EmotionalJourneyChartProps) => {
  const [journeyData, setJourneyData] = useState<EmotionJourneyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ hours_back: hoursBack.toString(), user_id: userId });
    if (productId) {
      params.set('product_id', productId);
    }
    return params.toString();
  }, [hoursBack, productId, userId]);

  const fetchEmotionalJourney = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/emotions/journey?${queryParams}`, {
        headers: buildHeaders(),
      });

      if (!response.ok) {
        throw new Error('Не удалось получить эмоциональный трек клиента');
      }

      const data = (await response.json()) as JourneyResponse;
      const graph = data.journey;
      const events = graph?.neo4j_journey ?? graph?.datomic_journey ?? [];

      setJourneyData(events);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    void fetchEmotionalJourney();
  }, [fetchEmotionalJourney]);

  const handleRefresh = useCallback(() => {
    void fetchEmotionalJourney();
  }, [fetchEmotionalJourney]);

  const formatTimestamp = useCallback((timestamp: string) => new Date(timestamp).toLocaleTimeString(), []);

  const chartData = useMemo(
    () =>
      journeyData.map((event, index) => ({
        index,
        emotion: event.emotion,
        intensity: event.intensity,
        confidence: event.confidence,
        timestamp: formatTimestamp(event.timestamp),
        action: event.action ?? 'none',
      })),
    [formatTimestamp, journeyData],
  );

  const tooltipFormatter = useMemo<NonNullable<TooltipProps<ChartValueType, ChartNameType>['formatter']>>(
    () => (value, name) => {
      const numeric = Array.isArray(value)
        ? Number(value[0] ?? 0)
        : Number(value ?? 0);
      return [
        `${(numeric * 100).toFixed(1)}%`,
        name === 'intensity' ? 'Интенсивность' : 'Уверенность',
      ];
    },
    [],
  );

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      joy: '#10b981',
      excitement: '#f59e0b',
      trust: '#3b82f6',
      sadness: '#6b7280',
      fear: '#ef4444',
      anger: '#dc2626',
      surprise: '#8b5cf6',
      disgust: '#84cc16',
    };
    return colors[emotion] ?? '#6b7280';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {errorMessage}
      </div>
    );
  }

  if (journeyData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
        Нет данных по эмоциональной динамике
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Эмоциональный путь клиента</h3>
        <button
          type="button"
          onClick={handleRefresh}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          Обновить
        </button>
      </div>

      <div className="space-y-6">
        <section>
          <h4 className="mb-3 text-md font-medium text-gray-700">Интенсивность и уверенность AI</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              <Line
                type="monotone"
                dataKey="intensity"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section>
          <h4 className="mb-3 text-md font-medium text-gray-700">Распределение эмоций</h4>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Object.entries(
              journeyData.reduce<Record<string, number>>((acc, event) => {
                acc[event.emotion] = (acc[event.emotion] ?? 0) + 1;
                return acc;
              }, {}),
            ).map(([emotion, count]) => (
              <div key={emotion} className="flex items-center space-x-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: getEmotionColor(emotion) }}
                />
                <span className="text-sm capitalize text-gray-600">{emotion}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-md font-medium text-gray-700">Переход от первой эмоции к последней</h4>
          <div className="flex items-center space-x-4">
            {journeyData.length > 0 && (
              <>
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{ backgroundColor: getEmotionColor(journeyData[0]?.emotion ?? 'neutral') }}
                  />
                  <span className="text-sm capitalize text-gray-600">{journeyData[0]?.emotion ?? 'neutral'}</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center space-x-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{ backgroundColor: getEmotionColor(journeyData.at(-1)?.emotion ?? 'neutral') }}
                  />
                  <span className="text-sm capitalize text-gray-600">{journeyData.at(-1)?.emotion ?? 'neutral'}</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section>
          <h4 className="mb-3 text-md font-medium text-gray-700">Последние события</h4>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {journeyData.slice(-5).reverse().map((event) => (
              <div key={event.timestamp} className="flex items-center justify-between rounded bg-gray-50 p-2">
                <div className="flex items-center space-x-3">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: getEmotionColor(event.emotion) }}
                  />
                  <span className="text-sm font-medium capitalize text-gray-700">{event.emotion}</span>
                  {event.action && (
                    <span className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-500">{event.action}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{(event.intensity * 100).toFixed(0)}%</span>
                  <span className="text-xs text-gray-400">{formatTimestamp(event.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
export const EmotionalJourneyChart = React.memo(EmotionalJourneyChartComponent);
