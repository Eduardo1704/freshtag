# FRESHTAG · App (prototipo funcional)

App web instalable (PWA) para simular y usar el sistema FRESHTAG: pinzas con NFC + app. Se abre con un enlace en cualquier celular, sin tiendas de apps.

**Qué hace**
- **Registro** del usuario (nombre, hogar, personas) con onboarding en 3 pasos: *Cierra el empaque · Acerca tu celular · Recibe el aviso*.
- **Lectura NFC**: botón central → acerca la pinza.
  - **Android + Chrome**: lee la etiqueta NFC real (Web NFC).
  - **iPhone / computadora**: modo simulación (eliges qué pinza acercaste). En iPhone, una etiqueta programada con el enlace de la pinza abre la app directo en esa pinza.
- Pinza **libre** → formulario para registrar el alimento (categoría, ubicación, fecha de apertura, días que dura). Pinza **en uso** → ficha del alimento.
- **Semáforo**: Fresco (más de 2 días) · Por vencer (0–2 días) · Vencido.
- **Despensa** con búsqueda y filtros por estado y por lugar (Refri, Congelador, Alacena).
- **Recetas** ordenadas por lo que está por vencer; «La cociné» marca esos alimentos como consumidos.
- **Impacto**: % aprovechado, gráfica por semana, lo que más se desperdicia e historial.
- **Avisos** (notificación diaria) y **Texto grande** en el perfil.

Los datos se guardan solo en el celular (`localStorage`); no hay servidor ni cuentas.

## Probarla en local

```bash
python -m http.server 8770 --directory 11-APPS/freshtag-app
```

Abre http://localhost:8770. En pantallas anchas la app aparece dentro de un marco de celular, con un QR al lado: sirve para proyectarla en la presentación.

## Publicarla (GitHub Pages)

Copia esta carpeta como `app/` dentro del repositorio del sitio (`Downloads/2026-10-16_freshtag_identidad_v01/web/freshtag-sitio`), haz commit y push. Queda en:

https://eduardo1704.github.io/freshtag/app/

El QR de `img/qr.svg` ya apunta a esa dirección. Web NFC y los avisos necesitan HTTPS, así que en GitHub Pages funcionan y en un servidor `http://` de red local no.

## Programar etiquetas NFC reales (para iPhone y Android)

Usa etiquetas **NTAG213 o NTAG215**. Graba un registro **URL** con el enlace de cada pinza:

| Pinza | Enlace |
|---|---|
| Crema | `https://eduardo1704.github.io/freshtag/app/#/tag/FT-CREMA` |
| Verde | `https://eduardo1704.github.io/freshtag/app/#/tag/FT-VERDE` |
| Coral | `https://eduardo1704.github.io/freshtag/app/#/tag/FT-CORAL` |

Hay dos formas de grabarlas:
- **Desde la app** en Android con Chrome: Perfil → Mis pinzas → ícono de lápiz → acerca la etiqueta.
- **Con la app NFC Tools** (iPhone o Android): Escribir → Agregar un registro → URL → pega el enlace → Escribir → acerca la etiqueta.

Al acercar el celular a una etiqueta grabada se abre FRESHTAG en esa pinza:
- Si la pinza ya tiene un alimento, muestra su ficha.
- Si está libre, abre el formulario para registrar uno.

En iPhone la lectura en segundo plano funciona desde el iPhone XS; no hace falta abrir la app antes.

## Guion de demo (2 minutos)

1. Abre la app → onboarding → «Crea tu cocina» con «Cargar cocina de ejemplo» activado.
2. **Inicio**: hay alimentos en los tres estados. Toca «Vencidos» y abre uno. Toca «Lo tiré»: se registra y la pinza queda libre.
3. Botón central → acerca la **pinza coral** (o elígela en la simulación) → registra «Plátano» → aparece en «Vence pronto».
4. Acerca la **pinza verde** → abre la ficha del cereal → «Lo consumí» (confeti y la pinza se libera).
5. **Recetas** → abre la primera → «La cociné» → los alimentos por vencer pasan a aprovechados.
6. **Impacto** → el % y la gráfica ya incluyen lo que hiciste.

## Limitaciones del prototipo

- Sin cuentas ni sincronización: cada celular tiene su propia cocina.
- Los avisos salen cuando se abre la app; para avisos con la app cerrada hace falta un servidor de notificaciones push. En iPhone, los avisos requieren agregar la app a la pantalla de inicio (iOS 16.4 o posterior).
- Los días de duración por categoría son estimaciones caseras; el usuario los ajusta y la app pide revisar la etiqueta del empaque.

## Archivos

| Archivo | Contenido |
|---|---|
| `index.html` | Marco y vista de escritorio |
| `css/app.css` | Tokens del manual de marca, componentes y animaciones |
| `css/fonts.css` | Vice City Sans + DM Sans incrustadas |
| `js/app.js` | Vistas, estado, NFC, avisos |
| `js/data.js` | Categorías, recetas, kit de pinzas y datos de ejemplo |
| `sw.js` | Uso sin conexión y clic en notificaciones |
| `manifest.webmanifest` | Instalación en la pantalla de inicio |
