import { useState, useEffect } from 'react';
import ResultCreateRecord from './ResultCreateRecord';
import { saveRecord, updateRecord, getRecordsFromStorage } from '../service/api';

export default function CreateCard({editingIndex, onEditComplete}) {
  const [formData, setFormData] = useState({
    client: '',
    car: '',
    service: '',
    price: '',
    date: '',
    payment_status: "В работе",
    // дополнительные поля
    cancel_reason: '',
    paid_amount: '',
    comments: ''
  });

  const [result, setResult] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
            <input
              id="service"
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
            />
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
            />
          </div>

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
            <button type="submit" className="btn-submit">
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