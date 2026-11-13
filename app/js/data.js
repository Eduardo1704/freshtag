// FRESHTAG app · static data: categories, quick picks, recipes, demo seed.
// Shelf-life days are household estimates once the package is opened; the user can adjust them per item.

export const CATS = {
  lacteos:   { label: 'Lácteos',            emoji: '🥛', icon: 'milk', tone: 'azul', days: 5,  place: 'refri' },
  queso:     { label: 'Quesos',             emoji: '🧀', icon: 'cheese', tone: 'crema', days: 10, place: 'refri' },
  carne:     { label: 'Carne',              emoji: '🥩', icon: 'beef', tone: 'coral', days: 3,  place: 'refri' },
  pollo:     { label: 'Pollo',              emoji: '🍗', icon: 'drumstick', tone: 'coral', days: 2,  place: 'refri' },
  pescado:   { label: 'Pescado',            emoji: '🐟', icon: 'fish', tone: 'azul', days: 2,  place: 'refri' },
  embutidos: { label: 'Embutidos',          emoji: '🥓', icon: 'ham', tone: 'coral', days: 5,  place: 'refri' },
  huevo:     { label: 'Huevo',              emoji: '🥚', icon: 'egg', tone: 'crema', days: 21, place: 'refri' },
  frutas:    { label: 'Frutas',             emoji: '🍓', icon: 'cherry', tone: 'coral', days: 5,  place: 'refri' },
  verduras:  { label: 'Verduras',           emoji: '🥬', icon: 'leafy-green', tone: 'verde', days: 5,  place: 'refri' },
  pan:       { label: 'Pan y tortillas',    emoji: '🫓', icon: 'croissant', tone: 'crema', days: 4,  place: 'alacena' },
  salsas:    { label: 'Salsas y aderezos',  emoji: '🥫', icon: 'flame', tone: 'coral', days: 7,  place: 'refri' },
  sobras:    { label: 'Sobras',             emoji: '🍲', icon: 'cooking-pot', tone: 'azul', days: 3,  place: 'refri' },
  snacks:    { label: 'Botanas y cereales', emoji: '🍿', icon: 'popcorn', tone: 'crema', days: 30, place: 'alacena' },
  otros:     { label: 'Otros',              emoji: '🧺', icon: 'shopping-basket', tone: 'verde', days: 7,  place: 'refri' },
};

export const PLACES = {
  refri:      { label: 'Refri' },
  congelador: { label: 'Congelador' },
  alacena:    { label: 'Alacena' },
};

export const FREEZER_DAYS = 60;

export const QUICK = [
  ['Leche', 'lacteos'], ['Yogur natural', 'lacteos'], ['Crema', 'lacteos'], ['Queso panela', 'queso'],
  ['Jamón', 'embutidos'], ['Pechuga de pollo', 'pollo'], ['Carne molida', 'carne'], ['Huevo', 'huevo'],
  ['Espinaca', 'verduras'], ['Jitomate', 'verduras'], ['Aguacate', 'frutas'], ['Fresas', 'frutas'],
  ['Plátano', 'frutas'], ['Tortillas', 'pan'], ['Pan de caja', 'pan'], ['Salsa verde', 'salsas'],
  ['Arroz cocido', 'sobras'], ['Cereal', 'snacks'], ['Papas', 'snacks'], ['Palomitas', 'snacks'],
];

// Pinzas that come in the kit (ids are what the NFC tag link carries: #/tag/FT-VERDE).
export const KIT = [
  { id: 'FT-CREMA', name: 'Pinza crema', color: 'crema' },
  { id: 'FT-VERDE', name: 'Pinza verde', color: 'verde' },
  { id: 'FT-CORAL', name: 'Pinza coral', color: 'coral' },
];

export { RECIPES } from './recipes.js';

// Demo household: dates are relative to today so the semáforo always shows all three states.
export function demoSeed() {
  const it = (name, cat, ago, days, pinza = null, place) =>
    ({ name, cat, ago, days, pinza, place: place || CATS[cat].place });
  const items = [
    it('Leche', 'lacteos', 4, 5, 'FT-CREMA'),
    it('Yogur natural', 'lacteos', 3, 5),
    it('Salsa verde', 'salsas', 6, 7),
    it('Tortillas', 'pan', 2, 4),
    it('Crema', 'lacteos', 9, 7),
    it('Espinaca', 'verduras', 1, 5),
    it('Fresas', 'frutas', 2, 5),
    it('Pechuga de pollo', 'pollo', 0, 3),
    it('Queso panela', 'queso', 3, 10),
    it('Cereal', 'snacks', 12, 30, 'FT-VERDE'),
    it('Carne molida', 'carne', 5, 60, null, 'congelador'),
  ];
  const log = [
    ['Plátano', 'frutas', 'consumido', 2], ['Jamón', 'embutidos', 'consumido', 3], ['Leche', 'lacteos', 'consumido', 5],
    ['Jitomate', 'verduras', 'desechado', 6], ['Pan de caja', 'pan', 'consumido', 8], ['Yogur natural', 'lacteos', 'consumido', 9],
    ['Aguacate', 'frutas', 'desechado', 11], ['Arroz cocido', 'sobras', 'consumido', 12], ['Huevo', 'huevo', 'consumido', 15],
    ['Espinaca', 'verduras', 'desechado', 16], ['Queso panela', 'queso', 'consumido', 18], ['Tortillas', 'pan', 'consumido', 20],
    ['Fresas', 'frutas', 'consumido', 23], ['Salsa verde', 'salsas', 'desechado', 25], ['Pechuga de pollo', 'pollo', 'consumido', 27],
    ['Papas', 'snacks', 'consumido', 30], ['Cereal', 'snacks', 'consumido', 33],
  ].map(([name, cat, action, ago]) => ({ name, cat, action, ago }));
  return { items, log };
}
