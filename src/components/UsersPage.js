import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser, updateUser } from '../service/api';
import { Link } from 'react-router-dom';
import { CATALOG } from '../service/catalog';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', role: '', services: [] });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const roleLabel = (r) => {
    if (r === 'operator') return 'Оператор';
    if (r === 'master') return 'Мастер';
    if (r === 'admin') return 'Администратор';
    return r;
  };

  const getCategoryTitle = (categoryId) => {
    return CATALOG[categoryId]?.title || categoryId;
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ name: user.name, phone: user.phone, role: user.role, services: user.services || [] });
  };

  const handleSaveEdit = () => {
    if (!editForm.name || !editForm.phone) {
      alert('Заполните все поля');
      return;
    }
    const result = updateUser({ id: editingId, ...editForm });
    if (result.success) {
      setEditingId(null);
      loadUsers();
    } else {
      alert('Ошибка при сохранении');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
      const result = deleteUser(userId);
      if (result.success) {
        loadUsers();
      } else {
        alert('Ошибка при удалении');
      }
    }
  };

  const toggleService = (serviceId) => {
    setEditForm(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  return (
    <div>
      <h1>Пользователи</h1>
      <div style={{ marginBottom: 12 }}>
        <Link to="/register" style={{ padding: '8px 12px', background: 'var(--btn-bg)', color: 'var(--btn-fg)', borderRadius: 6, textDecoration: 'none' }}>Новый пользователь</Link>
      </div>

      {/* Карточки статистики по ролям */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ padding: 12, borderRadius: 8, background: '#e8f4f8', border: '1px solid #a8d4e0', minWidth: 150 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Мастеров</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#0066cc' }}>{users.filter(u => u.role === 'master').length}</div>
        </div>
        <div style={{ padding: 12, borderRadius: 8, background: '#f0f8e8', border: '1px solid #c4e0a8', minWidth: 150 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Операторов</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#339933' }}>{users.filter(u => u.role === 'operator').length}</div>
        </div>
        <div style={{ padding: 12, borderRadius: 8, background: '#fef8e8', border: '1px solid #e0cca8', minWidth: 150 }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Администраторов</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#cc8800' }}>{users.filter(u => u.role === 'admin').length}</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {users.map(u => {
          const getRoleColor = (role) => {
            if (role === 'master') return '#0066cc'; // Синий
            if (role === 'operator') return '#339933'; // Зелёный
            if (role === 'admin') return '#cc8800'; // Оранжевый
            return '#999';
          };

          const borderLeftColor = getRoleColor(u.role);

          return (
            <div key={u.id} style={{ padding: 14, paddingLeft: 16, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderLeft: `4px solid ${borderLeftColor}`, display: 'flex', flexDirection: 'column', gap: 6, boxShadow: u.role === 'operator' || u.role === 'admin' ? '0 4px 18px rgba(53,122,184,0.08)' : 'none' }}>
              {editingId === u.id ? (
                <>
                  <div className="form-group" style={{ marginBottom: 6 }}>
                    <label>ФИО:</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} style={{ padding: '6px', borderRadius: 4, border: '1px solid var(--border-color)', width: '100%' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 6 }}>
                    <label>Телефон:</label>
                    <input type="text" value={editForm.phone} onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))} style={{ padding: '6px', borderRadius: 4, border: '1px solid var(--border-color)', width: '100%' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 6 }}>
                    <label>Роль:</label>
                    <select value={editForm.role} onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))} style={{ padding: '6px', borderRadius: 4, border: '1px solid var(--border-color)', width: '100%' }}>
                      <option value="operator">Оператор</option>
                      <option value="master">Мастер</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </div>
                  {editForm.role === 'master' && (
                    <div className="form-group" style={{ marginBottom: 6 }}>
                      <label>Привязать к услугам:</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {Object.values(CATALOG).map(cat => (
                          <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="checkbox" checked={editForm.services.includes(cat.id)} onChange={() => toggleService(cat.id)} />
                            {cat.title}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleSaveEdit} style={{ padding: '6px 12px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Сохранить</button>
                    <button onClick={handleCancelEdit} style={{ padding: '6px 12px', background: '#999', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Отмена</button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</div>
                  <div style={{ color: 'var(--muted)' }}>{u.phone}</div>
                  <div><strong>Роль:</strong> {roleLabel(u.role)}</div>
                  <div style={{ color: 'var(--muted)' }}><strong>Привязано к:</strong> {(u.services||[]).map(s => getCategoryTitle(s)).join(', ') || '—'}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => handleEdit(u)} style={{ padding: '6px 12px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Редактировать</button>
                    <button onClick={() => handleDelete(u.id, u.name)} style={{ padding: '6px 12px', background: '#e25a5a', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Удалить</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {users.length === 0 && <div className="no-records">Пользователей нет</div>}
      </div>
    </div>
  );
}
