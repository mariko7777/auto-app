import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addSelectedService, getServicesFromStorage, getUsers, formatPrice } from '../service/api';
import { CATALOG } from '../service/catalog';

export default function ServiceDetails() {
  const { category } = useParams();
  const info = (CATALOG[category]) || { title: 'Неизвестная категория', items: [] };

  const navigate = useNavigate();

  const handleSelect = (item) => {
    // item may be an object ({title, price}) or a plain string (legacy).
    const title = typeof item === 'string' ? item : item.title;
    const catalogPrice = (item && item.price != null) ? item.price : null;

    const storedModels = getServicesFromStorage();
    const model = storedModels.find(m => m.name === title);
    const price = catalogPrice != null ? catalogPrice : (model ? model.price : '');

    // Save selected service to history (localStorage)
    addSelectedService({ category, name: title, price, selectedAt: Date.now() });

    // Navigate to create page with service prefilled via query params
    const params = new URLSearchParams();
    params.set('service', title);
    if (price !== '') params.set('price', String(price));
    navigate(`/create?${params.toString()}`);
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>{info.title}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {info.items.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '6px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 600 }}>{it.title}</div>
              {it.price != null && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{formatPrice(it.price)}</div>}
            </div>
            <button onClick={() => handleSelect(it)} style={{ padding: '6px 10px', background: 'var(--btn-bg)', color: 'var(--btn-fg)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Выбрать</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Мастера, привязанные к этой услуге</h3>
        {getUsers().filter(u => u.role === 'master' && (u.services || []).includes(category)).length === 0 ? (
          <div style={{ color: 'var(--muted)' }}>Нет привязанных мастеров</div>
        ) : (
          getUsers().filter(u => u.role === 'master' && (u.services || []).includes(category)).map(m => (
            <div key={m.id} style={{ padding: 8, borderRadius: 6, background: 'rgba(255,255,255,0.02)', marginBottom: 6 }}>{m.name} — {m.phone}</div>
          ))
        )}
      </div>
    </div>
  );
}
