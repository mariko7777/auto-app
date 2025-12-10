import React, { useEffect, useState } from 'react';
import { getUsers, getShifts, openShift, closeShift } from '../service/api';

export default function ShiftsPage() {
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setUsers(getUsers());
    setShifts(getShifts());
  }, []);

  const refresh = () => { setUsers(getUsers()); setShifts(getShifts()); };

  const handleOpen = async () => {
    if (!selectedOperator) {
      setNotification({ type: 'error', message: 'Выберите оператора' });
      return;
    }
    const res = openShift(selectedOperator);
    if (res.success) {
      setNotification({ type: 'success', message: 'Смена успешно открыта' });
      refresh();
    } else {
      setNotification({ type: 'error', message: res.message || 'Ошибка открытия смены' });
    }
  };

  const handleClose = async () => {
    if (!selectedOperator) {
      setNotification({ type: 'error', message: 'Выберите оператора' });
      return;
    }
    const res = closeShift(selectedOperator);
    if (res.success) {
      setNotification({ type: 'success', message: 'Смена успешно закрыта' });
      refresh();
    } else {
      setNotification({ type: 'error', message: res.message || 'Ошибка закрытия смены' });
    }
  };

  // auto-hide notifications
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--text-color)' }}>Управление сменами</h1>
      
      {notification && (
        <div style={{ marginBottom: '16px', padding: '14px 16px', borderRadius: '10px', background: notification.type === 'success' ? '#e8f5e9' : '#fff3e0', border: '1px solid', borderColor: notification.type === 'success' ? '#81c784' : '#ffb74d', animation: 'slideDown 0.3s ease-out' }}>
          <strong style={{ color: notification.type === 'success' ? '#2e7d32' : '#e65100', fontSize: '14px' }}>{notification.message}</strong>
        </div>
      )}
      
      <div style={{ 
        background: 'var(--card-bg)', 
        padding: '24px', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: '280px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-color)', marginBottom: '8px' }}>Выберите оператора</label>
            <select 
              value={selectedOperator} 
              onChange={e=>setSelectedOperator(e.target.value)} 
              style={{ 
                padding: '12px 14px', 
                borderRadius: '10px', 
                border: '2px solid var(--border-color)', 
                fontSize: '15px', 
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                fontWeight: '500',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#667eea'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            >
              <option value="">-- выбрать оператора --</option>
              {users.filter(u=>u.role==='operator').map(u=> <option key={u.id} value={u.id}>{u.name} {u.phone ? `(${u.phone})` : ''}</option>)}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleOpen}
              style={{ 
                padding: '12px 24px', 
                borderRadius: '10px', 
                background: '#4caf50', 
                color: '#fff', 
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.25)'
              }}
              onMouseOver={e => Object.assign(e.target.style, { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(76, 175, 80, 0.35)' })}
              onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '0 2px 8px rgba(76, 175, 80, 0.25)' })}
            >
              Открыть смену
            </button>
            <button 
              onClick={handleClose}
              style={{ 
                padding: '12px 24px', 
                borderRadius: '10px', 
                background: '#ef5350', 
                color: '#fff', 
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(239, 83, 80, 0.25)'
              }}
              onMouseOver={e => Object.assign(e.target.style, { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(239, 83, 80, 0.35)' })}
              onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '0 2px 8px rgba(239, 83, 80, 0.25)' })}
            >
              Закрыть смену
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-color)' }}>Активные смены</h3>
        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {shifts.filter(s=>!s.closedAt).length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            Нет открытых смен
          </div>
        ) : (
          shifts.filter(s=>!s.closedAt).map(s=> {
            const op = users.find(u => u.id === s.operatorId);
            return (
            <div key={s.id} style={{ 
              padding: '16px', 
              borderRadius: '10px', 
              background: 'var(--card-bg)', 
              border: '2px solid #4caf50',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => Object.assign(e.target.style, { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(76, 175, 80, 0.2)' })}
            onMouseOut={e => Object.assign(e.target.style, { transform: '', boxShadow: '0 2px 8px rgba(76, 175, 80, 0.1)' })}
            >
              <div>
                <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-color)' }}>{op ? op.name : s.operatorId}</div>
                <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>Открыта: {new Date(s.openedAt).toLocaleString()}</div>
              </div>
              <div style={{ background: '#4caf50', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Активна</div>
            </div>
            )
          })
        )}
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', marginTop: '24px', color: 'var(--text-color)' }}>Архив смен</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
        {shifts.filter(s=>s.closedAt).length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)', background: 'var(--card-bg)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            Архив пуст
          </div>
        ) : (
          shifts.filter(s=>s.closedAt).map(s=> {
            const op = users.find(u => u.id === s.operatorId);
            return (
            <div key={s.id} style={{ 
              padding: '16px', 
              borderRadius: '10px', 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)',
              opacity: 0.8,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => Object.assign(e.target.style, { opacity: '1', transform: 'translateY(-2px)', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' })}
            onMouseOut={e => Object.assign(e.target.style, { opacity: '0.8', transform: '', boxShadow: '0 0 0 transparent' })}
            >
              <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-color)' }}>{op ? op.name : s.operatorId}</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>Открыта: {new Date(s.openedAt).toLocaleString()}</div>
              <div style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '2px' }}>Закрыта: {new Date(s.closedAt).toLocaleString()}</div>
            </div>
            )
          })
        )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
