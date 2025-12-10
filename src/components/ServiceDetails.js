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
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--text-color)' }}>{info.title}</h1>
      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {info.items.map((it, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 18px', 
              borderRadius: '10px', 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={e => Object.assign(e.currentTarget.style, { 
              transform: 'translateY(-2px)', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              borderColor: '#667eea'
            })}
            onMouseOut={e => Object.assign(e.currentTarget.style, { 
              transform: '', 
              boxShadow: '0 0 0 transparent',
              borderColor: 'var(--border-color)'
            })}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-color)' }}>{it.title}</div>
              {it.price != null && <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{formatPrice(it.price)}</div>}
            </div>
            <button 
              onClick={() => handleSelect(it)} 
              style={{ 
                padding: '10px 20px', 
                background: '#667eea', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)'
              }}
              onMouseOver={e => Object.assign(e.target.style, { 
                transform: 'translateY(-2px)', 
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35)'
              })}
              onMouseOut={e => Object.assign(e.target.style, { 
                transform: '', 
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)'
              })}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '24px', padding: '16px', borderRadius: '10px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-color)' }}>Мастера, привязанные к этой услуге</h3>
        {getUsers().filter(u => u.role === 'master' && (u.services || []).includes(category)).length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Нет привязанных мастеров</div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {getUsers().filter(u => u.role === 'master' && (u.services || []).includes(category)).map(m => (
              <div 
                key={m.id} 
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  fontSize: '14px',
                  color: 'var(--text-color)'
                }}
              >
                <strong>{m.name}</strong> — {m.phone}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
