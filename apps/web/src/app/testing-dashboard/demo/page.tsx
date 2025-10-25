'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface DemoItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  code: string;
  output: string[];
  steps: string[];
  category: string;
}

const demoItems: DemoItem[] = [
  // Unit Testing
  {
    id: 'unit-test',
    title: 'Unit Testing',
    icon: '🧩',
    description: 'Testing individual functions and components',
    category: 'Unit Testing',
    code: `describe('Calculator', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('multiplies 3 * 4 to equal 12', () => {
    expect(multiply(3, 4)).toBe(12);
  });
});`,
    output: [
      '✓ adds 1 + 2 to equal 3 (2ms)',
      '✓ multiplies 3 * 4 to equal 12 (1ms)',
      'Test Suites: 1 passed, 1 total',
      'Tests: 2 passed, 2 total'
    ],
    steps: [
      'Write a test for each function',
      'Run the test suite',
      'Verify all tests pass',
      'Refactor code with confidence'
    ]
  },

  // Integration Testing
  {
    id: 'integration-test',
    title: 'Integration Testing',
    icon: '🔗',
    description: 'Testing component interactions',
    category: 'Integration Testing',
    code: `describe('User Registration Flow', () => {
  test('creates user and sends welcome email', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };

    // Create user
    const user = await UserService.create(userData);

    // Verify user in database
    const savedUser = await User.findById(user.id);
    expect(savedUser.email).toBe(userData.email);

    // Verify welcome email was sent
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(userData.email);
  });
});`,
    output: [
      '✓ creates user and sends welcome email (45ms)',
      'Database connection: ✓',
      'Email service: ✓',
      'Test Suites: 1 passed, 1 total'
    ],
    steps: [
      'Set up test database',
      'Mock external services',
      'Test complete user flow',
      'Verify data consistency'
    ]
  },

  // E2E Testing
  {
    id: 'e2e-test',
    title: 'E2E Testing',
    icon: '🌐',
    description: 'End-to-end user journey testing',
    category: 'System Testing',
    code: `test('complete user registration and login', async ({ page }) => {
  // Navigate to registration page
  await page.goto('/register');

  // Fill registration form
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'securePass123');
  await page.fill('[data-testid="confirm-password"]', 'securePass123');

  // Submit form
  await page.click('[data-testid="register-button"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();

  // Test login with new credentials
  await page.click('[data-testid="logout"]');
  await page.fill('[data-testid="login-email"]', 'user@example.com');
  await page.fill('[data-testid="login-password"]', 'securePass123');
  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL('/dashboard');
});`,
    output: [
      '✓ complete user registration and login (5.2s)',
      'Page loads: ✓',
      'Form validation: ✓',
      'Database persistence: ✓',
      'UI interactions: ✓'
    ],
    steps: [
      'Launch browser instance',
      'Navigate through user journey',
      'Interact with UI elements',
      'Verify application state',
      'Clean up test data'
    ]
  },

  // API Testing
  {
    id: 'api-test',
    title: 'API Testing',
    icon: '🔌',
    description: 'Testing REST API endpoints',
    category: 'Integration Testing',
    code: `describe('/api/users', () => {
  test('GET /api/users returns user list', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    // Validate response schema
    response.body.forEach(user => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
    });
  });

  test('POST /api/users creates new user', async () => {
    const newUser = {
      email: 'newuser@example.com',
      name: 'New User',
      password: 'securePass123'
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(newUser.email);
  });
});`,
    output: [
      '✓ GET /api/users returns user list (45ms)',
      '✓ POST /api/users creates new user (67ms)',
      'Schema validation: ✓',
      'Status codes: ✓',
      'Response times: ✓'
    ],
    steps: [
      'Set up test server',
      'Send HTTP requests',
      'Validate response codes',
      'Check response data structure',
      'Verify business logic'
    ]
  },

  // Performance Testing
  {
    id: 'performance-test',
    title: 'Performance Testing',
    icon: '⚡',
    description: 'Load and performance testing',
    category: 'Performance Testing',
    code: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s', // Test duration

  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'], // Error rate should be below 10%
  },
};

