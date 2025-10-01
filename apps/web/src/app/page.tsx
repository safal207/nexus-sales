export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-20 text-center">
        <span className="inline-flex items-center justify-center self-center rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
          ConsciousFunnels · AI CRM
        </span>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
          Осознанные воронки продаж + эмпатичный AI
        </h1>
        <p className="text-lg text-slate-600 sm:text-xl">
          Конструктор воронок, аналитика эмоций клиентов и рекомендации по next best action — всё в одной платформе.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/register"
            className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow hover:bg-indigo-700"
          >
            Зарегистрироваться бесплатно
          </a>
          <a
            href="/login"
            className="rounded-lg border border-indigo-200 px-6 py-3 font-semibold text-indigo-600 hover:border-indigo-300"
          >
            Войти в аккаунт
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-6 pb-24 sm:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-700">AI-инсайты в реальном времени</h2>
          <p className="mt-2 text-sm text-slate-600">
            Анализируем CTA и ответы лидов, чтобы подсказать, какие эмоции вызывает ваш контент и как повысить конверсию.
          </p>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-700">Воронки без кода</h2>
          <p className="mt-2 text-sm text-slate-600">
            Drag & drop редактор, библиотека шагов и адаптивные шаблоны. Запускайте A/B-ветки за минуты.
          </p>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-700">Честная аналитика</h2>
          <p className="mt-2 text-sm text-slate-600">
            Трекинг ключевых событий, эмоций и рекомендаций next best action. Экспортируйте отчёты или подключайте BI.
          </p>
        </section>
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-indigo-700">Готово к росту</h2>
          <p className="mt-2 text-sm text-slate-600">
            Бесплатная разработческая версия, открытый API и интеграции со Stripe, SendGrid и Hugging Face.
          </p>
        </section>
      </main>
    </div>
  );
}