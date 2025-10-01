// 2025-09-29 - Claude Code Agent: Made this a Client Component to support event handlers
'use client';

export default function Dashboard() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: '#1e293b' }}>
        🎯 ConsciousFunnels Dashboard
      </h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Funnel Builder */}
        <div style={{ 
          background: '#f8fafc', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>🎨 Funnel Builder</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Создавайте воронки продаж с помощью drag & drop конструктора
          </p>
          <a href="/funnel" style={{
            display: 'inline-block',
            background: '#6366f1',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }} onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#5b5ce6'} onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#6366f1'}>
            Создать воронку
          </a>
        </div>

        {/* Emotional Analytics */}
        <div style={{ 
          background: '#f0f9ff', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid #bae6fd'
        }}>
          <h3 style={{ color: '#0c4a6e', marginBottom: '1rem' }}>🧠 Emotional Analytics</h3>
          <p style={{ color: '#0369a1', marginBottom: '1.5rem' }}>
            AI анализ эмоций посетителей с Neo4j + Datomic
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', flex: '1', minWidth: '100px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1' }}>1,234</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Посетителей</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', flex: '1', minWidth: '100px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1' }}>23.4%</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Конверсия</div>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', flex: '1', minWidth: '100px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0369a1' }}>89.2%</div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>AI Точность</div>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button style={{
              background: '#0369a1',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              🎯 Просмотреть эмоциональную аналитику
            </button>
          </div>
        </div>

        {/* AI Assistant */}
        <div style={{ 
          background: '#fef3c7', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid #fde68a'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '1rem' }}>🤖 AI Assistant</h3>
          <p style={{ color: '#b45309', marginBottom: '1.5rem' }}>
            Эмпатичный AI поможет оптимизировать ваши воронки
          </p>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ color: '#92400e', fontSize: '0.9rem' }}>
              💡 <strong>Совет:</strong> Ваши посетители испытывают тревогу на странице оплаты. 
              Добавьте больше социальных доказательств.
            </div>
          </div>
          <button style={{
            background: '#f59e0b',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Оптимизировать
          </button>
        </div>

        {/* Products */}
        <div style={{ 
          background: '#ecfdf5', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid #bbf7d0'
        }}>
          <h3 style={{ color: '#065f46', marginBottom: '1rem' }}>🛍️ Продукты</h3>
          <p style={{ color: '#047857', marginBottom: '1.5rem' }}>
            Управляйте своими продуктами и подписками
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{
              background: '#10b981',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Добавить продукт
            </button>
            <button style={{
              background: 'transparent',
              color: '#10b981',
              padding: '0.75rem 1.5rem',
              border: '2px solid #10b981',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}>
              Просмотреть все
            </button>
          </div>
        </div>

        {/* Email Automation */}
        <div style={{ 
          background: '#fdf2f8', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid #fbcfe8'
        }}>
          <h3 style={{ color: '#be185d', marginBottom: '1rem' }}>📧 Email Automation</h3>
          <p style={{ color: '#a21caf', marginBottom: '1.5rem' }}>
            Автоматизируйте email-последовательности на основе эмоций
          </p>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <div style={{ color: '#be185d', fontSize: '0.9rem' }}>
              🎯 <strong>Активные кампании:</strong> 3<br/>
              📬 <strong>Отправлено сегодня:</strong> 47 писем
            </div>
          </div>
          <button style={{
            background: '#ec4899',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            Создать кампанию
          </button>
        </div>

        {/* Settings */}
        <div style={{ 
          background: '#f1f5f9', 
          padding: '2rem', 
          borderRadius: '12px',
          border: '1px solid #cbd5e1'
        }}>
          <h3 style={{ color: '#334155', marginBottom: '1rem' }}>⚙️ Настройки</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            Настройте интеграции и параметры платформы
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button style={{
              background: '#64748b',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}>
              🔗 Интеграции (Stripe, SendGrid)
            </button>
            <button style={{
              background: '#64748b',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}>
              🎨 Темы и брендинг
            </button>
            <button style={{
              background: '#64748b',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}>
              📊 API ключи
            </button>
          </div>
        </div>

      </div>

      {/* Free Plan Notice */}
      <div style={{ 
        marginTop: '3rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>🆓 Вы используете БЕСПЛАТНЫЙ план</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
          Все функции доступны бесплатно! Никаких ограничений, никаких скрытых платежей.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
            ✅ 10 воронок
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
            ✅ 1000 посетителей/месяц
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
            ✅ AI аналитика
          </span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>
            ✅ Email automation
          </span>
        </div>
      </div>
    </div>
  );
}