# 🏗️ NEXUS.SALES PROJECT ARCHITECTURE V1.0
## Created by: Claude Code (Base Creator)
## Date: 2025-09-29

---

## 🎯 **АРХИТЕКТУРНАЯ ФИЛОСОФИЯ**

**Принципы:**
- 🧩 **Modular Monolith** → Clean separation, easy to scale
- 🎭 **Domain-Driven Design** → Business logic first
- 🔄 **Event-Driven Architecture** → Loose coupling
- 🧪 **Test-Driven Development** → Quality first
- ⚡ **Performance by Design** → Speed from start

---

## 📁 **УЛУЧШЕННАЯ СТРУКТУРА ПРОЕКТА**

```
nexus-sales/
├── 📱 apps/                          # Applications
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router
│   │   │   ├── components/           # UI Components
│   │   │   │   ├── ui/              # Base UI components
│   │   │   │   ├── features/        # Feature-specific components
│   │   │   │   └── layout/          # Layout components
│   │   │   ├── lib/                 # Application logic
│   │   │   │   ├── auth/            # Authentication
│   │   │   │   ├── api/             # API clients
│   │   │   │   ├── stores/          # State management
│   │   │   │   ├── hooks/           # Custom hooks
│   │   │   │   └── utils/           # Utilities
│   │   │   ├── types/               # TypeScript types
│   │   │   └── constants/           # App constants
│   │   ├── public/                  # Static assets
│   │   ├── tests/                   # E2E tests
│   │   └── docs/                    # App documentation
│   └── api/                         # Clojure Backend API
│       ├── src/nexus/api/
│       │   ├── core/                # Core domain logic
│       │   ├── handlers/            # HTTP handlers
│       │   ├── services/            # Business services
│       │   ├── repositories/        # Data access
│       │   ├── middleware/          # HTTP middleware
│       │   └── config/              # Configuration
│       └── resources/               # Config files
├── 📦 packages/                      # Shared packages
│   ├── ui/                          # Shared UI components
│   ├── types/                       # Shared TypeScript types
│   ├── eslint-config/              # ESLint configuration
│   ├── typescript-config/          # TypeScript configuration
│   ├── domain/                     # 🆕 Domain models
│   ├── shared-utils/               # 🆕 Shared utilities
│   └── testing/                    # 🆕 Testing utilities
├── 🗄️ infrastructure/              # Infrastructure as Code
│   ├── docker/                     # Docker configurations
│   ├── k8s/                        # Kubernetes manifests
│   ├── terraform/                  # Infrastructure definitions
│   └── scripts/                    # Deployment scripts
├── 📊 docs/                        # Project documentation
│   ├── architecture/               # Architecture docs
│   ├── api/                        # API documentation
│   ├── deployment/                 # Deployment guides
│   └── development/                # Development guides
└── 🧪 tools/                       # Development tools
    ├── generators/                 # Code generators
    ├── linting/                    # Custom linting rules
    └── testing/                    # Testing tools
```

---

## 🏛️ **CORE ARCHITECTURAL PATTERNS**

### **1. 🎭 DOMAIN-DRIVEN DESIGN**

```typescript
// packages/domain/src/auth/entities/User.ts
export class User {
  constructor(
    private readonly id: UserId,
    private readonly email: Email,
    private readonly profile: UserProfile
  ) {}

  authenticate(password: Password): AuthResult {
    // Domain logic here
  }

  isActive(): boolean {
    return this.profile.isActive;
  }
}

// packages/domain/src/auth/value-objects/Email.ts
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEmailError(value);
    }
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toString(): string {
    return this.value;
  }
}
```

### **2. 🔄 EVENT-DRIVEN ARCHITECTURE**

```typescript
// packages/domain/src/events/EventBus.ts
export interface DomainEvent {
  aggregateId: string;
  eventType: string;
  timestamp: Date;
  version: number;
}

export class EventBus {
  private handlers = new Map<string, Array<(event: DomainEvent) => void>>();

  publish<T extends DomainEvent>(event: T): void {
    const handlers = this.handlers.get(event.eventType) || [];
    handlers.forEach(handler => handler(event));
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => void
  ): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }
}

// Domain Events
export class UserRegisteredEvent implements DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date(),
    public readonly version: number = 1
  ) {}

  eventType = 'UserRegistered';
}
```

### **3. 🧩 CLEAN ARCHITECTURE LAYERS**

