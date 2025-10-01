import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Navigation */}
      <nav style={{ 
        background: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link href="/" style={{ 
            textDecoration: 'none', 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#6366f1' 
          }}>
            🧠 ConsciousFunnels
          </Link>
          
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ 
              textDecoration: 'none', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Dashboard
            </Link>
            <Link href="/funnel" style={{ 
              textDecoration: 'none', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Воронки
            </Link>
            <Link href="/dashboard" style={{ 
              textDecoration: 'none', 
              color: '#64748b',
              fontWeight: '500'
            }}>
              Аналитика
            </Link>
            <Link href="/dashboard" style={{
              textDecoration: 'none',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Продукты
            </Link>
            <Link href="/dashboard" style={{
              textDecoration: 'none',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Настройки
            </Link>
            
            <div style={{ 
              background: '#6366f1', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              🆓 Free Plan
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ 
        background: '#1e293b', 
        color: 'white', 
        padding: '2rem',
        marginTop: '3rem'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center' 
        }}>
          <p style={{ marginBottom: '1rem' }}>
            🧠 <strong>ConsciousFunnels</strong> - Первая sales platform с эмпатичным AI
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
            Made with ❤️ using Next.js, Clojure, and open-source technologies
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
              GitHub
            </a>
            <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
              Документация
            </a>
            <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
              Поддержка
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
