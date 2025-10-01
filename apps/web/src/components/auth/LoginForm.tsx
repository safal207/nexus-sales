'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { FormError } from '../ui/FormError';
import { useToast } from '../ui/Toast';

type SocialProvider = 'google' | 'facebook';

type SocialIconConfig = {
  alt: string;
  src: string;
  width: number;
  height: number;
};

const SOCIAL_ICONS: Record<SocialProvider, SocialIconConfig> = {
  google: { src: '/google.svg', alt: 'Google', width: 20, height: 20 },
  facebook: { src: '/facebook.svg', alt: 'Facebook', width: 20, height: 20 },
};

const PLACEHOLDER_PASSWORD = '••••••••';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Укажите email.');
      showToast('error', 'Укажите email.');
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Введите пароль.');
      showToast('error', 'Введите пароль.');
      setLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setErrorMessage('Аккаунт не найден или неверные данные.');
        showToast('error', 'Аккаунт не найден или неверные данные.');
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      showToast('success', 'Вход выполнен успешно!');
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось выполнить вход. Попробуйте позже.';
      setErrorMessage(message);
      showToast('error', message);
    } finally {
      setLoading(false);
    }
  };

  const renderSocialButton = (provider: SocialProvider, label: string) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      className="flex items-center justify-center space-x-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
    >
      <Image {...SOCIAL_ICONS[provider]} />
      <span>{label}</span>
    </motion.button>
  );

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
            className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 lg:flex"
          >
            <div className="absolute inset-0 opacity-90" />
            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
              <div>
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  ConsciousFunnels · AI CRM
                </span>
                <h1 className="mt-8 text-4xl font-semibold leading-snug">
                  Эмпатичный AI помогает закрывать сделки быстрее
                </h1>
                <p className="mt-5 text-base text-indigo-100/90">
                  От отслеживания эмоций до автоматизации follow-up — мы создаём воронки, которые резонируют с клиентами.
                </p>
              </div>

              <dl className="grid gap-4 text-sm text-indigo-50/90">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start space-x-3"
                >
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🔍</span>
                  <div>
                    <dt className="font-medium">Прозрачная аналитика эмоций</dt>
                    <dd>Понимайте, какие эмоции ведут к конверсии на каждом шаге.</dd>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-start space-x-3"
                >
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">⚡</span>
                  <div>
                    <dt className="font-medium">AI follow-up</dt>
                    <dd>Автоматические подсказки и письма, чтобы ни один лид не «остыл».</dd>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-start space-x-3"
                >
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🧠</span>
                  <div>
                    <dt className="font-medium">Осознанный подход</dt>
                    <dd>Рекомендации по тону общения для каждого сегмента клиентов.</dd>
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
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-2xl text-white">
                  🔐
                </div>
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-2xl font-semibold text-gray-900"
                >
                  Добро пожаловать!
                </motion.h2>
                <p className="mt-2 text-sm text-gray-600">
                  Войдите, чтобы увидеть персонализированную панель осознанных продаж.
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
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-lg border border-gray-300 py-3 px-3 placeholder-gray-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
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
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="block w-full rounded-lg border border-gray-300 py-3 pl-3 pr-12 placeholder-gray-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={PLACEHOLDER_PASSWORD}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-600"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M3 3l6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <FormError message={errorMessage && !password.trim() ? 'Введите пароль.' : undefined} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center justify-between text-sm"
                >
                  <label className="flex items-center space-x-2">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">Запомнить меня</span>
                  </label>
                  <a href="/auth/forgot-password" className="font-medium text-indigo-600 transition-colors hover:text-indigo-500">
                    Забыли пароль?
                  </a>
                </motion.div>

                <FormError message={errorMessage} />

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full" 
                  loading={loading}
                  disabled={loading}
                >
                  Войти
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">Или войдите с помощью</span>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {renderSocialButton('google', 'Google')}
                  {renderSocialButton('facebook', 'Facebook')}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <p className="text-sm text-gray-600">
                    Нет аккаунта?{' '}
                    <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                      Зарегистрироваться бесплатно
                    </a>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};