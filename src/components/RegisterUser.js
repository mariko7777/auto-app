import React, { useState } from 'react';
import { saveUser } from '../service/api';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'liquids', title: 'Жидкости и фильтры' },
  { id: 'suspension', title: 'Ходовая часть' },
  { id: 'engine', title: 'Двигатель' },
  { id: 'brakes', title: 'Тормозная система' },
];

export default function RegisterUser() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('operator');
  const [services, setServices] = useState([]);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const toggleService = (id) => {
    setServices(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !name) return alert('Введите телефон и ФИО');
    const res = saveUser({ phone, name, role, services });
    if (res.success) {
      setNotification({ type: 'success', message: 'Пользователь зарегистрирован' });
      // navigate after short delay so user sees notification
      setTimeout(() => navigate('/users'), 900);
    } else {
      setNotification({ type: 'error', message: 'Ошибка регистрации' });
    }
  };

  return (
    <div>
      <h1>Регистрация пользователя</h1>
      {notification && (
        <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: notification.type === 'success' ? '#e8f5e9' : '#fff3e0', border: '1px solid', borderColor: notification.type === 'success' ? '#81c784' : '#ffb74d' }}>
          <strong style={{ color: notification.type === 'success' ? '#2e7d32' : '#e65100' }}>{notification.message}</strong>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', maxWidth: 720, padding: 18, border: '1px solid var(--border-color)', borderRadius: 10 }}>
        <input placeholder="Телефон" value={phone} onChange={e=>setPhone(e.target.value)} style={{ padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid var(--border-color)' }} />
        <input placeholder="ФИО" value={name} onChange={e=>setName(e.target.value)} style={{ padding: 12, fontSize: 16, borderRadius: 8, border: '1px solid var(--border-color)' }} />
        <select value={role} onChange={e=>setRole(e.target.value)} style={{ padding: 12, fontSize: 15, borderRadius: 8, border: '1px solid var(--border-color)' }}>
          <option value="operator">Оператор</option>
          <option value="master">Мастер</option>
          <option value="admin">Администратор</option>
        </select>

        {role === 'master' && (
          <div>
            <div style={{ marginBottom: 8 }}>Привязать мастера к услугам:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map(c=> (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8, border: '1px solid var(--border-color)', background: 'white' }}>
                  <input type="checkbox" checked={services.includes(c.id)} onChange={()=>toggleService(c.id)} />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start', marginTop: 6 }}>
          <button type="submit" style={{ padding: '12px 18px', fontSize: 16, background: '#4a90e2', color: '#fff', border: 'none', borderRadius: 8 }}>Зарегистрировать</button>
          <button type="button" onClick={()=>navigate('/users')} style={{ padding: '12px 18px', fontSize: 16, background: '#999', color: '#fff', border: 'none', borderRadius: 8 }}>Отмена</button>
        </div>
      </form>
    </div>
  );
}
