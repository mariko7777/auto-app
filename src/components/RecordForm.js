import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResultCreateRecord from './ResultCreateRecord';
import { saveRecord, updateRecord, getRecordsFromStorage, addOperation, getUsers, getShifts } from '../service/api';
import { CATALOG } from '../service/catalog';

export default function CreateCard({editingIndex, onEditComplete}) {
  const [formData, setFormData] = useState({
    client: '',
    car: '',
    service: '',
    price: '',
    priceLocked: false,
    date: '',
    payment_status: "В работе",
    // дополнительные поля
    cancel_reason: '',
    paid_amount: '',
    comments: ''
  });

  const [result, setResult] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeOperator, setActiveOperator] = useState(null);
  const [responsibleMasters, setResponsibleMasters] = useState([]);

  useEffect(() => {
    if (editingIndex !== null && editingIndex !== undefined) {
      loadRecordForEdit(editingIndex);
    } else {
      // Если мы переходим в режим создания (не редактирования), очищаем форму
      if (isEditing) {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingIndex]);

  // Load active operator with open shift
  useEffect(() => {
    const findActiveOperator = () => {
      const shifts = getShifts();
      const users = getUsers();
      const openShifts = shifts.filter(s => !s.closedAt);
      if (openShifts.length > 0) {
        const operator = users.find(u => u.id === openShifts[0].operatorId);
        setActiveOperator(operator || null);
      } else {
        setActiveOperator(null);
      }
    };
    findActiveOperator();
  }, []);

  const location = useLocation();

  // Prefill from query params (e.g., when coming from ServiceDetails)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const service = params.get('service');
      const price = params.get('price');
      if ((service || price) && (editingIndex === null || editingIndex === undefined)) {
        setFormData(prev => ({
          ...prev,
          service: service || prev.service,
          price: price || prev.price,
        }));
        setIsEditing(false);
      }
    } catch (err) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);


  const loadRecordForEdit = async (index) => {
    try {
      const records = await getRecordsFromStorage();
      if (records[index]) {
        // Если в записи нет новых полей, добавляем дефолтные
        const rec = records[index];
        setFormData({
          client: rec.client || '',
          car: rec.car || '',
          service: rec.service || '',
          price: rec.price || '',
          date: rec.date || '',
          payment_status: rec.payment_status || 'В работе',
          cancel_reason: rec.cancel_reason || '',
          paid_amount: rec.paid_amount || '',
          comments: rec.comments || ''
        });
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Ошибка загрузки записи", err);
    }
  };

  const resetForm = () => {
    setFormData({
      client: '',
      car: '',
      service: '',
      price: '',
      date: '',
      payment_status: "В работе",
      cancel_reason: '',
      paid_amount: '',
      comments: ''
    });
    setIsEditing(false);
    setResult('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If service changed, auto-fill price (and lock it) when available in catalog
    if (name === 'service') {
      const svc = Object.values(CATALOG).flatMap(c => c.items).find(it => it.title === value);
      if (svc && svc.price != null) {
        setFormData(prev => ({ ...prev, service: value, price: svc.price, priceLocked: true }));
      } else {
        // otherwise clear locked state and allow manual price
        setFormData(prev => ({ ...prev, service: value, price: '', priceLocked: false }));
      }
      
      // Find category and responsible masters for this service
      const category = Object.entries(CATALOG).find(([_, cat]) => 
        cat.items.some(item => item.title === value)
      );
      
      if (category) {
        const users = getUsers();
        const masters = users.filter(u => 
          u.role === 'master' && (u.services || []).includes(category[0])
        );
        setResponsibleMasters(masters);
      } else {
        setResponsibleMasters([]);
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверка наличия активного оператора
    if (!activeOperator) {
      setResult('Ошибка: нет активной смены оператора. Откройте смену на странице "Смены" перед созданием записи.');
      return;
    }

    // Валидация в зависимости от статуса
    if (formData.payment_status === 'Отмена') {
      if (!formData.cancel_reason || formData.cancel_reason.trim() === '') {
        setResult('Укажите причину отмены записи.');
        return;
      }
    }

    if (formData.payment_status === 'Проведена') {
      const amount = Number(formData.paid_amount);
      if (!formData.paid_amount || isNaN(amount) || amount <= 0) {
        setResult('Укажите корректную сумму оплаты (больше 0).');
        return;
      }
    }

    let response;
    if (isEditing) {
      response = await updateRecord(editingIndex, formData);
    } else {
      response = await saveRecord(formData);
    }

    if (response.success) {
      setResult(response.message);
      // create operation log if payment or cancel
      try {
        if (formData.payment_status === 'Проведена') {
          addOperation({ type: 'payment', amount: formData.paid_amount, recordData: formData });
        }
        if (formData.payment_status === 'Отмена') {
          addOperation({ type: 'cancel', recordData: formData });
        }
      } catch (err) {
        console.error('Ошибка логирования операции', err);
      }

      // Очищаем форму
      resetForm();

      // Вызываем callback для обновления списка
      if (onEditComplete) {
        onEditComplete();
      }
    } else {
      setResult(response.message);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onEditComplete) {
      onEditComplete();
    }
  };

  return (
    <>
      <div className={`form-container ${isEditing ? 'editing' : ''}`}>
        <h2>{isEditing ? 'Редактирование записи' : 'Создание новой записи'}</h2>
        
        {/* Активный оператор со статусом смены */}
        {activeOperator && (
          <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: '#e8f5e9', border: '1px solid #81c784', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 600, color: '#2e7d32' }}>Ответственный оператор</div>
            <div style={{ fontSize: 14 }}>
              <strong>{activeOperator.name}</strong> {activeOperator.phone}
            </div>
            <div style={{ fontSize: 12, color: '#558b2f', fontWeight: 500 }}>✓ Смена активна</div>
          </div>
        )}
        {!activeOperator && (
          <div style={{ padding: 12, marginBottom: 16, borderRadius: 8, background: '#fff3e0', border: '1px solid #ffb74d', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 600, color: '#e65100' }}>Внимание</div>
            <div style={{ fontSize: 14, color: '#e65100' }}>Нет активных операторов со статусом открытой смены. Откройте смену на странице "Смены".</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="record-form">
          <div className="form-group">
            <label htmlFor="client">Клиент:</label>
            <input
              id="client"
              type="text"
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="car">Автомобиль:</label>
            <input
              id="car"
              type="text"
              name="car"
              value={formData.car}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="service">Услуга:</label>
            <select id="service" name="service" value={formData.service} onChange={handleChange} required>
              <option value="">— выберите услугу —</option>
              {Object.values(CATALOG).map(cat => (
                <optgroup key={cat.id} label={cat.title}>
                  {cat.items.map((it, i) => (
                    <option key={cat.id + '_' + i} value={it.title}>{it.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Цена:</label>
            <input
              id="price"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              readOnly={!!formData.priceLocked}
              style={formData.priceLocked ? { background: '#f3f6f9' } : {}}
            />
          </div>

          {/* Responsible Masters */}
          {formData.service && responsibleMasters.length > 0 && (
            <div className="form-group">
              <label>Ответственные мастера:</label>
              <div style={{ padding: 12, borderRadius: 6, background: '#f0f8e8', border: '1px solid #81c784', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {responsibleMasters.map(master => (
                  <div key={master.id} style={{ padding: 8, borderRadius: 4, background: 'white', border: '1px solid #c8e6c9' }}>
                    <div style={{ fontWeight: 600, color: '#2e7d32' }}>{master.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{master.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.service && responsibleMasters.length === 0 && (
            <div className="form-group">
              <div style={{ padding: 12, borderRadius: 6, background: '#fff3e0', border: '1px solid #ffb74d' }}>
                <div style={{ fontSize: 12, color: '#e65100' }}>Для выбранной услуги нет назначенных мастеров</div>
              </div>
            </div>
          )}


          <div className="form-group">
            <label htmlFor="date">Дата:</label>
            <input
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Статус:</label>
            <select
              id="status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              required
            >
              <option value="В работе">В работе</option>
              <option value="Проведена">Проведена</option>
              <option value="Отмена">Отмена</option>
            </select>
          </div>

          {/* Дополнительные поля в зависимости от статуса */}
          {formData.payment_status === 'Отмена' && (
            <div className="form-group">
              <label htmlFor="cancel_reason">Причина отмены:</label>
              <textarea
                id="cancel_reason"
                name="cancel_reason"
                value={formData.cancel_reason}
                onChange={handleChange}
                rows={3}
                placeholder="Опишите причину отмены"
                required
              />
            </div>
          )}

          {formData.payment_status === 'Проведена' && (
            <>
              <div className="form-group">
                <label htmlFor="paid_amount">Сумма оплаты:</label>
                <input
                  id="paid_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  name="paid_amount"
                  value={formData.paid_amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="comments">Комментарии к оплате:</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Дополнительные комментарии к оплате"
                />
              </div>
            </>
          )}

          <div className="form-buttons">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={!activeOperator}
              style={{ opacity: !activeOperator ? 0.5 : 1, cursor: !activeOperator ? 'not-allowed' : 'pointer' }}
            >
              {isEditing ? 'Обновить' : 'Создать'} запись
            </button>
            {isEditing && (
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Отмена
              </button>
            )}
          </div>
        </form>
      </div>

      {result && <ResultCreateRecord result={result} />}
    </>
  );
}