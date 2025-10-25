import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface TestTypePageProps {
  params: {
    type: string;
  };
}

const testTypeDetails: { [key: string]: any } = {
  'unit-testing': {
    name: 'Unit Testing',
    icon: '🧩',
    description: 'Testing individual functions and components',
    coverage: 31.09,
    tests: 152,
    passed: 152,
    failed: 0,
    tools: ['Jest', 'React Testing Library', 'Vitest'],
    examples: [
      'Testing mathematical functions',
      'Form and input validation',
      'API client testing',
      'Business logic verification'
    ],
    benefits: [
      'Fast bug detection',
      'Easy debugging',
      'Code behavior documentation',
      'Refactoring without fear'
    ]
  },
  'integration-testing': {
    name: 'Integration Testing',
    icon: '🔗',
    description: 'Testing interaction between modules',
    coverage: 95.2,
    tests: 24,
    passed: 24,
    failed: 0,
    tools: ['Jest', 'Supertest', 'Testcontainers'],
    examples: [
      'API endpoints with database',
      'Interaction with external services',
      'UI component integration',
      'Middleware testing'
    ],
    benefits: [
      'Verification of contracts between modules',
      'Detection of integration problems',
      'Testing real scenarios',
      'Validation of architectural decisions'
    ]
  },
  'system-testing': {
    name: 'System Testing (E2E)',
    icon: '🌐',
    description: 'End-to-end testing of user scenarios',
    coverage: 87.3,
    tests: 45,
    passed: 42,
    failed: 3,
    tools: ['Playwright', 'Cypress', 'Selenium'],
    examples: [
      'Complete user registration',
      'Order placement',
      'Site navigation',
      'Mobile adaptation'
    ],
    benefits: [
      'Testing from user perspective',
      'Verification of entire system',
      'Business process validation',
      'UX problem detection'
    ]
  },
  'performance-testing': {
    name: 'Performance Testing',
    icon: '⚡',
    description: 'Testing speed and performance',
    coverage: 85,
    tests: 12,
    passed: 11,
    failed: 1,
    tools: ['k6', 'Artillery', 'Lighthouse', 'WebPageTest'],
    examples: [
      'Page load times',
      'API performance',
      'Scalability under load',
      'Resource optimization'
    ],
    benefits: [
      'Ensuring fast operation',
      'Optimizing user experience',
      'Preventing scaling problems',
      'Performance monitoring'
    ]
  },
  'security-testing': {
    name: 'Security Testing',
    icon: '🔒',
    description: 'Checking for vulnerabilities and security',
    coverage: 92,
    tests: 8,
    passed: 8,
    failed: 0,
    tools: ['OWASP ZAP', 'Snyk', 'Burp Suite', 'Nessus'],
    examples: [
      'SQL injection prevention',
      'XSS protection',
      'CSRF validation',
      'Authentication bypass testing'
    ],
    benefits: [
      'Protection from common vulnerabilities',
      'Ensuring data security',
      'Compliance with security standards',
      'Company reputation protection'
    ]
  },
  'accessibility-testing': {
    name: 'Accessibility Testing',
    icon: '♿',
    description: 'Testing accessibility for all users',
    coverage: 78,
    tests: 15,
    passed: 12,
    failed: 3,
    tools: ['axe-core', 'Lighthouse', 'NVDA', 'VoiceOver'],
    examples: [
      'WCAG 2.1 AA compliance',
      'Keyboard navigation',
      'Screen reader compatibility',
      'Color contrast validation'
    ],
    benefits: [
      'Accessibility for people with disabilities',
      'Audience expansion',
      'Legal protection',
      'General UX improvement'
    ]
  },
  'compatibility-testing': {
    name: 'Compatibility Testing',
    icon: '🔄',
    description: 'Testing across different browsers and devices',
    coverage: 91,
    tests: 28,
    passed: 26,
    failed: 2,
    tools: ['BrowserStack', 'Sauce Labs', 'CrossBrowserTesting'],
    examples: [
      'Chrome, Firefox, Safari, Edge',
      'Desktop and mobile versions',
      'Different operating systems',
      'Different screen resolutions'
    ],
    benefits: [
      'Consistent user experience',
      'Platform coverage expansion',
      'Prevention of browser-specific bugs',
      'Cross-platform compatibility improvement'
    ]
  },
  'regression-testing': {
    name: 'Regression Testing',
    icon: '🔙',
    description: 'Ensuring old features still work',
    coverage: 94,
    tests: 89,
    passed: 89,
    failed: 0,
    tools: ['Jest', 'Playwright', 'Automated test suites'],
    examples: [
      'Verification of existing features after changes',
      'Smoke testing after deployment',
      'Critical path testing',
      'Stability validation'
    ],
    benefits: [
      'Regression prevention',
      'Release stability assurance',
      'Quality confidence',
      'Fast problem detection'
    ]
  },
  'visual-regression-testing': {
    name: 'Visual Regression Testing',
    icon: '👁️',
    description: 'Detecting unintended UI changes',
    coverage: 87,
    tests: 156,
    passed: 150,
    failed: 6,
    tools: ['Percy', 'Chromatic', 'Applitools', 'Playwright Visual Comparisons'],
    examples: [
      'Screenshot comparison after UI changes',
      'Cross-browser visual consistency',
      'Responsive design validation',
      'Theme and styling verification'
    ],
    benefits: [
      'Catch visual bugs automatically',
      'Maintain design consistency',
      'Prevent unintended UI changes',
      'Faster design reviews'
    ]
  },
  'exploratory-testing': {
    name: 'Exploratory Testing',
    icon: '🔍',
    description: 'Creative testing without formal test cases',
    coverage: 0,
    tests: 45,
    passed: 42,
    failed: 3,
    tools: ['Session-based test management', 'Mind mapping tools', 'Bug tracking systems'],
    examples: [
      'Free-form user journey exploration',
      'Edge case discovery',
      'Usability assessment',
      'Error guessing techniques'
    ],
    benefits: [
      'Discover unexpected issues',
      'Improve test coverage creatively',
      'Better understanding of user experience',
      'Flexible testing approach'
    ]
  },
  'usability-testing': {
    name: 'Usability Testing',
    icon: '👥',
    description: 'Testing user experience and ease of use',
    coverage: 0,
    tests: 12,
    passed: 10,
    failed: 2,
    tools: ['UserTesting', 'Hotjar', 'Lookback', 'Optimal Workshop'],
    examples: [
      'Task completion rate measurement',
      'User satisfaction surveys',
      'Navigation path analysis',
      'Accessibility compliance testing'
    ],
    benefits: [
      'Improve user experience',
      'Reduce support requests',
      'Increase user satisfaction',
      'Validate design decisions'
    ]
  }
};

