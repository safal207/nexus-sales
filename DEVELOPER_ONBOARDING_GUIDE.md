# 🚀 NEXUS.SALES DEVELOPER ONBOARDING GUIDE

**Version:** V2.0 (UX/DX Improved)  
**Created by:** Qwen (UX/Developer Experience Specialist)  
**Date:** 2025-09-29  

---

## 📋 **TABLE OF CONTENTS**

1. [🎯 Getting Started](#getting-started)
2. [🏗️ Architecture Overview](#architecture-overview)
3. [🛠️ Development Environment](#development-environment)
4. [📁 Project Structure](#project-structure)
5. [⚡ Development Workflow](#development-workflow)
6. [🧪 Testing Strategy](#testing-strategy)
7. [🔍 Code Navigation](#code-navigation)
8. [📚 Best Practices](#best-practices)
9. [❓ Troubleshooting](#troubleshooting)

---

## 🎯 **GETTING STARTED**

### **Welcome to Nexus.Sales!** 🎉

Welcome to our advanced funnel builder platform! This guide will help you get up and running quickly with our Domain-Driven Design architecture.

### **What You'll Learn:**
- How to set up your development environment
- Understanding our Clean Architecture structure
- Navigating the codebase effectively
- Best practices for development
- How to contribute effectively to the project

---

## 🏗️ **ARCHITECTURE OVERVIEW**

### **Core Principles:**
- **Domain-Driven Design (DDD)**: Business logic first
- **Clean Architecture**: Clear separation of concerns
- **Event-Driven**: Loose coupling between components
- **CQRS**: Separation of read and write operations
- **Test-First**: Quality by design

### **Architecture Layers:**

```
┌─────────────────────────────────────────┐
│            🖥️ PRESENTATION LAYER        │ ← React Components & API Routes
│  • UI Components                        │
│  • State Management                     │
│  • API Clients                          │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            🔄 APPLICATION LAYER         │ ← Use Cases & DTOs
│  • Commands/Queries                     │
│  • Application Services                 │
│  • DTOs & Validators                    │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│            🧩 DOMAIN LAYER              │ ← Business Logic
│  • Entities                             │
│  • Value Objects                        │
│  • Domain Services                      │
│  • Domain Events                        │
│  • Repository Interfaces                │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│         🗄️ INFRASTRUCTURE LAYER         │ ← Technical Implementation
│  • Database Implementations             │
│  • External API Clients                 │
│  • Email Services                       │
│  • File Storage                         │
└─────────────────────────────────────────┘
```

---

## 🛠️ **DEVELOPMENT ENVIRONMENT**

### **Prerequisites:**
- **Node.js** (v18+) - JavaScript runtime
- **npm** (v8+) - Package manager
- **Git** - Version control
- **Docker** (recommended) - Containerization
- **VS Code** (recommended) - Editor with extensions

### **Quick Setup:**
```bash
# 1. Clone the repository
git clone <repository-url>
cd nexus-sales

# 2. Install dependencies
npm install

# 3. Install VS Code extensions (recommended)
# - TypeScript Importer
# - Prettier
# - ESLint
# - GitLens
# - Bracket Pair Colorizer
```

### **Environment Variables:**
Create `.env.local` in the `apps/web` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexus-sales"

# Authentication
JWT_SECRET="your-jwt-secret-here"
JWT_EXPIRES_IN="24h"

# API Keys
HUGGING_FACE_KEY="your-hugging-face-key"

# Email
EMAIL_PROVIDER="smtp"
EMAIL_FROM="noreply@nexussales.com"

# Redis (for caching)
REDIS_URL="redis://localhost:6379"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📁 **PROJECT STRUCTURE**

```
nexus-sales/
├── 📱 apps/                          # Applications
│   ├── web/                          # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router pages
│   │   │   │   ├── (auth)/          # Authentication routes
│   │   │   │   ├── dashboard/       # Dashboard routes
│   │   │   │   ├── api/             # API routes
│   │   │   │   └── [...all]/        # Catch-all route (404)
│   │   │   ├── components/           # UI Components
│   │   │   │   ├── features/        # Feature-specific components
│   │   │   │   │   ├── auth/        # Authentication components
│   │   │   │   │   ├── funnels/     # Funnel builder components
│   │   │   │   │   └── analytics/   # Analytics components
│   │   │   │   ├── layout/          # Layout components
│   │   │   │   ├── ui/              # Base UI components
│   │   │   │   └── shared/          # Shared components
│   │   │   ├── lib/                 # Application logic
│   │   │   │   ├── auth/            # Authentication logic
│   │   │   │   ├── api/             # API clients and services
│   │   │   │   ├── stores/          # Zustand stores
│   │   │   │   ├── hooks/           # Custom React hooks
│   │   │   │   ├── utils/           # Utility functions
│   │   │   │   └── config/          # Configuration
│   │   │   ├── types/               # TypeScript definitions
│   │   │   └── constants/           # Application constants
│   │   ├── public/                  # Static assets
│   │   ├── tests/                   # Test files
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
│   ├── domain/                      # Domain models (entities, value objects)
│   ├── shared-utils/                # Shared utilities
│   ├── types/                       # Shared TypeScript types
│   ├── ui/                          # Shared UI components
│   ├── eslint-config/               # ESLint configuration
│   └── testing/                     # Testing utilities
├── 🗄️ infrastructure/               # Infrastructure as Code
│   ├── docker/                      # Docker configurations
│   ├── k8s/                         # Kubernetes manifests
│   └── scripts/                     # Deployment scripts
└── 📊 docs/                         # Project documentation
    ├── architecture/                # Architecture docs
    ├── development/                 # Development guides
    └── api/                         # API documentation
```

---

## ⚡ **DEVELOPMENT WORKFLOW**

### **Daily Development:**
```bash
# 1. Start the development server
npm run dev

# 2. Run tests in watch mode
npm run test:watch

# 3. Check types
npm run type-check

# 4. Lint code
npm run lint
```

### **Feature Development Process:**
1. **Create a branch:** `feature/user/[feature-description]`
2. **Make changes** in appropriate directories
3. **Write tests** for new functionality
4. **Run all tests** to ensure nothing is broken
5. **Commit changes** with conventional commit messages
6. **Push branch** and create pull request
7. **Get review** from team members

### **Branch Naming:**
```
feature/[user]/[feature-description]    # New features
fix/[user]/[bug-description]            # Bug fixes
refactor/[user]/[description]           # Code refactoring
docs/[user]/[description]               # Documentation
```

---

## 🧪 **TESTING STRATEGY**

### **Testing Pyramid:**
- **Unit Tests** (70%): Test individual functions/classes
- **Integration Tests** (20%): Test component interactions
- **E2E Tests** (10%): Test user workflows

### **Testing Tools:**
- **Jest** - Unit and integration testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **Testing Library** - DOM testing utilities

### **Test Structure:**
```typescript
// Example test structure
describe('FeatureName', () => {
  let service: FeatureService;
  
  beforeEach(() => {
    // Setup test dependencies
    service = new FeatureService();
  });

  it('should do something when condition', () => {
    // Arrange
    const input = createInput();
    
    // Act
    const result = service.method(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### **Testing Utilities:**
```typescript
// Use test builders from @nexus/testing package
import { UserBuilder, ProductBuilder } from '@nexus/testing';

const user = UserBuilder.create()
  .withEmail('test@example.com')
  .withActiveStatus(true)
  .build();
```

---

## 🔍 **CODE NAVIGATION**

### **Finding Code Quickly:**

#### **Domain Models:**
- `packages/domain/` - All domain entities and value objects
- Search patterns: `UserEntity`, `EmailValueObject`, `UserRepository`

#### **Frontend Components:**
- `apps/web/src/components/features/` - Feature-specific components
- `apps/web/src/components/ui/` - Reusable UI components
- Search patterns: `LoginForm`, `FunnelBuilder`, `AnalyticsChart`

#### **API Endpoints:**
- `apps/web/src/app/api/` - Next.js API routes
- Search patterns: `GET`, `POST`, `PUT`, `DELETE`

#### **Use Cases:**
- `apps/web/src/lib/[feature]/application/` - Application layer
- Search patterns: `CreateUserUseCase`, `UpdateProductCommand`

### **VS Code Shortcuts for Navigation:**
- `Ctrl+P` - Quick open files
- `Ctrl+Shift+O` - Go to symbol in file
- `Ctrl+T` - Go to symbol in workspace
- `F12` - Go to definition
- `Ctrl+Click` - Go to definition

### **Code Search Tips:**
```
# Find all references to a function
Right-click on function name → "Find All References"

# Search in entire workspace
Ctrl+Shift+F → Enter search term

# Search in specific file type
Ctrl+Shift+F → File: **/*.ts

# Search for TODOs
Ctrl+Shift+F → TODO
```

---

## 📚 **BEST PRACTICES**

### **Code Style:**
- **TypeScript** - Use strict typing everywhere
- **Naming** - Descriptive and consistent
- **Functions** - Single responsibility, small and focused
- **Comments** - Explain the "why", not the "what"
- **Formatting** - Use Prettier (auto-configured)

### **Architecture Principles:**
```typescript
// ✅ GOOD: Follows DDD principles
class User {
  constructor(private email: Email, private profile: UserProfile) {}
  
  changeEmail(newEmail: Email): void {
    this.email = newEmail;
    this.domainEvents.push(new UserEmailChangedEvent(this.id, newEmail));
  }
}

// ❌ AVOID: Business logic in UI components
// Keep domain logic in domain entities, not in React components
```

### **Testing Best Practices:**
```typescript
// ✅ GOOD: Proper test structure
it('should create user when valid data provided', async () => {
  // Arrange
  const command = { email: 'test@example.com', password: 'password' };
  
  // Act
  const result = await registerUserUseCase.execute(command);
  
  // Assert
  expect(result.isSuccess).toBe(true);
  expect(result.value.email).toBe('test@example.com');
});

// ❌ AVOID: Testing implementation details
// Test behavior, not internal implementation
```

### **Error Handling:**
```typescript
// ✅ GOOD: Proper error handling
try {
  const user = await userService.createUser(userData);
  return { success: true, user };
} catch (error) {
  logger.error('User creation failed', error);
  return { success: false, error: 'User creation failed' };
}

// ❌ AVOID: Silent failures
// Always handle and log errors appropriately
```

---

## ❓ **TROUBLESHOOTING**

### **Common Issues:**

#### **TypeScript Errors:**
```
# Solution: Run type checking to identify issues
npm run type-check

# Solution: Update dependencies if needed
npm update
```

#### **Build Failures:**
```
# Solution: Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### **Database Issues:**
```
# Solution: Check database connection
# Ensure database service is running
docker-compose up database

# Run migrations
npm run db:migrate
```

#### **API Integration Issues:**
```
# Solution: Check environment variables
# Ensure NEXT_PUBLIC_API_URL is set correctly
```

### **Development Tips:**
- **When adding new dependencies**, consider if they exist in shared packages first
- **When creating new components**, check if similar functionality already exists
- **When writing tests**, use the test builders from `@nexus/testing`
- **When fixing bugs**, write a test that reproduces the issue first

---

## 🎯 **SUCCESS METRICS**

### **Week 1 Goals:**
- [ ] Successfully set up development environment
- [ ] Run the application locally
- [ ] Understand the project structure
- [ ] Complete first code read-through

### **Week 2 Goals:**
- [ ] Make first contribution (bug fix or small feature)
- [ ] Write tests for your changes
- [ ] Get code reviewed and merged
- [ ] Participate in code review process

---

## 📞 **GETTING HELP**

### **Resources:**
- **Architecture Docs:** `ARCHITECTURE_V1.md`, `ARCHITECTURE_V2_UX_IMPROVEMENTS.md`
- **API Documentation:** `docs/api/`
- **Team Communication:** [Slack Channel]
- **Code of Conduct:** [Link]

### **When to Ask for Help:**
- Stuck on a problem for more than 30 minutes
- Uncertain about architectural decisions
- Need clarification on business requirements
- Reviewing complex code changes

### **Who to Contact:**
- **Architecture Questions:** Claude Code (Lead Developer)
- **Frontend Questions:** Qwen (Current UX Specialist)
- **AI Integration:** Gemini (Next Specialist)
- **General Questions:** Development Team

---

## 🎉 **YOU'RE READY TO DEVELOP!**

Congratulations! You now have everything you need to start contributing to Nexus.Sales. Remember to follow best practices, write tests, and don't hesitate to ask questions.

Happy coding! 🚀

---

**Created by:** Qwen (UX/Developer Experience Specialist)  
**Review Date:** 2025-09-29