'use client';

export default function Playbooks() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e293b' }}>
        📚 Sales Playbooks
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }}>
        Готовые сценарии продаж и воронки для вашего бизнеса
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

        {/* Product Launch Playbook */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Product Launch Formula</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Проверенная воронка запуска продукта от Jeff Walker
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Pre-launch content</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Seed Launch</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Open Cart sequence</div>
            <div style={{ fontSize: '0.9rem' }}>✅ Scarcity & urgency tactics</div>
          </div>
          <button style={{
            background: 'white',
            color: '#667eea',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}>
            Использовать Playbook
          </button>
        </div>

        {/* Webinar Funnel */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎥</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Perfect Webinar</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Структура вебинара Russell Brunson для высоких продаж
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Origin Story</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ 3 Secrets framework</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Stack slide</div>
            <div style={{ fontSize: '0.9rem' }}>✅ Close with urgency</div>
          </div>
          <button style={{
            background: 'white',
            color: '#f5576c',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}>
            Использовать Playbook
          </button>
        </div>

        {/* Value Ladder */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Value Ladder</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Последовательность предложений от бесплатного до премиум
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Lead magnet (Free)</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Tripwire ($7-27)</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Core offer ($97-297)</div>
            <div style={{ fontSize: '0.9rem' }}>✅ Premium ($997+)</div>
          </div>
          <button style={{
            background: 'white',
            color: '#4facfe',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}>
            Использовать Playbook
          </button>
        </div>

        {/* High Ticket */}
        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💎</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>High Ticket Closer</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Воронка для продажи дорогих программ ($5k-50k)
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Application funnel</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Strategy session</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Enrollment call script</div>
            <div style={{ fontSize: '0.9rem' }}>✅ Follow-up sequence</div>
          </div>
          <button style={{
            background: 'white',
            color: '#fa709a',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}>
            Использовать Playbook
          </button>
        </div>

        {/* E-commerce Funnel */}
        <div style={{
          background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>E-commerce Boost</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            Максимизация прибыли с каждого посетителя магазина
          </p>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Upsell sequence</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Cart abandonment</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ One-time offers</div>
            <div style={{ fontSize: '0.9rem' }}>✅ Subscription upgrade</div>
          </div>
          <button style={{
            background: 'white',
            color: '#30cfd0',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}>
            Использовать Playbook
          </button>
        </div>

        {/* SaaS Onboarding */}
        <div style={{
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
          padding: '2rem',
          borderRadius: '16px',
          color: '#1e293b'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>SaaS Onboarding</h3>
          <p style={{ marginBottom: '1.5rem', color: '#475569' }}>
            Превращение trial пользователей в платящих клиентов
          </p>
          <div style={{ background: 'rgba(30,41,59,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Welcome email sequence</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Feature activation</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>✅ Upgrade triggers</div>
            <div style={{ fontSize: '0.9rem' }}>✅ Churn prevention</div>
          </div>
          <button style={{
            background: '#1e293b',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            width: '100%'
          }}>
            Использовать Playbook
          </button>
        </div>

      </div>

      {/* CTA Section */}
      <div style={{
        marginTop: '4rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '3rem 2rem',
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Нужен кастомный Playbook?</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', opacity: 0.9 }}>
          Мы создадим индивидуальную воронку под ваш бизнес
        </p>
        <button style={{
          background: 'white',
          color: '#667eea',
          padding: '1rem 2rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}>
          Заказать консультацию
        </button>
      </div>
    </div>
  );
}
