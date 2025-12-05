import React from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../service/catalog';

export default function ServicesPage() {
  const categories = getCategories();
  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>Выберите услугу из каталога:</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
        {categories.map(c => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '18px' }}>{c.title}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to={`/services/${c.id}`} style={{ padding: '6px 10px', background: 'var(--btn-bg)', color: 'var(--btn-fg)', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>Подробнее</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
