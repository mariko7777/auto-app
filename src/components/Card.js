export default function Card({index, client, car, service, price, date, payment_status, cancel_reason, paid_amount, comments, onEdit, onDelete})
{
    const { formatPrice } = require('../service/api');

    const getStatusColor = () => {
        switch(payment_status) {
                case 'Проведена':
                    return 'rgba(70,160,90,0.95)'; // soft green
                case 'В работе':
                    return 'rgba(220,170,60,0.95)'; // soft amber
                case 'Отмена':
                    return 'rgba(230,100,110,0.95)'; // soft red
            default:
                return '#808080'; // серый
        }
    };

    const statusClass = payment_status === 'Проведена' ? 'card--done' : payment_status === 'Отмена' ? 'card--cancelled' : payment_status === 'В работе' ? 'card--pending' : '';

    return (
        <div className={`card ${statusClass}`}>
            <div className="card-header">
                <div className="status-badge" aria-hidden style={{backgroundColor: getStatusColor()}}>
                    <span className="status-text">{payment_status}</span>
                </div>
                <div className="card-actions">
                    <button className="btn-edit" onClick={() => onEdit(index)}>Редактировать</button>
                    <button className="btn-delete" onClick={() => onDelete(index)}>Удалить</button>
                </div>
            </div>
            <div className="card-content card-content--vertical">
                <div className="card-row">
                    <span className="label">Клиент</span>
                    <span className="value">{client}</span>
                </div>
                <div className="card-row">
                    <span className="label">Автомобиль</span>
                    <span className="value">{car}</span>
                </div>
                <div className="card-row">
                    <span className="label">Услуга</span>
                    <span className="value">{service}</span>
                </div>
                {/* Дата */}
                <div className="card-row">
                    <span className="label">Дата</span>
                    <span className="value">{date}</span>
                </div>

                {payment_status === 'Отмена' && cancel_reason && (
                    <div className="card-row">
                        <span className="label">Причина отмены</span>
                        <span className="value">{cancel_reason}</span>
                    </div>
                )}

                {payment_status === 'Проведена' && (
                    <>
                        <div className="card-row">
                            <span className="label">Сумма оплаты</span>
                            <span className="value price">{paid_amount ? formatPrice(paid_amount) : '—'}</span>
                        </div>
                        {comments && (
                            <div className="card-row">
                                <span className="label">Комментарий</span>
                                <span className="value">{comments}</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}