```typescript
// apps/web/src/lib/auth/application/usecases/RegisterUser.ts
export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private eventBus: EventBus
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    // 1. Validate
    const validation = await this.validate(command);
    if (!validation.isValid) {
      return RegisterUserResult.failure(validation.errors);
    }

    // 2. Create domain entity
    const user = User.create(command.email, command.password);

    // 3. Save
    await this.userRepository.save(user);

    // 4. Send email
    await this.emailService.sendWelcomeEmail(user.email);

    // 5. Publish event
    await this.eventBus.publish(
      new UserRegisteredEvent(user.id.toString(), user.email.toString())
    );

    return RegisterUserResult.success(user);
  }
}
```

### **4. ⚡ CQRS PATTERN**

```typescript
// Read Model (Query)
export interface UserReadModel {
  id: string;
  email: string;
  name: string;
  registeredAt: Date;
  lastLoginAt?: Date;
}

// Query Handler
export class GetUserByIdQuery {
  constructor(public readonly userId: string) {}
}

export class GetUserByIdHandler {
  constructor(private readModelStore: ReadModelStore) {}

  async handle(query: GetUserByIdQuery): Promise<UserReadModel | null> {
    return this.readModelStore.findUserById(query.userId);
  }
}

// Command Handler
export class RegisterUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly name: string
  ) {}
}

export class RegisterUserHandler {
  constructor(
    private userRepository: UserRepository,
    private eventBus: EventBus
  ) {}

  async handle(command: RegisterUserCommand): Promise<void> {
    // Command logic here
  }
}
```

---

## 🔗 **DEPENDENCY INJECTION & IOC**

```typescript
// apps/web/src/lib/container/Container.ts
export class DIContainer {
  private services = new Map<string, any>();
  private singletons = new Map<string, any>();

  register<T>(token: string, factory: () => T, singleton = false): void {
    this.services.set(token, { factory, singleton });
  }

  resolve<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service ${token} not found`);
    }

    if (service.singleton) {
      if (!this.singletons.has(token)) {
        this.singletons.set(token, service.factory());
      }
      return this.singletons.get(token);
    }

    return service.factory();
  }
}

// Configuration
export const configureContainer = (): DIContainer => {
  const container = new DIContainer();

  // Repositories
  container.register('UserRepository', () => new SQLUserRepository(), true);
  container.register('ProductRepository', () => new SQLProductRepository(), true);

  // Services
  container.register('EmailService', () => new SMTPEmailService());
  container.register('EventBus', () => new InMemoryEventBus(), true);

  // Use Cases
  container.register('RegisterUserUseCase', () => new RegisterUserUseCase(
    container.resolve('UserRepository'),
    container.resolve('EmailService'),
    container.resolve('EventBus')
  ));

  return container;
};
```

---

## 📊 **DATA LAYER ARCHITECTURE**

```typescript
// packages/domain/src/repositories/BaseRepository.ts
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
  findAll(): Promise<T[]>;
}

// Specification Pattern
export interface Specification<T> {
  isSatisfiedBy(entity: T): boolean;
  and(spec: Specification<T>): Specification<T>;
  or(spec: Specification<T>): Specification<T>;
}

export class UserRepository implements Repository<User, UserId> {
  constructor(private db: Database) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id.toString()]
    );
    return row ? this.mapToUser(row) : null;
  }

  async findBySpecification(spec: Specification<User>): Promise<User[]> {
    // Implementation with query builder
  }

  private mapToUser(row: any): User {
    return new User(
      new UserId(row.id),
      new Email(row.email),
      new UserProfile(row.name, row.active)
    );
  }
}
```

---

## 🎨 **FRONTEND ARCHITECTURE**

```typescript
// apps/web/src/lib/stores/createStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentFunnel: Funnel | null;
}

export interface AppActions {
  setUser: (user: User | null) => void;
  setFunnel: (funnel: Funnel | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      currentFunnel: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setFunnel: (funnel) => set({ currentFunnel: funnel }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'app-store' }
  )
);

// Feature-specific stores
export const useFunnelStore = create<FunnelState & FunnelActions>()(
  devtools(
    (set, get) => ({
      funnels: [],
      currentFunnel: null,
      selectedElement: null,

      addFunnel: (funnel) => set((state) => ({
        funnels: [...state.funnels, funnel]
      })),

      selectElement: (element) => set({ selectedElement: element }),
    }),
    { name: 'funnel-store' }
  )
);
```

### **Component Architecture**

```typescript
// apps/web/src/components/features/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const { mutate: login, isLoading } = useLogin({
    onSuccess,
    onError
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(login)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Входим...' : 'Войти'}
        </Button>
      </form>
    </Form>
  );
};
```

---

## 🧪 **TESTING ARCHITECTURE**

```typescript
// packages/testing/src/builders/UserBuilder.ts
export class UserBuilder {
  private user: Partial<User> = {};

