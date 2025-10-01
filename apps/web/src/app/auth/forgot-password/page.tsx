'use client';

import { useState } from 'react';

const GENERIC_ERROR_MESSAGE = 'Не удалось отправить письмо. Попробуйте позднее.';
const GENERIC_SUCCESS_MESSAGE = 'Если этот email зарегистрирован, мы отправили инструкцию по восстановлению пароля.';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message?: string };

      if (response.ok) {
        setMessage(data.message ?? GENERIC_SUCCESS_MESSAGE);
      } else {
        setError(data.message ?? GENERIC_ERROR_MESSAGE);
      }
    } catch (caughtError) {
      const fallback = caughtError instanceof Error ? caughtError.message : GENERIC_ERROR_MESSAGE;
      setError(fallback);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[2fr,420px] lg:items-center">
          <div className="relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 lg:flex">
            <div className="absolute inset-0 opacity-90" />
            <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
              <div>
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  Команда ConsciousFunnels
                </span>
                <h1 className="mt-8 text-4xl font-semibold leading-snug">
                  Восстанавливаем доступ за минуты
                </h1>
                <p className="mt-5 text-base text-orange-50/90">
                  Если пароль потерялся — не страшно. Мы быстро вернём доступ, чтобы вы продолжили строить осознанные воронки и получать AI-инсайты.
                </p>
              </div>

              <dl className="grid gap-4 text-sm text-orange-50/90">
                <div className="flex items-start space-x-3">
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🌱</span>
                  <div>
                    <dt className="font-medium">Сохраняем прогресс</dt>
                    <dd>Восстановите доступ и продолжите с того шага, где остановились.</dd>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">⚡</span>
                  <div>
                    <dt className="font-medium">Письмо за пару минут</dt>
                    <dd>Инструкции приходят мгновенно, чтобы команда не теряла темп.</dd>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-lg">🛡️</span>
                  <div>
                    <dt className="font-medium">Поддержка 24/7</dt>
                    <dd>Не пришло письмо? Поможем вручную и проверим настройки безопасности.</dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl sm:p-10">
              <div className="mb-8 text-center lg:hidden">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-2xl text-white">
                  🔐
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                  Восстановление доступа
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Укажите email — вышлем ссылку на сброс пароля, чтобы вы могли снова войти.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Отправляем письмо…' : 'Получить инструкцию'}
                </button>

                <div className="text-center lg:text-left text-sm text-gray-600">
                  Вспомнили пароль?{' '}
                  <a href="/login" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
                    Вернуться к входу
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}