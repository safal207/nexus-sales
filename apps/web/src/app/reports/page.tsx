'use client';

export default function Reports() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e293b' }}>
        📊 Analytics & Reports
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem' }}>
        Комплексная аналитика ваших воронок продаж и кампаний
      </p>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Общая выручка</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>€127,450</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>+23% за месяц</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '2rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Конверсия</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>18.4%</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>+5.2% за неделю</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '2rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Посетители</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>12,834</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>+890 за сегодня</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', padding: '2rem', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>AOV (средний чек)</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>€347</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>+€42 за месяц</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

        {/* Revenue Chart */}
        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.3rem' }}>📈 Динамика выручки</h3>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ color: '#64748b', marginBottom: '2rem' }}>График выручки за последние 30 дней</div>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '150px' }}>
              {[40, 65, 45, 80, 70, 90, 100].map((height, i) => (
                <div key={i} style={{
                  width: '40px',
                  height: `${height}%`,
                  background: 'linear-gradient(to top, #667eea, #764ba2)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s'
                }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
              <span>Пн</span><span>Вт</span><span>Ср</span><span>Чт</span><span>Пт</span><span>Сб</span><span>Вс</span>
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.3rem' }}>🎯 Воронка продаж</h3>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px' }}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#1e293b', fontWeight: 'bold' }}>Посетители</span>
                <span style={{ color: '#667eea', fontWeight: 'bold' }}>12,834</span>
              </div>
              <div style={{ background: '#e0e7ff', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ background: '#667eea', width: '100%', height: '100%' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#1e293b', fontWeight: 'bold' }}>Добавили в корзину</span>
                <span style={{ color: '#f093fb', fontWeight: 'bold' }}>4,523 (35%)</span>
              </div>
              <div style={{ background: '#fce7f3', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ background: '#f093fb', width: '35%', height: '100%' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#1e293b', fontWeight: 'bold' }}>Начали оформление</span>
                <span style={{ color: '#4facfe', fontWeight: 'bold' }}>2,845 (22%)</span>
              </div>
              <div style={{ background: '#e0f2fe', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ background: '#4facfe', width: '22%', height: '100%' }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#1e293b', fontWeight: 'bold' }}>Завершили покупку</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>2,361 (18%)</span>
              </div>
              <div style={{ background: '#d1fae5', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ background: '#10b981', width: '18%', height: '100%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Top Products */}
      <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
        <h3 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1.3rem' }}>🏆 Топ продукты</h3>
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b', fontWeight: '600' }}>Продукт</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Продажи</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Выручка</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Конверсия</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 'bold' }}>💎 Premium Package</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>847</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>€84,700</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>24.3%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 'bold' }}>⚡ Starter Plan</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>1,234</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>€24,680</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>31.2%</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 'bold' }}>🎯 Consulting Session</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>156</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>€15,600</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>12.8%</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', color: '#1e293b', fontWeight: 'bold' }}>📚 Course Bundle</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>423</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>€12,690</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>19.5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Options */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button style={{
          background: '#10b981',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📥 Экспорт в Excel
        </button>
        <button style={{
          background: '#ef4444',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📄 Экспорт в PDF
        </button>
        <button style={{
          background: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📧 Отправить по Email
        </button>
        <button style={{
          background: 'transparent',
          color: '#64748b',
          padding: '0.75rem 1.5rem',
          border: '2px solid #cbd5e1',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚙️ Настроить отчеты
        </button>
      </div>
    </div>
  );
}
