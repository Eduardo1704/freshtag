// FRESHTAG app · static data: categories, quick picks, recipes, demo seed.
// Shelf-life days are household estimates once the package is opened; the user can adjust them per item.

export const CATS = {
  lacteos:   { label: 'Lácteos',            emoji: '🥛', days: 5,  place: 'refri' },
  queso:     { label: 'Quesos',             emoji: '🧀', days: 10, place: 'refri' },
  carne:     { label: 'Carne',              emoji: '🥩', days: 3,  place: 'refri' },
  pollo:     { label: 'Pollo',              emoji: '🍗', days: 2,  place: 'refri' },
  pescado:   { label: 'Pescado',            emoji: '🐟', days: 2,  place: 'refri' },
  embutidos: { label: 'Embutidos',          emoji: '🥓', days: 5,  place: 'refri' },
  huevo:     { label: 'Huevo',              emoji: '🥚', days: 21, place: 'refri' },
  frutas:    { label: 'Frutas',             emoji: '🍓', days: 5,  place: 'refri' },
  verduras:  { label: 'Verduras',           emoji: '🥬', days: 5,  place: 'refri' },
  pan:       { label: 'Pan y tortillas',    emoji: '🫓', days: 4,  place: 'alacena' },
  salsas:    { label: 'Salsas y aderezos',  emoji: '🥫', days: 7,  place: 'refri' },
  sobras:    { label: 'Sobras',             emoji: '🍲', days: 3,  place: 'refri' },
  snacks:    { label: 'Botanas y cereales', emoji: '🍿', days: 30, place: 'alacena' },
  otros:     { label: 'Otros',              emoji: '🧺', days: 7,  place: 'refri' },
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

// `uses`: category keys, or `n:<word>` to match the item name (so Tortillas don't count as bread).
export const RECIPES = [
  { id: 'chilaquiles', name: 'Chilaquiles verdes', emoji: '🫓', min: 20, uses: ['n:tortilla', 'salsas', 'n:crema', 'queso', 'huevo'],
    ing: ['Tortillas del día anterior', 'Salsa verde', 'Crema', 'Queso', 'Huevo (opcional)'],
    steps: ['Corta las tortillas en triángulos y dóralas en poco aceite.', 'Agrega la salsa verde y deja que hierva 2 minutos.', 'Sirve con crema, queso y, si quieres, un huevo estrellado.'] },
  { id: 'licuado', name: 'Licuado de plátano y fresa', emoji: '🥤', min: 5, uses: ['n:plátano', 'n:fresa', 'n:leche', 'n:yogur'],
    ing: ['Leche o yogur', 'Plátano', 'Fresas', 'Miel al gusto'],
    steps: ['Lava y corta la fruta.', 'Licúa con la leche o el yogur.', 'Sirve frío. La fruta muy madura lo hace más dulce.'] },
  { id: 'omelette', name: 'Omelette de espinaca y queso', emoji: '🍳', min: 10, uses: ['huevo', 'n:espinaca', 'verduras', 'queso', 'n:jamón'],
    ing: ['2 huevos', 'Espinaca', 'Queso', 'Jamón (opcional)'],
    steps: ['Bate los huevos con sal.', 'Saltea la espinaca un minuto.', 'Vierte el huevo, agrega el queso y dobla a la mitad.'] },
  { id: 'molletes', name: 'Molletes', emoji: '🥖', min: 15, uses: ['n:pan', 'n:bolillo', 'queso', 'salsas', 'n:jitomate', 'n:frijol'],
    ing: ['Pan', 'Frijoles', 'Queso', 'Pico de gallo o salsa'],
    steps: ['Abre el pan y úntale frijoles.', 'Cubre con queso y gratina 8 minutos.', 'Termina con pico de gallo o salsa.'] },
  { id: 'arroz-pollo', name: 'Arroz con pollo', emoji: '🍛', min: 30, uses: ['pollo', 'n:arroz', 'verduras'],
    ing: ['Pollo', 'Arroz cocido', 'Verduras picadas', 'Caldo'],
    steps: ['Dora el pollo en trozos.', 'Agrega las verduras y el arroz.', 'Moja con caldo y cocina hasta que se absorba.'] },
  { id: 'pan-frances', name: 'Pan francés', emoji: '🍞', min: 15, uses: ['n:pan', 'n:leche', 'huevo', 'n:fresa', 'n:plátano'],
    ing: ['Pan de caja', 'Leche', 'Huevo', 'Canela', 'Fruta para servir'],
    steps: ['Mezcla leche, huevo y canela.', 'Remoja el pan y dóralo por ambos lados.', 'Sirve con fruta picada.'] },
  { id: 'sopa', name: 'Sopa de verduras', emoji: '🥣', min: 25, uses: ['verduras', 'n:jitomate'],
    ing: ['Verduras que tengas', 'Jitomate', 'Caldo', 'Sal y pimienta'],
    steps: ['Pica todas las verduras.', 'Licúa el jitomate y sofríelo.', 'Agrega caldo y verduras; hierve 15 minutos.'] },
  { id: 'quesadillas', name: 'Quesadillas', emoji: '🌮', min: 10, uses: ['n:tortilla', 'queso', 'embutidos', 'salsas'],
    ing: ['Tortillas', 'Queso', 'Jamón (opcional)', 'Salsa'],
    steps: ['Calienta la tortilla en el comal.', 'Agrega queso y jamón; dobla.', 'Voltea hasta que el queso se derrita.'] },
  { id: 'ensalada-pollo', name: 'Ensalada de pollo', emoji: '🥗', min: 15, uses: ['pollo', 'verduras', 'n:yogur', 'n:crema', 'n:aguacate'],
    ing: ['Pollo cocido', 'Verduras', 'Yogur o crema', 'Aguacate'],
    steps: ['Deshebra el pollo.', 'Mezcla con verduras picadas y yogur.', 'Sirve con aguacate.'] },
  { id: 'parfait', name: 'Parfait de yogur', emoji: '🍨', min: 5, uses: ['n:yogur', 'n:fresa', 'n:plátano', 'n:cereal', 'n:granola'],
    ing: ['Yogur natural', 'Fruta picada', 'Cereal o granola'],
    steps: ['Pon una capa de yogur en un vaso.', 'Agrega fruta y cereal.', 'Repite las capas y sirve.'] },
  { id: 'guacamole', name: 'Guacamole', emoji: '🥑', min: 10, uses: ['n:aguacate', 'n:jitomate', 'n:cebolla', 'n:totopo'],
    ing: ['Aguacate', 'Jitomate', 'Cebolla y cilantro', 'Limón', 'Totopos'],
    steps: ['Machaca el aguacate con limón y sal.', 'Agrega jitomate, cebolla y cilantro picados.', 'Sirve con totopos.'] },
  { id: 'tacos', name: 'Tacos de carne', emoji: '🌯', min: 20, uses: ['carne', 'n:tortilla', 'salsas'],
    ing: ['Carne', 'Tortillas', 'Cebolla y cilantro', 'Salsa'],
    steps: ['Cocina la carne con sal.', 'Calienta las tortillas.', 'Arma los tacos con cebolla, cilantro y salsa.'] },
];

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
