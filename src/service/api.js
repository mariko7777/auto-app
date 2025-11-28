export async function getRecordCards()
{
    try {
        const res= await fetch("/data/Records.json")
        if (!res.ok) throw new Error("Network responce was not ok");
        const data=await res.json();
        // Normalize statuses from upstream JSON (e.g. 'paid'/'unpaid') to app's Russian statuses
        return data.map(normalizeRecord);
    }
    
   
    catch (err)
    {
        console.error("ошибка загрущки json" , err)
        return []; 
    }
}

function normalizeStatus(status) {
    if (!status && status !== 0) return status;
    const s = String(status).trim().toLowerCase();
    if (['paid', 'оплачено', 'проведена', 'done', 'paid'].includes(s)) return 'Проведена';
    if (['unpaid', 'неоплачено', 'pending', 'in progress', 'unpaid'].includes(s)) return 'В работе';
    if (['cancel', 'cancelled', 'отмена', 'canceled', 'rejected'].includes(s)) return 'Отмена';
    // If already in Russian or unknown, try to return a sensible default
    if (s === 'проведена' || s === 'проведено') return 'Проведена';
    if (s === 'в работе' || s === 'выполняется') return 'В работе';
    if (s === 'отмена' || s === 'отменена') return 'Отмена';
    return status;
}

function normalizeRecord(rec) {
    const copy = { ...rec };
    if (copy.payment_status) copy.payment_status = normalizeStatus(copy.payment_status);
    return copy;
}

export async function saveRecord(newRecord) {
    try {
        // Получаем текущее состояние — сначала пробуем localStorage, затем файл
        const records = await getRecordsFromStorage();

        // Добавляем новую запись в конец
        // normalize before saving
        records.push(normalizeRecord(newRecord));

        // Сохраняем в localStorage
        localStorage.setItem('records', JSON.stringify(records));
        
        return { success: true, message: 'Запись успешно сохранена!' };
    } catch (err) {
        console.error("Ошибка сохранения записи", err);
        return { success: false, message: 'Ошибка при сохранении записи' };
    }
}

export async function getRecordsFromStorage() {
    try {
        const stored = localStorage.getItem('records');
        if (stored) {
            // normalize any legacy statuses that might be stored as English
            const parsed = JSON.parse(stored);
            return parsed.map(normalizeRecord);
        }
        return await getRecordCards();
    } catch (err) {
        console.error("Ошибка загрузки записей", err);
        return [];
    }
}

export async function updateRecord(index, updatedRecord) {
    try {
        const records = await getRecordsFromStorage();
        if (index >= 0 && index < records.length) {
            records[index] = normalizeRecord(updatedRecord);
            localStorage.setItem('records', JSON.stringify(records));
            return { success: true, message: 'Запись успешно обновлена!' };
        } else {
            return { success: false, message: 'Запись не найдена' };
        }
    } catch (err) {
        console.error("Ошибка обновления записи", err);
        return { success: false, message: 'Ошибка при обновлении записи' };
    }
}

export async function deleteRecord(index) {
    try {
        const records = await getRecordsFromStorage();
        if (index >= 0 && index < records.length) {
            records.splice(index, 1);
            localStorage.setItem('records', JSON.stringify(records));
            return { success: true, message: 'Запись успешно удалена!' };
        } else {
            return { success: false, message: 'Запись не найдена' };
        }
    } catch (err) {
        console.error("Ошибка удаления записи", err);
        return { success: false, message: 'Ошибка при удалении записи' };
    }
}