export default function () {
  const response = http.get('https://api.example.com/users');

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has users array': (r) => r.json().length > 0,
  });

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}`,
    output: [
      '✓ http_req_duration: avg=234.56ms min=123.45ms med=210.12ms max=987.65ms p(95)=456.78ms',
      '✓ http_req_failed: 0.00%',
      '✓ iterations: 300',
      '✓ vus: 10',
      '✓ checks: rate=100.00%'
    ],
    steps: [
      'Define test scenarios',
      'Set performance thresholds',
      'Configure virtual users',
      'Run load test',
      'Analyze results and bottlenecks'
    ]
  },

  // Security Testing
  {
    id: 'security-test',
    title: 'Security Testing',
    icon: '🔒',
    description: 'Testing for vulnerabilities',
    category: 'Security Testing',
    code: `describe('Authentication Security', () => {
  test('prevents SQL injection in login', async () => {
    const maliciousEmail = "'; DROP TABLE users; --";

    const response = await request(app)
      .post('/api/login')
      .send({
        email: maliciousEmail,
        password: 'password123'
      })
      .expect(401); // Should fail authentication

    // Verify database is intact
    const userCount = await User.count();
    expect(userCount).toBeGreaterThan(0); // Table should still exist
  });

  test('prevents XSS in user input', async () => {
    const xssPayload = '<script>alert("XSS")</script>';

    const response = await request(app)
      .post('/api/comments')
      .send({ content: xssPayload })
      .expect(201);

    // Verify XSS payload is sanitized
    expect(response.body.content).not.toContain('<script>');
    expect(response.body.content).toContain('&lt;script&gt;');
  });

  test('enforces password complexity', async () => {
    const weakPasswords = ['123', 'password', 'abc'];

    for (const password of weakPasswords) {
      const response = await request(app)
        .post('/api/register')
        .send({
          email: 'test@example.com',
          password: password
        })
        .expect(400);

      expect(response.body.errors).toContain('Password too weak');
    }
  });
});`,
    output: [
      '✓ prevents SQL injection in login (45ms)',
      '✓ prevents XSS in user input (32ms)',
      '✓ enforces password complexity (28ms)',
      'Vulnerability scan: 0 high-risk issues',
      'OWASP compliance: ✓'
    ],
    steps: [
      'Run vulnerability scanners',
      'Test common attack vectors',
      'Validate input sanitization',
      'Check authentication mechanisms',
      'Review security headers'
    ]
  },

  // Accessibility Testing
  {
    id: 'accessibility-test',
    title: 'Accessibility Testing',
    icon: '♿',
    description: 'Testing for WCAG compliance',
    category: 'Accessibility Testing',
    code: `import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage meets WCAG 2.1 AA standards', async ({ page }) => {
  await page.goto('/');

  // Run axe-core accessibility scan
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  // Assert no violations
  expect(accessibilityScanResults.violations).toEqual([]);

  // Additional checks
  await test.step('Check keyboard navigation', async () => {
    // Focus on first interactive element
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus');
    expect(await focusedElement.isVisible()).toBe(true);
  });

  await test.step('Check color contrast', async () => {
    const textElements = await page.locator('p, h1, h2, h3, h4, h5, h6').all();

    for (const element of textElements) {
      const contrastRatio = await element.evaluate(el => {
        const style = window.getComputedStyle(el);
        // Calculate contrast ratio (simplified)
        return 4.5; // Mock value - in real test use actual calculation
      });

      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    }
  });
});`,
    output: [
      '✓ homepage meets WCAG 2.1 AA standards (3.2s)',
      '✓ keyboard navigation works (1.8s)',
      '✓ color contrast meets requirements (2.1s)',
      'Violations found: 0',
      'Compliance score: 100%'
    ],
    steps: [
      'Run automated accessibility scanners',
      'Test with screen readers',
      'Verify keyboard navigation',
      'Check color contrast ratios',
      'Validate ARIA attributes'
    ]
  },

  // Visual Regression Testing
  {
    id: 'visual-regression-test',
    title: 'Visual Regression Testing',
    icon: '👁️',
    description: 'Detecting unintended UI changes with screenshot comparison',
    category: 'Visual Regression Testing',
    code: `import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
  await page.goto('/');

  // Take a screenshot and compare with baseline
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    threshold: 0.1 // Allow 10% difference
  });
});

test('component visual regression', async ({ page }) => {
  await page.goto('/components');

  // Compare specific component
  await expect(page.locator('.header')).toHaveScreenshot('header.png');
});`,
    output: [
      '✓ homepage visual regression (2.3s)',
      '✓ component visual regression (1.8s)',
      'Screenshots compared: 15 passed, 2 failed',
      'Visual differences detected: 2',
      'Approval required: 2 screenshots'
    ],
    steps: [
      'Set up baseline screenshots',
      'Run tests after UI changes',
      'Review visual differences',
      'Approve or fix changes',
      'Update baselines as needed'
    ]
  },

  // Exploratory Testing
  {
    id: 'exploratory-test',
    title: 'Exploratory Testing',
    icon: '🔍',
    description: 'Creative testing without predefined test cases',
    category: 'Exploratory Testing',
    code: `// Exploratory Testing Session Notes
