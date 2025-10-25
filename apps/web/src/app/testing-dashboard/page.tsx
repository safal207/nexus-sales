'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Localization constants
const uiLabels = {
  testingDashboard: {
    title: 'Testing Dashboard',
    testResults: 'Test Results',
    lastRun: 'Last Run',
    passed: 'passed',
    runSmokeTests: 'Run Smoke Tests',
    backToDashboard: 'Back to Dashboard',
    overallCoverage: 'Overall Coverage',
    totalTests: 'Total Tests',
    successRate: 'Success Rate',
    failedTests: 'Failed Tests'
  },
  testTypes: {
    unit: 'Unit Testing',
    integration: 'Integration Testing',
    system: 'System Testing (E2E)',
    performance: 'Performance Testing',
    security: 'Security Testing',
    accessibility: 'Accessibility Testing',
    compatibility: 'Compatibility Testing',
    regression: 'Regression Testing'
  },
  status: {
    success: 'Good',
    warning: 'Needs Attention',
    error: 'Issues'
  },
  labels: {
    coverage: 'Coverage',
    tests: 'Tests',
    passed: 'Passed'
  }
};

// Mapping for URL generation
const typeUrlMapping: { [key: string]: string } = {
  'Unit Testing': 'unit-testing',
  'Integration Testing': 'integration-testing',
  'System Testing (E2E)': 'system-testing',
  'Performance Testing': 'performance-testing',
  'Security Testing': 'security-testing',
  'Accessibility Testing': 'accessibility-testing',
  'Compatibility Testing': 'compatibility-testing',
  'Regression Testing': 'regression-testing',
  'Visual Regression Testing': 'visual-regression-testing',
  'Exploratory Testing': 'exploratory-testing',
  'Usability Testing': 'usability-testing'
};

interface TestMetric {
  name: string;
  value: number;
  status: 'success' | 'warning' | 'error';
  trend: 'up' | 'down' | 'stable';
}

interface TestResult {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'running';
  duration: number;
  timestamp: string;
}

