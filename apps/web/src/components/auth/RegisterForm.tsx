'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { FormError } from '../ui/FormError';
import { useToast } from '../ui/Toast';

const MIN_PASSWORD_LENGTH = 8;
const PLACEHOLDER_PASSWORD = 'Введите не менее 8 символов';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { register } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(Math.min(strength, 4));
  }, [password]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают.');
      showToast('error', 'Пароли не совпадают.');
      setLoading(false);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage('Пароль должен содержать минимум 8 символов.');
      showToast('error', 'Пароль должен содержать минимум 8 символов.');
      setLoading(false);
      return;
    }

    try {
      const success = await register(email, password);
      if (!success) {
        setErrorMessage('Пользователь с таким e-mail уже существует.');
        showToast('error', 'Пользователь с таким e-mail уже существует.');
        return;
      }
      
      showToast('success', 'Регистрация прошла успешно!');
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать аккаунт. Попробуйте позже.';
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[2fr,420px] lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 via-blue-500 to-indigo-600 lg:flex"
          >
            <div className="absolute inset-0 opacity-90" />
            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
              <div>
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  ConsciousFunnels · Growth AI
                </span>
                <h1 className="mt-8 text-4xl font-semibold leading-snug">
                  Постройте осознанную воронку с поддержкой AI
                </h1>
                <p className="mt-5 text-base text-green-50/90">
                  Шаблоны, аналитика эмоций и сценарии follow-up — всё, чтобы ваши коммуникации были точными и человечными.
                </p>
              </div>

              <dl className="grid gap-4 text-sm text-green-50/90">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start space-x-3"
                >
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🧭</span>
                  <div>
                    <dt className="font-medium">Прозрачная аналитика</dt>
                    <dd>Видите, какая эмоциональная динамика ведёт к сделкам.</dd>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start space-x-3"
                >
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">⚙️</span>
                  <div>
                    <dt className="font-medium">Цепочки nurturing</dt>
                    <dd>Автоматические подсказки и письма под эмоции клиента.</dd>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start space-x-3"
                >
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🚀</span>
                  <div>
                    <dt className="font-medium">Быстрый старт</dt>
                    <dd>Бесплатный тариф и готовые сценарии для первых клиентов.</dd>
                  </div>
                </motion.div>
              </dl>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-blue-500 text-2xl text-white">
                  ✨
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-2xl font-semibold text-gray-900"
                >
                  Создайте аккаунт
                </motion.h2>
                <p className="mt-2 text-sm text-gray-600">
                  Подберите email и пароль — и начните собирать осознанные воронки с эмпатичным AI.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-3 placeholder-gray-500 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                  <FormError message={errorMessage && !email.trim() ? 'Укажите email.' : undefined} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                    Пароль
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-3 placeholder-gray-500 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder={PLACEHOLDER_PASSWORD}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Пароль должен содержать минимум {MIN_PASSWORD_LENGTH} символов.</p>

                  {/* Password strength indicator */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Сложность пароля:</span>
                      <span className="text-xs font-medium">
                        {passwordStrength === 0 && 'Очень слабый'}
                        {passwordStrength === 1 && 'Слабый'}
                        {passwordStrength === 2 && 'Средний'}
                        {passwordStrength === 3 && 'Хороший'}
                        {passwordStrength === 4 && 'Очень хороший'}
                      </span>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-1.5 rounded-full ${
                            level <= passwordStrength ? 
                            (passwordStrength < 2 ? 'bg-red-500' : passwordStrength < 3 ? 'bg-yellow-500' : passwordStrength < 4 ? 'bg-blue-500' : 'bg-green-500') : 
                            'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <FormError message={errorMessage && !password.trim() ? 'Введите пароль.' : undefined} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                    Подтверждение пароля
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="block w-full rounded-lg border border-gray-300 py-3 pl-12 pr-3 placeholder-gray-500 transition focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Повторите пароль"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                  <FormError message={errorMessage && !confirmPassword.trim() ? 'Подтвердите пароль.' : undefined} />
                </motion.div>

                <FormError message={errorMessage} />

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full" 
                  loading={loading}
                  disabled={loading}
                >
                  Зарегистрироваться
                </Button>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-center text-sm text-gray-600 lg:text-left"
                >
                  Уже есть аккаунт?{' '}
                  <a href="/login" className="font-medium text-green-600 transition-colors hover:text-green-500">
                    Войти
                  </a>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