// Session: User Registration Flow (45 minutes)
// Charter: Explore user registration from different perspectives

Test Notes:
- Mobile registration works but keyboard navigation is poor
- Password requirements not clearly communicated
- Email verification link expires too quickly (15 min)
- Error messages are technical, not user-friendly

Bugs Found:
1. Registration fails when using special characters in name
2. Confirmation email not received on some email providers
3. Password reset flow doesn't work from mobile

Ideas for Improvement:
- Add real-time password strength indicator
- Extend email verification link to 24 hours
- Improve error messages with actionable guidance
- Add progress indicator for multi-step registration`,
    output: [
      'Session completed: 45 minutes',
      'Bugs found: 3 (2 high priority)',
      'Test coverage areas: 12',
      'User flows explored: 8',
      'Recommendations: 5'
    ],
    steps: [
      'Define testing charter and time box',
      'Explore application freely',
      'Document findings and observations',
      'Report bugs and improvement suggestions',
      'Debrief and plan next session'
    ]
  },

  // Usability Testing
  {
    id: 'usability-test',
    title: 'Usability Testing',
    icon: '👥',
    description: 'Testing user experience and ease of use',
    category: 'Usability Testing',
    code: `// Usability Testing Scenario
Task: "Complete your profile information"

User Actions Observed:
1. User clicks "Edit Profile" button ✓
2. User looks for profile completion progress bar ✓
3. User fills in basic information fields ✓
4. User struggles with date picker format ✗
5. User doesn't notice "Save Changes" button ✗
6. User tries to navigate away without saving ✗

Pain Points Identified:
- Date picker format is confusing
- Save button is not prominent enough
- No progress indication
- Unclear validation messages

Success Rate: 3/6 tasks completed successfully
Task Completion Time: Average 4:32 minutes
User Satisfaction: 6/10 (too many confusing elements)`,
    output: [
      'Task completion rate: 50%',
      'Average task time: 4:32 minutes',
      'User satisfaction score: 6/10',
      'Major usability issues found: 4',
      'Recommendations provided: 8'
    ],
    steps: [
      'Recruit representative users',
      'Prepare realistic test scenarios',
      'Conduct testing sessions',
      'Observe user behavior and feedback',
      'Analyze results and provide recommendations'
    ]
  }
];

export default function TestingDemo() {
  const [selectedDemo, setSelectedDemo] = useState<DemoItem | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<string[]>([]);

  const runDemo = async (demo: DemoItem) => {
    setIsRunning(true);
    setSelectedDemo(demo);
    setRunResults([]);

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Show results progressively
    for (let i = 0; i < demo.output.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setRunResults(prev => [...prev, demo.output[i]]);
    }

    setIsRunning(false);
  };

  const categories = ['Unit Testing', 'Integration Testing', 'System Testing', 'Performance Testing', 'Security Testing', 'Accessibility Testing', 'Compatibility Testing', 'Regression Testing', 'Visual Regression Testing', 'Exploratory Testing', 'Usability Testing'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎮 Interactive Testing Demos
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Explore different types of software testing with live examples
          </p>
          <Button
            onClick={() => window.history.back()}
            className="bg-gray-600 hover:bg-gray-700"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Demo Categories */}
        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              {category}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoItems
                .filter(demo => demo.category === category)
                .map(demo => (
                  <Card key={demo.id} className="hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="text-3xl">{demo.icon}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {demo.title}
                          </h3>
                          <p className="text-gray-600">{demo.description}</p>
                        </div>
                      </div>

                      {/* Code Example */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Code Example:</h4>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{demo.code}</code>
                        </pre>
                      </div>

                      {/* Run Button */}
                      <Button
                        onClick={() => runDemo(demo)}
                        loading={isRunning && selectedDemo?.id === demo.id}
                        className="w-full mb-4"
                      >
                        🚀 Run {demo.title}
                      </Button>

                      {/* Results */}
                      {selectedDemo?.id === demo.id && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Results:</h4>
                          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
                            {runResults.map((result, index) => (
                              <div key={index} className="mb-1">
                                {result}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Steps:</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-700">
                          {demo.steps.map((step, index) => (
                            <li key={index} className="text-sm">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
