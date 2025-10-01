# Emotional Analytics Architecture — Neo4j + Datomic

## Обзор
Цель — создать надёжный аналитический слой, который собирает эмоциональные сигналы из воронок ConsciousFunnels, сохраняет их в Datomic (историчность) и строит графовые связи в Neo4j (отношения между пользователями, эмоциями и событиями). В документе описаны ключевые компоненты, схемы данных, потоки и требования по безопасности.

## Архитектурные принципы
1. **Событийность.** Все эмоции и действия фиксируются как события (event-sourcing) с неподвижной историей.
2. **Разделение OLTP/OLAP.** Datomic — источник истины и long-term storage; Neo4j — графовые аналитика и рекомендации.
3. **Стандартизированный контракт.** Формат события (`emotion_event`) одинаков для Next.js API, очередей и downstream consumers.
4. **Асинхронность.** AI-анализ эмоций запускается в фоне и публикует результат в очередь (RabbitMQ/Redis Streams).
5. **Прозрачность и этика.** Сохраняется контекст запроса, заметки о согласии пользователя, все данные можно удалить по требованию (GDPR).

## Поток данных (high level)
1. Пользователь взаимодействует с воронкой → Next.js API фиксирует событие (`emotion_input_received`).
2. Событие записывается в Datomic (partition `:events`) со статусом `pending` и помещается в очередь `emotion.analysis`.
3. Worker вызывает Hugging Face → получает распределение эмоций.
4. Результат сохраняется в Datomic (`:emotion/result`) + публикуется в Kafka topic `emotion.enriched`.
5. Коннектор `kafka-connect-neo4j` обновляет граф в Neo4j (узлы Emotion, User, FunnelStep и ребро `:FEELS`).
6. Next.js UI запрашивает агрегаты из Datomic (REST) и графовые инсайты из Neo4j (GraphQL).

## Схема данных (Datomic)
| Entity | Атрибут | Тип | Описание |
| --- | --- | --- | --- |
| `:event/id` | UUID | уникальный идентификатор |
| `:event/type` | keyword | `:emotion/input`, `:emotion/result`, `:funnel/action` |
| `:event/user` | ref → `:user/id` | ссылка на пользователя |
| `:event/funnel-step` | ref | шаг воронки |
| `:emotion/raw-text` | string | исходный текст/CTA |
| `:emotion/scores` | tuple/vector | пары `[:joy 0.42]` |
| `:emotion/dominant` | keyword | основная эмоция |
| `:event/created-at` | instant | время события |
| `:event/source` | keyword | `:web`, `:api`, `:import` |
| `:compliance/consent` | boolean | согласие на AI-анализ |

## Модель в Neo4j
- Узлы: `User`, `Funnel`, `Step`, `Emotion`, `Session`.
- Рёбра:
  - `(User)-[:TRAVERSED {ts}]->(Step)`
  - `(Step)-[:TRIGGERS]->(Emotion)`
  - `(Emotion)-[:RELATED_TO]->(Emotion)` (co-occurrence)
  - `(User)-[:HAS_EMOTION {score}]->(Emotion)`
- Атрибуты эмоций: `name`, `valence`, `arousal`, `confidence`.

## Технологический стек
- Datomic Cloud / Local (иммутабельное хранилище, транзакции, запросы Datalog).
- Neo4j Aura (fully managed) или self-host.
- Kafka (или Redis Streams) для обмена событиями.
- Clojure workers (Jet + Manifold) + TypeScript workers (bullmq) при необходимости.
- Hugging Face Inference API (fallback: локальная модель в Docker).
- Hasura/GraphQL wrapper для Neo4j (Apollo integration).

## API контракты
### Входное событие
```json
{
  "eventId": "uuid",
  "type": "emotion/input",
  "userId": "user-123",
  "funnelId": "fun-456",
  "stepId": "step-3",
  "text": "I feel stuck with my launch...",
  "source": "web",
  "metadata": {
    "language": "en",
    "consent": true
  },
  "timestamp": "2025-09-27T18:32:11Z"
}
```

### Результат анализа
```json
{
  "eventId": "uuid",
  "type": "emotion/result",
  "inputEventId": "uuid",
  "scores": [
    { "label": "anxiety", "score": 0.41 },
    { "label": "hope", "score": 0.33 }
  ],
  "dominant": "anxiety",
  "recommendations": ["Add reassurance testimonial", "Offer grounding exercise"]
}
```

## Безопасность и соответствие
- Шифрование в транзите (TLS) и в покое (Datomic/Neo4j настройки).
- Логирование доступа к эмоциям (audit trail в Datomic).
- Право на удаление: soft-delete в Datomic (`:event/deleted?`) + scheduled purge.
- Анонимизация при экспорте (замена userId на hash).

## Обслуживание
- **Мониторинг:** Grafana (latency очередей, ошибки Hugging Face, время ответа Neo4j).
- **Алерты:** когда время обработки > 5 секунд или очередь > 100 сообщений.
- **Резервирование:** ежедневные бэкапы Datomic, автоматические snapshots Neo4j.

## Этапы внедрения
1. Базовая интеграция Datomic + очередь (без Neo4j).
2. Подключение Hugging Face и сохранение результатов в Datomic.
3. Настройка Kafka → Neo4j и построение первых графовых отчётов.
4. Оптимизация (кеширование, денормализация агрегатов).
5. Расширение на мультиязычный анализ и дополнительные эмоции.

> Документ служит опорой для команды Data/AI и Backend при реализации эмоциональной аналитики и её масштабировании.
