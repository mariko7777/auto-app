import React from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../service/catalog';

export default function ServicesPage() {
  const categories = getCategories();
  return (
    <div style={{ padding: '20px 0' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '24px', color: 'var(--text-color)' }}>Выберите услугу из каталога:</h1>

      <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
        {categories.map(c => (
          <div 
            key={c.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: '16px 18px', 
              borderRadius: '10px', 
              background: 'var(--card-bg)', 
              border: '1px solid var(--border-color)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
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
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-color)' }}>{c.title}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link 
                to={`/services/${c.id}`} 
                style={{ 
                  padding: '10px 20px', 
                  background: '#667eea', 
                  color: '#fff', 
                  borderRadius: '8px', 
                  textDecoration: 'none', 
                  fontWeight: '600',
                  fontSize: '15px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)',
                  display: 'inline-block'
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
                Подробнее
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
