const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export type AuthUser = {
  id: number | string;
  email: string;
};

export type AuthResponse = {
  success: boolean;
  user?: AuthUser;
  token?: string;
  message?: string;
};

export type ProductPayload = {
  name: string;
  description?: string;
  price: number;
};

export type ProductRecord = ProductPayload & {
  id: number;
  userId: number;
};

export type ProductsResponse = {
  success: boolean;
  products: ProductRecord[];
};

export type ProductResponse = {
  success: boolean;
  product: ProductRecord;
};

export type PublicProductResponse = {
  success: boolean;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
  };
};

export type OrderRecord = {
  id: string;
  productId: number;
  email: string;
  name: string | null;
  status: string;
  createdAt: string;
  amount: number;
};

export type OrderResponse = {
  success: boolean;
  order: OrderRecord;
};

export type CreateOrderPayload = {
  productId: number | string;
  email: string;
  name?: string | null;
};

export type TrackingMetadataValue =
  | string
  | number
  | boolean
  | null
  | TrackingMetadataValue[]
  | { [key: string]: TrackingMetadataValue };

export type TrackingMetadata = Record<string, TrackingMetadataValue>;

export type EmotionPayload = {
  type: string;
  intensity: number;
  confidence: number;
  metadata?: TrackingMetadata;
  action?: string;
};

export type EmotionJourneyEvent = {
  emotion: string;
  intensity: number;
  confidence: number;
  timestamp: string;
  action?: string;
};

export type EmotionJourneyGraph = {
  neo4j_journey?: EmotionJourneyEvent[];
  datomic_journey?: EmotionJourneyEvent[];
};

export type EmotionJourneyResponse = {
  success: boolean;
  journey?: EmotionJourneyGraph;
  message?: string;
};

export type PredictionFactors = Record<string, number>;

export type PredictionPayload = {
  likelihood: number;
  confidence: number;
  recommended_actions: string[];
  factors: {
    neo4j: PredictionFactors;
    datomic: PredictionFactors;
  };
};

export type PredictionApiResponse = {
  success?: boolean;
  prediction?: PredictionPayload;
  message?: string;
};

export type AnalyticsConversionTrigger = {
  emotion: string;
  conversions: number;
};

export type AnalyticsEmotionalBlocker = {
  emotion: string;
  exits: number;
};

export type AnalyticsOptimalSequence = {
  sequence: string[];
  success_rate: number;
};

export type AnalyticsInsightsPayload = {
  conversion_triggers: AnalyticsConversionTrigger[];
  emotional_blockers: AnalyticsEmotionalBlocker[];
  optimal_sequences: AnalyticsOptimalSequence[];
};

export type AnalyticsInsightsApiResponse = {
  success: boolean;
  insights?: AnalyticsInsightsPayload;
  message?: string;
};

export type DashboardMetricValue = string | number | boolean | null;

export type DashboardAnalyticsResponse = {
  success: boolean;
  metrics?: Record<string, DashboardMetricValue | DashboardMetricValue[]>;
  message?: string;
};

export type ExportAnalyticsResponse = {
  success: boolean;
  url?: string;
  format?: string;
  message?: string;
};

export type TrackingEventPayload = {
  name: string;
  timestamp?: string;
  sessionId?: string;
  productId?: string;
  orderId?: string;
  referrer?: string;
  abVariant?: string;
  metadata?: TrackingMetadata;
};

class ApiClient {
  constructor(private readonly baseUrl: string = API_BASE_URL) {}

  private async request<TResponse>(endpoint: string, options: RequestInit = {}): Promise<TResponse> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as TResponse;
  }

  // Auth methods
  login(email: string, password: string) {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(email: string, password: string) {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Products methods
  getProducts() {
    return this.request<ProductsResponse>('/api/products');
  }

  getProduct(id: string) {
    return this.request<ProductResponse>(`/api/products/${id}`);
  }

  createProduct(product: ProductPayload) {
    return this.request<ProductResponse>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  updateProduct(id: string, product: Partial<ProductPayload>) {
    return this.request<ProductResponse>(`/api/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(product),
    });
  }

  deleteProduct(id: string) {
    return this.request<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Public product methods
  getPublicProduct(id: string) {
    return this.request<PublicProductResponse>(`/api/public/products/${id}`);
  }

  // Orders methods
  createOrder(order: CreateOrderPayload) {
    return this.request<OrderResponse>('/api/public/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // Emotions methods
  trackEmotion(emotion: EmotionPayload) {
    return this.request<{ success: boolean }>('/api/emotions/track', {
      method: 'POST',
      body: JSON.stringify(emotion),
    });
  }

  getEmotionalJourney(userId: string, productId?: string, hoursBack?: number) {
    const params = new URLSearchParams({ user_id: userId });
    if (productId) params.append('product_id', productId);
    if (hoursBack) params.append('hours_back', hoursBack.toString());

    return this.request<EmotionJourneyResponse>(`/api/emotions/journey?${params.toString()}`);
  }

  predictPurchase(userId: string, currentEmotion: EmotionPayload) {
    return this.request<PredictionApiResponse>('/api/emotions/predict', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, current_emotion: currentEmotion }),
    });
  }

  // Analytics methods
  getAnalyticsInsights() {
    return this.request<AnalyticsInsightsApiResponse>('/api/analytics/insights');
  }

  getDashboardAnalytics(timeframe?: string, consciousnessLevel?: string) {
    const params = new URLSearchParams();
    if (timeframe) params.append('timeframe', timeframe);
    if (consciousnessLevel) params.append('consciousness_level', consciousnessLevel);

    const query = params.toString();
    const endpoint = query ? `/api/analytics/dashboard?${query}` : '/api/analytics/dashboard';
    return this.request<DashboardAnalyticsResponse>(endpoint);
  }

  exportEmotionalData(startDate?: string, endDate?: string, format?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (format) params.append('format', format);

    const query = params.toString();
    const endpoint = query ? `/api/analytics/export?${query}` : '/api/analytics/export';
    return this.request<ExportAnalyticsResponse>(endpoint);
  }

  // Events methods
  trackEvent(event: TrackingEventPayload) {
    return this.request<{ success: boolean }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  trackBatchEvents(events: TrackingEventPayload[]) {
    return this.request<{ success: boolean }>('/api/events/batch', {
      method: 'POST',
      body: JSON.stringify({ events }),
    });
  }
}

export const apiClient = new ApiClient();
