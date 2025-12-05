import React, { useState, useEffect } from 'react';
import { getServicesFromStorage, saveServiceModel } from '../service/api';

export default function ServiceForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [models, setModels] = useState([]);

  useEffect(() => {
    setModels(getServicesFromStorage());
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Введите название услуги');
    const p = parseFloat(price);
    if (isNaN(p)) return alert('Введите корректную цену');

    const model = { name: name.trim(), price: p };
    const res = saveServiceModel(model);
    if (res.success) {
      setModels(getServicesFromStorage());
      setName('');
      setPrice('');
    } else {
      alert('Ошибка при сохранении модели');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h2 style={{ marginBottom: '10px' }}>Добавить модель услуги (название, цена)</h2>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <input placeholder="Название" value={name} onChange={e => setName(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', flex: 1 }} />
        <input placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '8px', width: '120px', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
        <button type="submit" style={{ padding: '8px 12px', background: 'var(--btn-bg)', color: 'var(--btn-fg)', border: 'none', borderRadius: '6px' }}>Добавить</button>
      </form>

      <div>
        <h3 style={{ marginBottom: '8px' }}>Сохранённые модели</h3>
        {models.length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>Список пуст</div>
        ) : (
          <ul style={{ paddingLeft: '18px' }}>
            {models.map((m, i) => (
              <li key={i} style={{ marginBottom: '6px' }}>{m.name} — {m.price} ₽</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
