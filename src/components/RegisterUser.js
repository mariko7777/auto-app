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
  const navigate = useNavigate();

  const toggleService = (id) => {
    setServices(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !name) return alert('Введите телефон и ФИО');
    const res = saveUser({ phone, name, role, services });
    if (res.success) {
      alert('Пользователь зарегистрирован');
      navigate('/users');
    } else {
      alert('Ошибка регистрации');
    }
  };

  return (
    <div>
      <h1>Регистрация пользователя</h1>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '8px', maxWidth: 600 }}>
        <input placeholder="Телефон" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input placeholder="ФИО" value={name} onChange={e=>setName(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="operator">Оператор</option>
          <option value="master">Мастер</option>
          <option value="admin">Администратор</option>
        </select>

        {role === 'master' && (
          <div>
            <div>Привязать мастера к услугам:</div>
            {categories.map(c=> (
              <label key={c.id} style={{ display: 'block' }}>
                <input type="checkbox" checked={services.includes(c.id)} onChange={()=>toggleService(c.id)} /> {c.title}
              </label>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" style={{ padding: '8px 12px' }}>Зарегистрировать</button>
          <button type="button" onClick={()=>navigate('/users')} style={{ padding: '8px 12px' }}>Отмена</button>
        </div>
      </form>
    </div>
  );
}
