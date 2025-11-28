export async function getRecordCards()
{
    try {
        const res= await fetch("/data/Records.json")
        if (!res.ok) throw new Error("Network responce was not ok");
        const data=await res.json();
        return data ; 
    }
    
   
    catch (err)
    {
        console.error("ошибка загрущки json" , err)
        return []; 
    }
}

export async function saveRecord(newRecord) {
    try {
        // Получаем текущее состояние — сначала пробуем localStorage, затем файл
        const records = await getRecordsFromStorage();

        // Добавляем новую запись в конец
        records.push(newRecord);

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
            return JSON.parse(stored);
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
            records[index] = updatedRecord;
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

