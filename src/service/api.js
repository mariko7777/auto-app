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

/* ====== Services model persistence functions ====== */
export function getServicesFromStorage() {
    try {
        const stored = localStorage.getItem('service_models');
        if (stored) return JSON.parse(stored);
        // default empty list
        return [];
    } catch (err) {
        console.error('Ошибка чтения моделей услуг', err);
        return [];
    }
}

export function saveServiceModel(model) {
    try {
        const list = getServicesFromStorage();
        list.push(model);
        localStorage.setItem('service_models', JSON.stringify(list));
        return { success: true };
    } catch (err) {
        console.error('Ошибка сохранения модели услуги', err);
        return { success: false };
    }
}

export function clearServiceModels() {
    try {
        localStorage.removeItem('service_models');
        return { success: true };
    } catch (err) {
        console.error('Ошибка очистки моделей услуг', err);
        return { success: false };
    }
}

export function getSelectedServices() {
    try {
        const stored = localStorage.getItem('selected_services');
        if (stored) return JSON.parse(stored);
        return [];
    } catch (err) {
        console.error('Ошибка чтения выбранных услуг', err);
        return [];
    }
}

export function addSelectedService(item) {
    try {
        const list = getSelectedServices();
        list.push(item);
        localStorage.setItem('selected_services', JSON.stringify(list));
        return { success: true };
    } catch (err) {
        console.error('Ошибка добавления выбранной услуги', err);
        return { success: false };
    }
}

/* ====== Users / Shifts / Operations / Logs ====== */

export function getUsers() {
    try {
        const stored = localStorage.getItem('users');
        if (stored) return JSON.parse(stored);
        return [];
    } catch (err) {
        console.error('Ошибка чтения пользователей', err);
        return [];
    }
}

export function saveUser(user) {
    try {
        const users = getUsers();
        // assign id
        const id = Date.now().toString();
        const record = { id, ...user, createdAt: Date.now() };
        users.push(record);
        localStorage.setItem('users', JSON.stringify(users));
        addLog({ type: 'user:create', message: `Пользователь зарегистрирован: ${user.name} (${user.phone})`, data: record });
        return { success: true, user: record };
    } catch (err) {
        console.error('Ошибка сохранения пользователя', err);
        return { success: false };
    }
}

export function updateUser(updated) {
    try {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === updated.id);
        if (idx >= 0) {
            users[idx] = { ...users[idx], ...updated };
            localStorage.setItem('users', JSON.stringify(users));
            addLog({ type: 'user:update', message: `Пользователь обновлён: ${updated.name || users[idx].name}`, data: users[idx] });
            return { success: true };
        }
        return { success: false, message: 'Пользователь не найден' };
    } catch (err) {
        console.error('Ошибка обновления пользователя', err);
        return { success: false };
    }
}

export function deleteUser(userId) {
    try {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx >= 0) {
            const deletedUser = users[idx];
            users.splice(idx, 1);
            localStorage.setItem('users', JSON.stringify(users));
            addLog({ type: 'user:delete', message: `Пользователь удалён: ${deletedUser.name}`, data: deletedUser });
            return { success: true };
        }
        return { success: false, message: 'Пользователь не найден' };
    } catch (err) {
        console.error('Ошибка удаления пользователя', err);
        return { success: false };
    }
}

export function getShifts() {
    try {
        const stored = localStorage.getItem('shifts');
        if (stored) return JSON.parse(stored);
        return [];
    } catch (err) {
        console.error('Ошибка чтения смен', err);
        return [];
    }
}

export function openShift(operatorId) {
    try {
        // Ensure operator has no open shift
        const open = getShifts().find(s => s.operatorId === operatorId && !s.closedAt);
        if (open) return { success: false, message: 'Смена уже открыта' };
        const shifts = getShifts();
        const shift = { id: Date.now().toString(), operatorId, openedAt: Date.now(), closedAt: null };
        shifts.push(shift);
        localStorage.setItem('shifts', JSON.stringify(shifts));
        addLog({ type: 'shift:open', message: `Открыта смена оператором ${operatorId}`, data: shift });
        return { success: true, shift };
    } catch (err) {
        console.error('Ошибка открытия смены', err);
        return { success: false };
    }
}

export function closeShift(operatorId) {
    try {
        const shifts = getShifts();
        const idx = shifts.findIndex(s => s.operatorId === operatorId && !s.closedAt);
        if (idx === -1) return { success: false, message: 'Открытой смены не найдено' };
        shifts[idx].closedAt = Date.now();
        localStorage.setItem('shifts', JSON.stringify(shifts));
        addLog({ type: 'shift:close', message: `Закрыта смена оператором ${operatorId}`, data: shifts[idx] });
        return { success: true, shift: shifts[idx] };
    } catch (err) {
        console.error('Ошибка закрытия смены', err);
        return { success: false };
    }
}

export function getOpenShiftForOperator(operatorId) {
    try {
        const shifts = getShifts();
        return shifts.find(s => s.operatorId === operatorId && !s.closedAt) || null;
    } catch (err) {
        console.error('Ошибка получения открытой смены', err);
        return null;
    }
}

export function addOperation(op) {
    try {
        const ops = JSON.parse(localStorage.getItem('operations') || '[]');
        const record = { id: Date.now().toString(), timestamp: Date.now(), ...op };
        ops.push(record);
        localStorage.setItem('operations', JSON.stringify(ops));
    addLog({ type: 'operation:add', message: `Операция ${op.type} добавлена`, data: record });
        return { success: true, operation: record };
    } catch (err) {
        console.error('Ошибка добавления операции', err);
        return { success: false };
    }
}

export function getOperations() {
    try {
        return JSON.parse(localStorage.getItem('operations') || '[]');
    } catch (err) {
        console.error('Ошибка получения операций', err);
        return [];
    }
}

export function getLogs() {
    try {
        return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch (err) {
        console.error('Ошибка получения логов', err);
        return [];
    }
}

export function addLog(entry) {
    try {
        const logs = getLogs();
        const rec = { id: Date.now().toString(), timestamp: Date.now(), ...entry };
        logs.push(rec);
        localStorage.setItem('app_logs', JSON.stringify(logs));
        return rec;
    } catch (err) {
        console.error('Ошибка добавления лога', err);
        return null;
    }
}

/* ====== Price formatting ====== */
export function formatPrice(price) {
    if (price == null || price === '') return '—';
    const num = Number(price);
    if (isNaN(num)) return String(price);
    // Format with thousands separator (space or period) and add ruble symbol
    return num.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/* ====== Initialize default masters ====== */
export function initializeDefaultMasters() {
    try {
        const users = getUsers();
        // Check if masters already exist
        const masters = users.filter(u => u.role === 'master');
        if (masters.length > 0) return; // Already initialized
        
        const defaultMasters = [
            { name: 'Новиков Павел Сергеевич', phone: '+7-XXX-XXX-XX-XX', role: 'master', services: ['liquids'] },
            { name: 'Мартынов Максим Филиппович', phone: '+7-XXX-XXX-XX-XX', role: 'master', services: ['suspension'] },
            { name: 'Буров Михаил Максимович', phone: '+7-XXX-XXX-XX-XX', role: 'master', services: ['engine'] },
            { name: 'Минаев Даниил Егорович', phone: '+7-XXX-XXX-XX-XX', role: 'master', services: ['brakes'] },
        ];
        
        defaultMasters.forEach(master => {
            saveUser(master);
        });
    } catch (err) {
        console.error('Ошибка инициализации мастеров', err);
    }
}


