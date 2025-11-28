import {useEffect, useState } from "react"
import { getRecordsFromStorage, deleteRecord } from "../service/api"
import Card  from "./Card";

export default function CardList({editingIndex, onEdit}) 
{
    const [records, SetRecords] = useState([]);  
    const [filter, setFilter] = useState('All'); // All, Проведена, В работе, Отмена

    useEffect(()=>
    {
        loadRecords();
    },[editingIndex]) // перезагружаем при редактировании

    const loadRecords = async () => {
        const data = await getRecordsFromStorage();
        SetRecords(data);
    }

    const handleDelete = async (index) => {
        if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
            await deleteRecord(index);
            loadRecords();
        }
    };

    const getFilteredRecords = () => {
        if (filter === 'All') {
            return records.map((record, idx) => ({ record, originalIndex: idx }));
        }
        return records
            .map((record, idx) => ({ record, originalIndex: idx }))
            .filter(item => item.record.payment_status === filter);
    };

    const filteredRecords = getFilteredRecords();

    return (
    <div className="record-list-container">
        <div className="filter-buttons">
            <button 
                className={`filter-btn ${filter === 'All' ? 'active' : ''}`}
                onClick={() => setFilter('All')}
            >
                Все записи ({records.length})
            </button>
            <button 
                className={`filter-btn filter-completed ${filter === 'Проведена' ? 'active' : ''}`}
                onClick={() => setFilter('Проведена')}
            >
                ✓ Проведены ({records.filter(r => r.payment_status === 'Проведена').length})
            </button>
            <button 
                className={`filter-btn filter-pending ${filter === 'В работе' ? 'active' : ''}`}
                onClick={() => setFilter('В работе')}
            >
                ⏳ В работе ({records.filter(r => r.payment_status === 'В работе').length})
            </button>
            <button 
                className={`filter-btn filter-cancelled ${filter === 'Отмена' ? 'active' : ''}`}
                onClick={() => setFilter('Отмена')}
            >
                ✕ Отменены ({records.filter(r => r.payment_status === 'Отмена').length})
            </button>
        </div>

        <div className="records-container">
            <p className="records-title">Записи</p>
            {
                filteredRecords.length > 0 ? (
                    filteredRecords.map(
                        ({record, originalIndex})=>
                        (
                            <Card 
                                key={originalIndex} 
                                index={originalIndex}
                                {...record}
                                onEdit={onEdit}
                                onDelete={handleDelete}
                            />
                        )
                    )
                ) : (
                    <div className="no-records">Нет записей для выбранного фильтра</div>
                )
            }
        </div>
    </div>
    )
}