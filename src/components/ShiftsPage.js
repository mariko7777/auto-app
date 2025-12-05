import React, { useEffect, useState } from 'react';
import { getUsers, getShifts, openShift, closeShift } from '../service/api';

export default function ShiftsPage() {
  const [users, setUsers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');

  useEffect(() => {
    setUsers(getUsers());
    setShifts(getShifts());
  }, []);

  const refresh = () => { setUsers(getUsers()); setShifts(getShifts()); };

  const handleOpen = async () => {
    if (!selectedOperator) return alert('Выберите оператора');
    const res = openShift(selectedOperator);
    if (res.success) {
      alert('Смена открыта');
      refresh();
    } else alert(res.message || 'Ошибка открытия смены');
  };

  const handleClose = async () => {
    if (!selectedOperator) return alert('Выберите оператора');
    const res = closeShift(selectedOperator);
    if (res.success) {
      alert('Смена закрыта');
      refresh();
    } else alert(res.message || 'Ошибка закрытия смены');
  };

  return (
    <div>
      <h1>Управление сменами</h1>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 6 }}>Оператор</label>
          <select value={selectedOperator} onChange={e=>setSelectedOperator(e.target.value)} style={{ padding: 8, borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <option value="">-- выбрать оператора --</option>
            {users.filter(u=>u.role==='operator').map(u=> <option key={u.id} value={u.id}>{u.name} {u.phone ? `(${u.phone})` : ''}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleOpen} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--btn-bg)', color: 'var(--btn-fg)', border: 'none' }}>Открыть смену</button>
          <button onClick={handleClose} style={{ padding: '8px 12px', borderRadius: 8, background: '#ef5350', color: '#fff', border: 'none' }}>Закрыть смену</button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <h3>Активные смены</h3>
        <div style={{ display: 'grid', gap: 10 }}>
        {shifts.filter(s=>!s.closedAt).map(s=> {
          const op = users.find(u => u.id === s.operatorId);
          return (
          <div key={s.id} style={{ padding: 12, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{op ? op.name : s.operatorId}</div>
              <div style={{ color: 'var(--muted)' }}>Открыта: {new Date(s.openedAt).toLocaleString()}</div>
            </div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>Активна</div>
          </div>
          )
        })}
        </div>

        <h3 style={{ marginTop: 12 }}>Архив смен</h3>
        <div style={{ display: 'grid', gap: 10 }}>
        {shifts.filter(s=>s.closedAt).map(s=> {
          const op = users.find(u => u.id === s.operatorId);
          return (
          <div key={s.id} style={{ padding: 12, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)', marginBottom: 6 }}>
            <div style={{ fontWeight: 700 }}>{op ? op.name : s.operatorId}</div>
            <div style={{ color: 'var(--muted)' }}>Открыта: {new Date(s.openedAt).toLocaleString()}</div>
            <div style={{ color: 'var(--muted)' }}>Закрыта: {new Date(s.closedAt).toLocaleString()}</div>
          </div>
          )
        })}
        </div>
      </div>
    </div>
  );
}
