import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Проверка на пустые поля
    if (!login.trim() || !password.trim()) {
      setError('Введите данные для входа');
      setTimeout(() => setError(''), 3000);
      return;
    }
    // credentials
    if (login === 'adminauto67' && password === 'auto67') {
      setShowSuccess(true);
      setTimeout(() => {
        if (onLogin) onLogin();
        navigate('/shifts');
      }, 2000);
    } else {
      setError('Неверный логин или пароль');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: '20px'
    }}>
      <div style={{
        background: '#f5f5f5',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        padding: '50px 40px',
        maxWidth: '500px',
        width: '100%'
      }}>
        <h1 style={{
          textAlign: 'center',
          fontSize: '32px',
          marginBottom: '40px',
          color: '#000'
        }}>
          Введите данные для входа
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000'
            }}>
              Логин
            </label>
            <input
              value={login}
              onChange={e => setLogin(e.target.value)}
              style={{
                padding: '14px 16px',
                width: '100%',
                borderRadius: '10px',
                border: '2px solid var(--border-color)',
                fontSize: '16px',
                color: 'var(--text-color)',
                background: 'var(--bg-color)',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000'
            }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                padding: '14px 16px',
                width: '100%',
                borderRadius: '10px',
                border: '2px solid var(--border-color)',
                fontSize: '16px',
                color: 'var(--text-color)',
                background: 'var(--bg-color)',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                outline: 'none'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '14px 16px',
              background: '#fee',
              border: '2px solid #e25a5a',
              borderRadius: '10px',
              color: '#e25a5a',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '16px 24px',
                background: '#fff',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
              }}
              onMouseOver={e => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
              }}
              onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.2)';
              }}
            >
              Войти
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '16px 24px',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                border: '2px solid var(--border-color)',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={e => {
                e.target.style.background = '#f0f0f0';
                e.target.borderColor = '#999';
              }}
              onMouseOut={e => {
                e.target.style.background = 'var(--bg-color)';
                e.target.style.borderColor = 'var(--border-color)';
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '40px 50px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              color: '#4caf50'
            }}>
              ✓
            </div>
            <h2 style={{
              fontSize: '22px',
              marginBottom: '20px',
              color: '#000',
              margin: '0 0 20px 0'
            }}>
              Выполнен вход в учётную запись администратора
            </h2>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translate(-50%, calc(-50% - 30px));
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