  withEmail(email: string): UserBuilder {
    this.user.email = new Email(email);
    return this;
  }

  withId(id: string): UserBuilder {
    this.user.id = new UserId(id);
    return this;
  }

  build(): User {
    return new User(
      this.user.id || new UserId('test-id'),
      this.user.email || new Email('test@example.com'),
      this.user.profile || new UserProfile('Test User', true)
    );
  }
}

// Test utilities
export const createTestUser = () => new UserBuilder().build();
export const createTestUserWithEmail = (email: string) =>
  new UserBuilder().withEmail(email).build();
```

---

## 🔧 **CONFIGURATION MANAGEMENT**

```typescript
// apps/web/src/lib/config/index.ts
export interface AppConfig {
  database: {
    url: string;
    maxConnections: number;
  };
  redis: {
    url: string;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  email: {
    provider: 'smtp' | 'sendgrid';
    from: string;
  };
  ai: {
    huggingFaceKey: string;
  };
}

export const getConfig = (): AppConfig => {
  return {
    database: {
      url: process.env.DATABASE_URL!,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    },
    redis: {
      url: process.env.REDIS_URL!,
    },
    auth: {
      jwtSecret: process.env.JWT_SECRET!,
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    email: {
      provider: (process.env.EMAIL_PROVIDER as any) || 'smtp',
      from: process.env.EMAIL_FROM!,
    },
    ai: {
      huggingFaceKey: process.env.HUGGING_FACE_KEY!,
    },
  };
};
```

---

## 📈 **MONITORING & OBSERVABILITY**

```typescript
// packages/shared-utils/src/logging/Logger.ts
export interface Logger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export class StructuredLogger implements Logger {
  constructor(private service: string) {}

  info(message: string, meta: any = {}): void {
    console.log(JSON.stringify({
      level: 'info',
      service: this.service,
      message,
      meta,
      timestamp: new Date().toISOString(),
    }));
  }

  error(message: string, error?: Error, meta: any = {}): void {
    console.error(JSON.stringify({
      level: 'error',
      service: this.service,
      message,
      error: error?.message,
      stack: error?.stack,
      meta,
      timestamp: new Date().toISOString(),
    }));
  }
}

// Metrics
export class MetricsCollector {
  private metrics = new Map<string, number>();

  increment(metric: string, value = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }

  gauge(metric: string, value: number): void {
    this.metrics.set(metric, value);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

```yaml
# infrastructure/k8s/app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-sales-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexus-sales-web
  template:
    metadata:
      labels:
        app: nexus-sales-web
    spec:
      containers:
      - name: web
        image: nexus-sales/web:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: nexus-sales-web-service
spec:
  selector:
    app: nexus-sales-web
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

---

## ✅ **БАЗОВАЯ АРХИТЕКТУРА V1.0 - ГОТОВА**

### **🎯 Что создано:**
- ✅ Модульная архитектура с четкими границами
- ✅ Domain-Driven Design структура
- ✅ Event-driven коммуникация
- ✅ Clean Architecture слои
- ✅ CQRS pattern для разделения read/write
- ✅ Dependency Injection контейнер
- ✅ Тестирование и мониторинг
- ✅ Конфигурация и деплой

### **📊 Качество V1.0:**
- **Modularity:** ⭐⭐⭐ (Good separation)
- **Scalability:** ⭐⭐⭐ (Ready for growth)
- **Testability:** ⭐⭐⭐ (Test-friendly structure)
- **Maintainability:** ⭐⭐⭐ (Clear patterns)
- **Performance:** ⭐⭐ (Basic optimization)

### **⚠️ Известные ограничения:**
- Нет микросервисной готовности
- Базовый мониторинг
- Простая обработка ошибок
- Нет advanced caching
- Нет multi-tenancy

---

## 📋 **HANDOFF К СЛЕДУЮЩЕМУ АУДИТОРУ**

**Передаю:** Функциональную архитектуру с четкими паттернами
**Ожидаю улучшений:** UX архитектуры, визуализации, developer experience

**Файлы для ревью:**
- `ARCHITECTURE_V1.0.md` (этот файл)
- Существующая структура проекта
- Package.json и turbo.json конфигурации

**Следующему аудитору рекомендую сфокусироваться на:**
1. Developer Experience улучшения
2. Визуализация архитектуры
3. Onboarding новых разработчиков
4. Инструменты для работы с архитектурой

---

*Claude Code - Base Architecture Creator*
*2025-09-29*