export default function TestTypePage({ params }: TestTypePageProps) {
  const testType = testTypeDetails[params.type];

  if (!testType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Type Not Found</h1>
          <p className="text-xl text-gray-600">The requested test type does not exist.</p>
          <Button className="mt-6" onClick={() => window.history.back()}>
            ← Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{testType.icon}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{testType.name}</h1>
          <p className="text-xl text-gray-600 mb-6">{testType.description}</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => window.history.back()}>
              ← Назад к дашборду
            </Button>
            <Button variant="outline">
              📖 Подробнее в документации
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{testType.coverage}%</div>
            <div className="text-sm text-gray-600">Покрытие</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{testType.tests}</div>
            <div className="text-sm text-gray-600">Всего тестов</div>
          </Card>
          <Card className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{testType.passed}</div>
            <div className="text-sm text-gray-600">Пройдено</div>
          </Card>
          <Card className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              testType.failed > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {testType.failed}
            </div>
            <div className="text-sm text-gray-600">Провалено</div>
          </Card>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tools */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🛠️ Tools</h2>
            <div className="space-y-3">
              {testType.tools.map((tool: string, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{tool}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Examples */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Test Examples</h2>
            <div className="space-y-3">
              {testType.examples.map((example: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span>{example}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testType.benefits.map((benefit: string, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="font-medium text-purple-900">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-x-4">
          <Button
            onClick={() => {
              // Simulate running tests for this type
              alert(`Running tests for ${testType.name}...`);
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            🚀 Run {testType.name}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to demo page
              window.location.href = `/testing-dashboard/demo`;
            }}
          >
            🎮 View Demo
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Open documentation
              window.open('/TESTING_README.md', '_blank');
            }}
          >
            📖 Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
