export const CATALOG = {
  liquids: {
    id: 'liquids',
    title: 'Жидкости и фильтры',
    items: [
      { title: 'Замена масла и масляного фильтра двигателя', price: 1290 },
      { title: 'Замена воздушного фильтра', price: 590 },
      { title: 'Замена салонного фильтра', price: 590 },
      { title: 'Замена тормозной жидкости', price: 1590 },
      { title: 'Замена жидкости ГУР', price: 1390 },
    ],
  },
  suspension: {
    id: 'suspension',
    title: 'Ходовая часть',
    items: [
      { title: 'Диагностика ходовой части', price: 1090 },
      { title: 'Замена амортизаторов передней подвески', price: 5590 },
      { title: 'Замена пружины/рессоры', price: 5490 },
      { title: 'Замена пыльника/отбойника', price: 5790 },
    ],
  },
  engine: {
    id: 'engine',
    title: 'Двигатель',
    items: [
      { title: 'Диагностика ДВС и электронных систем', price: 2190 },
      { title: 'Прочистка дроссельной заслонки', price: 2890 },
      { title: 'Аппаратная прочистка форсунок', price: 3590 },
    ],
  },
  brakes: {
    id: 'brakes',
    title: 'Тормозная система',
    items: [
      { title: 'Диагностика тормозной системы', price: 1190 },
      { title: 'Замена тормозной жидкости', price: 1590 },
      { title: 'Замена тормозных дисковых колодок', price: 3180 },
    ],
  },
};

export function getCategories() {
  return Object.values(CATALOG).map(c => ({ id: c.id, title: c.title }));
}

export function getAllServices() {
  return Object.values(CATALOG).flatMap(c => c.items.map(it => ({ category: c.id, title: it.title, price: it.price })));
}
