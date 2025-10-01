import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { TooltipProps } from 'recharts';

type ChartValueType = number | string | (number | string)[];
type ChartNameType = string | number;
// Lazy-load recharts on client to shrink initial bundle
const ResponsiveContainer = dynamic(async () => ({
  default: (await import('recharts')).ResponsiveContainer,
}), { ssr: false });
const BarChart = dynamic(async () => ({
  default: (await import('recharts')).BarChart,
}), { ssr: false });
const Bar = dynamic(async () => ({
  default: (await import('recharts')).Bar,
}), { ssr: false });
const XAxis = dynamic(async () => ({
  default: (await import('recharts')).XAxis,
}), { ssr: false });
const YAxis = dynamic(async () => ({
  default: (await import('recharts')).YAxis,
}), { ssr: false });
const CartesianGrid = dynamic(async () => ({
  default: (await import('recharts')).CartesianGrid,
}), { ssr: false });
const Tooltip = dynamic(async () => ({
  default: (await import('recharts')).Tooltip,
}), { ssr: false });
import type { AnalyticsInsightsPayload, PredictionPayload } from '../../utils/api';

type PredictiveAnalyticsProps = {
  userId?: string;
  consciousnessLevel?: string;
};

type FetchState = 'idle' | 'loading' | 'ready' | 'error';

type InsightsState = AnalyticsInsightsPayload | null;

type PredictionState = PredictionPayload | null;

const ACTION_ICONS: Record<string, string> = {
  show_upsell: '💡',
  create_urgency: '⏱️',
  add_social_proof: '👥',
  build_trust: '🤝',
  provide_value: '🎁',
  reduce_risk: '🛡️',
  add_guarantees: '✅',
  show_testimonials: '⭐',
};

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

const buildHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } satisfies HeadersInit;
};

const getLikelihoodColor = (likelihood: number) => {
  if (likelihood > 0.7) return '#10b981';
  if (likelihood > 0.4) return '#f59e0b';
  return '#ef4444';
};

const renderActionIcon = (action: string) => ACTION_ICONS[action] ?? '➡️';

const PredictiveAnalyticsComponent: React.FC<PredictiveAnalyticsProps> = ({
  userId,
  consciousnessLevel = 'seeker',
}) => {
  const [predictionData, setPredictionData] = useState<PredictionState>(null);
  const [insights, setInsights] = useState<InsightsState>(null);
  const [status, setStatus] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    const headers = buildHeaders();

    try {
      const insightsResponse = await fetch('/api/analytics/insights', { headers });

      if (insightsResponse.ok) {
        const data = (await insightsResponse.json()) as { insights?: AnalyticsInsightsPayload };
        setInsights(data.insights ?? null);
      } else {
        setInsights(null);
      }

      if (userId) {
        const predictionResponse = await fetch('/api/emotions/predict', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            user_id: userId,
            current_emotion: {
              type: 'trust',
              intensity: 0.8,
              confidence: 0.9,
            },
            consciousness_level: consciousnessLevel,
          }),
        });

        if (predictionResponse.ok) {
          const data = (await predictionResponse.json()) as { prediction?: PredictionPayload };
          setPredictionData(data.prediction ?? null);
        } else {
          setPredictionData(null);
        }
      } else {
        setPredictionData(null);
      }

      setStatus('ready');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить аналитические данные.';
      setErrorMessage(message);
      setStatus('error');
    }
  }, [consciousnessLevel, userId]);

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const handleRefresh = useCallback(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const normalizeNumeric = useCallback((value: ChartValueType | undefined) => {
    if (Array.isArray(value)) {
      const [first] = value;
      return typeof first === 'number' ? first : Number(first ?? 0);
    }
    return typeof value === 'number' ? value : Number(value ?? 0);
  }, []);

  const conversionsTooltipFormatter = useMemo<NonNullable<TooltipProps<ChartValueType, ChartNameType>['formatter']>>(
    () => (value) => [normalizeNumeric(value).toLocaleString('ru-RU'), 'Конверсии'],
    [normalizeNumeric],
  );

  const exitsTooltipFormatter = useMemo<NonNullable<TooltipProps<ChartValueType, ChartNameType>['formatter']>>(
    () => (value) => [normalizeNumeric(value).toLocaleString('ru-RU'), 'Выходы'],
    [normalizeNumeric],
  );

  if (status === 'loading') {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (status === 'error' && errorMessage) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {predictionData && (
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Прогноз конверсии AI</h3>
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
              style={{ backgroundColor: `${getLikelihoodColor(predictionData.likelihood)}1A`, color: getLikelihoodColor(predictionData.likelihood) }}
            >
              {(predictionData.likelihood * 100).toFixed(1)}% вероятность
            </span>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Уверенность модели</p>
              <p className="text-2xl font-semibold text-indigo-600">
                {(predictionData.confidence * 100).toFixed(0)}%
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-700">Рекомендованные действия</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {(predictionData.recommended_actions ?? []).slice(0, 3).map((action) => (
                  <li key={action} className="flex items-center gap-2">
                    <span>{renderActionIcon(action)}</span>
                    <span>{action.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {insights && (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Эмоции, усиливающие конверсию</h4>
            {insights.conversion_triggers.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={insights.conversion_triggers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="emotion" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={conversionsTooltipFormatter} />
                  <Bar dataKey="conversions" fill="#10b981" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">Недостаточно данных для анализа.</p>
            )}
          </article>

          <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-lg font-semibold text-gray-900">Эмоции, вызывающие отток</h4>
            {insights.emotional_blockers.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={insights.emotional_blockers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="emotion" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={exitsTooltipFormatter} />
                  <Bar dataKey="exits" fill="#ef4444" radius={6} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500">Недостаточно данных для анализа.</p>
            )}
          </article>
        </section>
      )}

      {insights?.optimal_sequences?.length ? (
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900">Лучшие последовательности шагов</h4>
          <div className="space-y-3">
            {insights.optimal_sequences.slice(0, 3).map((sequence, index) => (
              <div key={`${sequence.sequence.join('-')}-${index}`} className="rounded border border-gray-100 bg-gray-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Сценарий #{index + 1}</span>
                  <span className="text-sm text-gray-500">Успех: {(sequence.success_rate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {sequence.sequence.map((emotion, idx) => (
                    <React.Fragment key={`${emotion}-${idx}`}>
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                        {emotion}
                      </span>
                      {idx < sequence.sequence.length - 1 && <span className="text-gray-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
        >
          Обновить данные
        </button>
        <button
          type="button"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700"
        >
          Экспортировать отчёт
        </button>
      </div>
    </div>
  );
};
export const PredictiveAnalytics = React.memo(PredictiveAnalyticsComponent);