export default function TestingDashboard() {
  const [metrics, setMetrics] = useState<TestMetric[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testingTypes, setTestingTypes] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [lastTestRun, setLastTestRun] = useState<any>(null);

  const getColorForType = (typeName: string) => {
    const colors: { [key: string]: string } = {
      'Unit Testing': 'bg-blue-50 border-blue-200',
      'Integration Testing': 'bg-green-50 border-green-200',
      'System Testing (E2E)': 'bg-yellow-50 border-yellow-200',
      'Performance Testing': 'bg-purple-50 border-purple-200',
      'Security Testing': 'bg-red-50 border-red-200',
      'Accessibility Testing': 'bg-indigo-50 border-indigo-200',
      'Compatibility Testing': 'bg-teal-50 border-teal-200',
      'Regression Testing': 'bg-orange-50 border-orange-200',
      'Visual Regression Testing': 'bg-pink-50 border-pink-200',
      'Exploratory Testing': 'bg-cyan-50 border-cyan-200',
      'Usability Testing': 'bg-emerald-50 border-emerald-200'
    };
    return colors[typeName] || 'bg-gray-50 border-gray-200';
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/testing/metrics');
      const data = await response.json();

      if (data.success) {
        const metricsData = data.data;

        // Update overall metrics
        const overallMetrics: TestMetric[] = [
          {
            name: uiLabels.testingDashboard.overallCoverage,
            value: metricsData.overall.coverage,
            status: metricsData.overall.status,
            trend: 'up' as const
          },
          {
            name: uiLabels.testingDashboard.totalTests,
            value: metricsData.overall.totalTests,
            status: 'success' as const,
            trend: 'stable' as const
          },
          {
            name: uiLabels.testingDashboard.successRate,
            value: (metricsData.overall.passedTests / metricsData.overall.totalTests * 100),
            status: 'success' as const,
            trend: 'stable' as const
          },
          {
            name: uiLabels.testingDashboard.failedTests,
            value: metricsData.overall.failedTests,
            status: metricsData.overall.failedTests > 0 ? 'warning' as const : 'success' as const,
            trend: 'down' as const
          },
        ];
        setMetrics(overallMetrics);

        // Update test results for each type
        const testResults: TestResult[] = Object.values(metricsData.testingTypes).map((type: any) => ({
          id: type.name.toLowerCase().replace(/\s+/g, '-'),
          name: type.name,
          status: type.failed > 0 ? 'failed' as const : 'passed' as const,
          duration: Math.floor(Math.random() * 100) + 10, // Mock duration
          timestamp: new Date().toISOString()
        }));
        setTestResults(testResults);

        // Update testing types for the grid
        const typesArray = Object.values(metricsData.testingTypes).map((type: any) => ({
          ...type,
          color: getColorForType(type.name)
        }));
        setTestingTypes(typesArray);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const runSmokeTests = async () => {
    setIsRunningTests(true);
    try {
      const response = await fetch('/api/testing/run-smoke', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setLastTestRun(data.data);
        // Update test results with real data
        const newResults: TestResult[] = data.data.tests.map((test: any, index: number) => ({
          id: `smoke-${index}`,
          name: test.name,
          status: test.status === 'passed' ? 'passed' as const : 'failed' as const,
          duration: test.duration,
          timestamp: new Date().toISOString()
        }));
        setTestResults(prev => [...prev.slice(0, -1), ...newResults]); // Replace last item with new results
      }
    } catch (error) {
      console.error('Error running smoke tests:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const runDemoTest = async (testType: string) => {
    setActiveDemo(testType);
    // Simulate demo test execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setActiveDemo(null);
  };

  return (
    <div className="relative z-10 min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 QA Testing Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Интерактивный демонстрация нашей системы тестирования
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={runSmokeTests}
              loading={isRunningTests}
              className="bg-green-600 hover:bg-green-700"
            >
              🚀 {uiLabels.testingDashboard.runSmokeTests}
            </Button>
            <Button
              onClick={() => window.open('/testing-dashboard/demo', '_blank')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              🎮 Interactive Demos
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/TESTING_README.md', '_blank')}
            >
              📖 Документация
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                  <p className={`text-3xl font-bold ${
                    metric.status === 'success' ? 'text-green-600' :
                    metric.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.value}{metric.name.includes('Score') || metric.name.includes('Rate') ? '%' : ''}
                  </p>
                </div>
                <div className={`text-2xl ${
                  metric.trend === 'up' ? 'text-green-500' :
                  metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️'}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Testing Types Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {testingTypes.map((testType) => (
            <div
              key={testType.name}
              className={`${testType.color} border-2 cursor-pointer hover:shadow-lg transition-shadow rounded-lg p-6`}
              onClick={() => window.location.href = `/testing-dashboard/${typeUrlMapping[testType.name] || testType.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testType.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{testType.name}</h3>
                    <p className="text-sm text-gray-600">{testType.description}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  testType.status === 'success' ? 'bg-green-100 text-green-800' :
                  testType.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {testType.status === 'success' ? `✅ ${testType.labels?.status?.success || 'Good'}` :
                   testType.status === 'warning' ? `⚠️ ${testType.labels?.status?.warning || 'Needs Attention'}` :
                   `❌ ${testType.labels?.status?.error || 'Issues'}`}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{testType.labels?.coverage || 'Coverage'}:</span>
                  <span className="font-semibold">{testType.coverage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{testType.labels?.tests || 'Tests'}:</span>
                  <span className="font-semibold">{testType.tests}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{testType.labels?.passed || 'Passed'}:</span>
                  <span className={`font-semibold ${
                    testType.passed === testType.tests ? 'text-green-600' :
                    'text-yellow-600'
                  }`}>
                    {testType.passed}/{testType.tests}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Test Results */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">📊 {uiLabels.testingDashboard.testResults}</h2>
            {lastTestRun && (
              <div className="text-right">
                <p className="text-sm text-gray-600">{uiLabels.testingDashboard.lastRun}</p>
                <p className="font-semibold text-gray-900">
                  {lastTestRun.summary.passed}/{lastTestRun.summary.total} {uiLabels.testingDashboard.passed}
                </p>
              </div>
            )}
          </div>

          {lastTestRun && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Results of Last Smoke Tests Run</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total:</span>
                  <span className="font-semibold ml-1">{lastTestRun.summary.total}</span>
                </div>
                <div>
                  <span className="text-green-700">Passed:</span>
                  <span className="font-semibold ml-1 text-green-700">{lastTestRun.summary.passed}</span>
                </div>
                <div>
                  <span className="text-red-700">Failed:</span>
                  <span className="font-semibold ml-1 text-red-700">{lastTestRun.summary.failed}</span>
                </div>
                <div>
                  <span className="text-gray-700">Time:</span>
                  <span className="font-semibold ml-1">{lastTestRun.summary.duration} сек</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {lastTestRun ? lastTestRun.tests.map((result: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    result.status === 'passed' ? 'bg-green-500' :
                    result.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                  }`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{result.name}</h3>
                    <p className="text-sm text-gray-600">{result.message}</p>
                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{result.duration} сек</p>
                  <p className={`text-sm ${
                    result.status === 'passed' ? 'text-green-600' :
                    result.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {result.status === 'passed' ? '✅ Пройден' :
                     result.status === 'failed' ? '❌ Провален' : '⏳ Выполняется'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <p>Запустите Smoke Tests, чтобы увидеть результаты</p>
              </div>
            )}
          </div>
        </Card>

        {/* Interactive Demos */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎮 Интерактивные демо</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Unit Testing', icon: '🧩', description: 'Тестирование отдельных функций' },
              { name: 'E2E Testing', icon: '🌐', description: 'Сквозное тестирование пользовательских сценариев' },
              { name: 'Load Testing', icon: '⚡', description: 'Тестирование производительности под нагрузкой' },
              { name: 'Security Testing', icon: '🔒', description: 'Проверка безопасности приложения' },
              { name: 'Accessibility Testing', icon: '♿', description: 'Тестирование доступности' },
              { name: 'Visual Regression', icon: '👁️', description: 'Проверка визуальной целостности' },
            ].map((demo) => (
              <div key={demo.name} className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-4">{demo.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{demo.name}</h3>
                <p className="text-gray-600 mb-4">{demo.description}</p>
                <Button
                  onClick={() => runDemoTest(demo.name)}
                  loading={activeDemo === demo.name}
                  className="w-full"
                >
                  {activeDemo === demo.name ? 'Выполняется...' : 'Запустить демо'}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Bug Fixes Showcase */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🐛 Исправленные баги</h2>
          <div className="space-y-6">
            {[
              {
                title: 'CSS классы не применялись в Card компоненте',
                description: 'Tailwind CSS не обрабатывался в Jest тестах',
                solution: 'Настроили jest-transform-css с PostCSS и Tailwind',
                impact: 'Высокий',
                status: 'Исправлено'
              },
              {
                title: 'Contract тесты имели логические ошибки',
                description: 'Неправильная валидация диапазонов цен и имен',
                solution: 'Исправили условия валидации и добавили корректные проверки',
                impact: 'Средний',
                status: 'Исправлено'
              },
              {
                title: 'Load testing работал на неправильном порту',
                description: 'Artillery пытался подключиться к порту 3000 вместо 3010',
                solution: 'Обновили все конфигурации на правильный порт приложения',
                impact: 'Высокий',
                status: 'Исправлено'
              }
            ].map((bug, index) => (
              <div key={index} className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-900">{bug.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bug.status === 'Исправлено' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bug.status}
                  </span>
                </div>
                <p className="text-red-700 mb-3"><strong>Проблема:</strong> {bug.description}</p>
                <p className="text-green-700 mb-3"><strong>Решение:</strong> {bug.solution}</p>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bug.impact === 'Высокий' ? 'bg-red-100 text-red-800' :
                    bug.impact === 'Средний' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    Влияние: {bug.impact}
                  </span>
                  <Button variant="outline" size="sm">
                    Подробнее
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Testing Pyramid */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏗️ Пирамида тестирования</h2>
          <div className="space-y-4">
            {[
              { level: 'Exploratory Testing', percentage: 5, color: 'bg-purple-500', description: 'Ручное исследование' },
              { level: 'Acceptance Testing', percentage: 10, color: 'bg-blue-500', description: 'BDD сценарии' },
              { level: 'Integration Testing', percentage: 20, color: 'bg-green-500', description: 'Взаимодействие компонентов' },
              { level: 'System Testing', percentage: 25, color: 'bg-yellow-500', description: 'E2E тестирование' },
              { level: 'Unit Testing', percentage: 40, color: 'bg-indigo-500', description: 'Тестирование функций' },
            ].reverse().map((level, index) => (
              <div key={level.level} className="flex items-center space-x-4">
                <div className="w-32 text-sm font-medium text-gray-700">{level.level}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className={`${level.color} h-4 rounded-full transition-all duration-1000`}
                    style={{ width: `${level.percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">{level.percentage}%</div>
                <div className="w-48 text-sm text-gray-600">{level.description}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
