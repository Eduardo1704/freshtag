// FRESHTAG app · single-page PWA. State lives in localStorage; NFC uses Web NFC when the browser has it
// (Chrome on Android) and a simulated reader otherwise. Tags carry a link like .../#/tag/FT-VERDE, so on
// iPhone touching a programmed pinza opens the app straight on that pinza.
import { CATS, PLACES, FREEZER_DAYS, QUICK, KIT, RECIPES, demoSeed } from './data.js';

const KEY = 'freshtag:v1';
const DAY = 864e5;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9);
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const diff = (a, b) => Math.round((a - b) / DAY);
const fmt = d => d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const NFC = 'NDEFReader' in window;
const tagLink = id => `${location.origin}${location.pathname}#/tag/${id}`;

// ---------- icons (Lucide-style strokes) ----------
const P = {
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  box: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
  nfc: '<path d="M6 8.32a7.43 7.43 0 0 1 0 7.36"/><path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58"/><path d="M12.91 4.1a15.91 15.91 0 0 1 .01 15.8"/><path d="M16.37 2a20.16 20.16 0 0 1 0 20"/>',
  chef: '<path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/>',
  chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14M12 5v14"/>', minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="M20 6 9 17l-5-5"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  right: '<path d="m9 18 6-6-6-6"/>', clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r="1"/>',
  write: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};
const I = new Proxy({}, { get: (_, k) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${P[k] || ''}</svg>` });

// ---------- state ----------
const fresh = () => ({ user: null, pinzas: KIT.map(p => ({ ...p })), items: [], log: [], prefs: { bigText: false, notif: false, theme: 'dark' }, notified: '' });
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch { S = fresh(); }
S.prefs.theme ||= 'dark';
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode: state stays in memory */ } };

const ui = { tab: 'inicio', filter: 'todos', place: 'todo', q: '', onb: 0, pendingTag: null };

function loadDemo() {
  const t = today(), { items, log } = demoSeed();
  S.pinzas = KIT.map(p => ({ ...p }));
  S.items = items.map(i => ({ id: uid(), name: i.name, cat: i.cat, place: i.place, days: i.days, pinza: i.pinza, opened: iso(addDays(t, -i.ago)) }));
  S.log = log.map(l => ({ id: uid(), name: l.name, cat: l.cat, action: l.action, date: iso(addDays(t, -l.ago)) }));
  save();
}

// ---------- domain ----------
const STATE = {
  fresco: { label: 'Fresco', many: 'Frescos' },
  porvencer: { label: 'Por vencer', many: 'Por vencer' },
  vencido: { label: 'Vencido', many: 'Vencidos' },
};
const COLOR = { fresco: 'var(--fresco)', porvencer: 'var(--porvencer)', vencido: 'var(--vencido)' };

function info(it) {
  const exp = addDays(parse(it.opened), it.days);
  const left = diff(exp, today());
  const state = left < 0 ? 'vencido' : left <= 2 ? 'porvencer' : 'fresco';
  return { exp, left, state, pct: Math.max(0, Math.min(1, left / it.days)), ago: diff(today(), parse(it.opened)) };
}
const leftText = l => l < 0 ? `Venció hace ${plural(-l, 'día', 'días')}` : l === 0 ? 'Vence hoy' : l === 1 ? 'Vence mañana' : `${l} días`;
const agoText = a => a <= 0 ? 'abierto hoy' : a === 1 ? 'abierto ayer' : `abierto hace ${a} días`;
const sorted = () => S.items.map(it => ({ it, ...info(it) })).sort((a, b) => a.left - b.left);
const counts = () => sorted().reduce((c, x) => (c[x.state]++, c), { fresco: 0, porvencer: 0, vencido: 0 });
const pinzaOf = id => S.pinzas.find(p => p.id === id);
const itemOn = pid => S.items.find(i => i.pinza === pid);
const first = () => (S.user?.name || '').trim().split(/\s+/)[0];

function matchRecipes() {
  const pool = sorted().filter(x => x.state !== 'vencido');
  return RECIPES.map(r => {
    const used = pool.filter(({ it }) => r.uses.some(u => u.startsWith('n:') ? norm(it.name).includes(norm(u.slice(2))) : it.cat === u));
    const score = used.reduce((s, x) => s + (x.state === 'porvencer' ? 3 : 1), 0);
    return { r, used, score, hot: used.filter(x => x.state === 'porvencer').length };
  }).sort((a, b) => b.score - a.score);
}

// ---------- small render helpers ----------
function ring(pct, color, size = 42, stroke = 5, inner = '') {
  const r = (size - stroke) / 2, len = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}">
    <circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
    <circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke="${color}"
      stroke-dasharray="${len}" stroke-dashoffset="${len * (1 - Math.max(pct, .02))}" style="--len:${len}"/></svg><span>${inner}</span></div>`;
}
function donut(parts, total, label, cls = '', track = 'rgba(255,255,255,.14)') {
  const r = 44, len = 2 * Math.PI * r, gap = parts.filter(p => p.v).length > 1 ? 10 : 0;
  let off = 0;
  const arcs = parts.filter(p => p.v).map(p => {
    const l = Math.max(len * p.v / total - gap, 2);
    const s = `<circle class="seg-arc" cx="50" cy="50" r="${r}" stroke="${p.c}" stroke-dasharray="${l} ${len}" stroke-dashoffset="${-off}"/>`;
    off += len * p.v / total; return s;
  }).join('');
  return `<div class="donut ${cls}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="${r}" stroke="${track}"/>${arcs}</svg>
    <div class="lbl">${label}</div></div>`;
}
// number-flow: each digit is a 0–9 strip that springs to its value (and from the old value on change)
const DIGITS = [...'0123456789'].map(d => `<span>${d}</span>`).join('');
const roll = (n, key) => { const s = String(n); return `<span class="roll" data-key="${key}" data-v="${s}" aria-label="${s}">${[...s].map(ch => /\d/.test(ch)
  ? `<span class="rd" aria-hidden="true"><span style="--d:${ch}">${DIGITS}</span></span>` : `<span aria-hidden="true">${ch}</span>`).join('')}</span>`; };
const seen = {};
function settleRolls(root, fresh) {
  root.querySelectorAll('.roll[data-key]').forEach(el => {
    const { key, v } = el.dataset, prev = seen[key]; seen[key] = v;
    if (fresh || prev === undefined || prev === v) return;
    const strips = [...el.querySelectorAll('.rd > span')], nd = strips.length;
    const old = prev.replace(/\D/g, '').padStart(nd, '0').slice(-nd), now = v.replace(/\D/g, '');
    strips.forEach((s, i) => { s.style.transition = 'none'; s.style.setProperty('--d', old[i]); });
    void el.offsetWidth;
    strips.forEach((s, i) => { s.style.transition = ''; s.style.setProperty('--d', now[i]); });
  });
}
// staggered blur-in title (ReactiCX staggered-text)
const split = t => `<span aria-hidden="true">${[...t].map((c, i) => `<span class="ch" style="--c:${i}">${esc(c)}</span>`).join('')}</span>`;
const title = t => `<h1 class="title" aria-label="${esc(t)}">${split(t)}</h1>`;
const logoSrc = () => S.prefs.theme === 'light' ? 'img/logo.svg' : 'img/logo-negativo.svg';
const pz = p => p ? `<span class="pz pz-${p.color}"></span>` : '';
const pinzaImg = p => ['crema', 'verde', 'coral'].includes(p.color)
  ? `<img src="img/pinza-${p.color}.jpg" alt="">` : `<div class="ph"><img src="img/isotipo.svg" alt=""></div>`;
const stateTag = s => `<span class="state c-${s}"><span class="dot bg-${s}"></span>${STATE[s].label}</span>`;

// swipe right = lo consumí, swipe left = lo tiré (gesture handled in the pointer listeners below)
function itemCard(x, i = 0) {
  const { it, state, left, pct, ago } = x, p = pinzaOf(it.pinza);
  return `<div class="swipe-wrap" style="--i:${i}"><div class="swipe-bg" aria-hidden="true"><span class="ok">${I.check} Lo consumí</span><span class="no">Lo tiré ${I.trash}</span></div>
    <button class="item glass s-${state}" data-act="item" data-swipe data-id="${it.id}">
    <span class="bubble">${CATS[it.cat]?.emoji || '🧺'}</span>
    <span><b>${esc(it.name)}</b><span class="meta">${PLACES[it.place].label} · ${agoText(ago)}${p ? ` · ${pz(p)} ${esc(p.name.replace('Pinza ', ''))}` : ''}</span></span>
    <span class="right">${stateTag(state)}<span class="left num">${left < 0 ? `hace ${plural(-left, 'día', 'días')}` : leftText(left)}</span></span>
    <span class="bar"><i style="width:${Math.max(pct, .04) * 100}%"></i></span>
  </button></div>`;
}

// ---------- views ----------
function viewInicio() {
  const all = sorted(), c = counts(), total = all.length, name = first();
  const soon = all.filter(x => x.state !== 'vencido').slice(0, 8);
  const top = matchRecipes().find(m => m.used.length);
  const month = S.log.filter(l => diff(today(), parse(l.date)) < 30);
  const saved = month.filter(l => l.action === 'consumido').length;
  const head = `<header class="top" style="--i:0">
      <div><p class="hello">Hola, ${esc(name)}</p>${title('Mi cocina')}</div>
      <div class="top-actions">
        <button class="icon-btn glass press" data-act="alerts" aria-label="Avisos">${I.bell}${c.porvencer + c.vencido ? `<span class="badge num">${c.porvencer + c.vencido}</span>` : ''}</button>
        <button class="avatar press" data-act="profile" aria-label="Perfil">${esc(name[0] || 'F').toUpperCase()}</button>
      </div></header>`;
  if (!total) return head + `<div class="empty glass" style="--i:1"><img src="img/isotipo.svg" alt="">
      <b>Tu cocina está vacía</b><p>Cierra un empaque con tu pinza FRESHTAG y acerca el celular para registrarlo.</p>
      <button class="btn btn-primary" data-act="scan">${I.nfc} Acerca tu celular</button>
      <p style="margin:14px 0 0"><button class="link" data-act="add">o agrégalo sin pinza ${I.right}</button></p></div>`;
  const heroTitle = c.porvencer
    ? `<span class="num">${roll(c.porvencer, 'hero')}</span> ${c.porvencer === 1 ? 'alimento' : 'alimentos'} por vencer`
    : c.vencido ? 'Revisa lo que ya venció' : 'Todo está fresco';
  return head + `
    <section class="hero glass beam" style="--i:1">
      <img class="hero-iso" src="img/isotipo.svg" alt="">
      <div><p class="eyebrow">Úsalo primero</p><h2>${heroTitle}</h2>
        <p>${soon[0] ? `${esc(soon[0].it.name)}: ${leftText(soon[0].left).toLowerCase()}` : 'Sigue registrando tus empaques.'}</p>
        <button class="btn btn-coral press" data-act="scan">${I.nfc} Acerca tu celular</button></div>
      ${donut([{ v: c.fresco, c: '#5FC3A0' }, { v: c.porvencer, c: '#F2B652' }, { v: c.vencido, c: '#FF7A66' }], total,
        `<b class="num">${roll(total, 'total')}</b><small>en tu cocina</small>`)}
    </section>
    <div class="stats3" style="--i:2">
      ${['fresco', 'porvencer', 'vencido'].map(s => `<button class="stat glass press" data-act="filter" data-f="${s}"><b class="num c-${s}">${roll(c[s], 'st-' + s)}</b><span>${STATE[s].many}</span></button>`).join('')}
    </div>
    ${c.vencido ? `<button class="notice glass press" data-act="filter" data-f="vencido" style="--i:3">${I.alert}<span><b>${plural(c.vencido, 'alimento vencido', 'alimentos vencidos')}</b><span>Revísalo y registra si lo usaste o lo tiraste.</span></span>${I.right}</button>` : ''}
    <section class="sec" style="--i:4"><div class="sec-head"><h3>Vence pronto</h3><button class="link" data-act="tab" data-tab="despensa">Ver todo ${I.right}</button></div>
      <div class="hscroll">${soon.map(x => `<button class="mini glass press" data-act="item" data-id="${x.it.id}">
        <span class="row"><span class="emoji">${CATS[x.it.cat]?.emoji || '🧺'}</span>${ring(x.pct, COLOR[x.state], 42, 5, `<span class="num c-${x.state}">${Math.max(x.left, 0)}</span>`)}</span>
        <b>${esc(x.it.name)}</b><small class="c-${x.state}">${leftText(x.left)}</small></button>`).join('')}</div>
    </section>
    ${top ? `<section class="sec" style="--i:5"><div class="sec-head"><h3>Cocina hoy</h3><button class="link" data-act="tab" data-tab="recetas">Más recetas ${I.right}</button></div>
      <button class="feature glass press" data-act="recipe" data-id="${top.r.id}"><span class="tile">${top.r.emoji}</span>
        <span><b>${top.r.name}</b><p>Usa lo que está por vencer · <span class="num">${top.r.min}</span> min</p>
        <span class="tags">${top.used.slice(0, 3).map(x => `<span class="tag ${x.state === 'porvencer' ? 'hot' : ''}">${esc(x.it.name)}</span>`).join('')}</span></span></button></section>` : ''}
    <section class="sec" style="--i:6"><button class="impact-mini glass press" data-act="tab" data-tab="impacto">
      ${I.leaf}<span><b class="num">${roll(saved, 'saved')}</b></span><span>${saved === 1 ? 'alimento aprovechado' : 'alimentos aprovechados'} en los últimos 30 días. Ver tu impacto.</span></button></section>`;
}

function viewDespensa() {
  const all = sorted(), byPlace = p => all.filter(x => p === 'todo' || x.it.place === p).length;
  return `<header class="top" style="--i:0"><div>${title('Despensa')}<p class="sub">${plural(all.length, 'alimento registrado', 'alimentos registrados')}</p></div>
      <button class="icon-btn glass press" data-act="add" aria-label="Agregar alimento">${I.plus}</button></header>
    <label class="search" style="--i:1"><span class="sr">Buscar</span>${I.search}<input class="input" id="q" type="search" placeholder="Buscar alimento" value="${esc(ui.q)}" autocomplete="off"></label>
    <div class="seg" style="--i:2" data-seg="place"><span class="knob"></span>${[['todo', 'Todo'], ...Object.entries(PLACES).map(([k, v]) => [k, v.label])].map(([k, l]) =>
      `<button class="${ui.place === k ? 'on' : ''}" data-act="place" data-p="${k}" aria-label="${l}: ${byPlace(k)}">${l}</button>`).join('')}</div>
    <div class="chips" style="--i:3;margin-top:12px">${[['todos', 'Todos'], ['fresco', 'Frescos'], ['porvencer', 'Por vencer'], ['vencido', 'Vencidos']].map(([k, l]) =>
      `<button class="chip ${ui.filter === k ? 'on' : ''}" data-act="filter" data-f="${k}">${k !== 'todos' ? `<span class="dot bg-${k}"></span>` : ''}${l}</button>`).join('')}</div>
    <div id="list" style="--i:4">${listHTML()}</div>
    ${all.length ? `<p class="swipe-hint" style="--i:5"><i></i>Desliza → si lo consumiste · ← si lo tiraste</p>` : ''}`;
}
function listHTML() {
  const q = ui.q.trim().toLowerCase();
  const rows = sorted().filter(x => (ui.filter === 'todos' || x.state === ui.filter) && (ui.place === 'todo' || x.it.place === ui.place)
    && (!q || x.it.name.toLowerCase().includes(q) || CATS[x.it.cat]?.label.toLowerCase().includes(q)));
  if (!rows.length) return `<div class="empty glass" style="margin-top:14px"><img src="img/isotipo.svg" alt=""><b>${S.items.length ? 'Nada por aquí' : 'Aún no registras alimentos'}</b>
    <p>${S.items.length ? 'Prueba con otro filtro o búsqueda.' : 'Cierra un empaque con tu pinza y acerca el celular.'}</p>
    <button class="btn btn-primary" data-act="add">${I.plus} Agregar alimento</button></div>`;
  return `<div class="list">${rows.map((x, i) => itemCard(x, i)).join('')}</div>`;
}

function viewRecetas() {
  const ms = matchRecipes(), hot = sorted().filter(x => x.state === 'porvencer');
  return `<header class="top" style="--i:0"><div>${title('Recetas')}<p class="sub">Cocina primero lo que está por vencer</p></div></header>
    ${hot.length ? `<div class="use-first glass" style="--i:1"><b>Úsalo primero</b><div class="tags">${hot.map(x => `<span class="tag">${CATS[x.it.cat]?.emoji} ${esc(x.it.name)} · ${leftText(x.left).toLowerCase()}</span>`).join('')}</div></div>` : ''}
    <div class="recipes">${ms.map((m, i) => `<button class="feature glass press recipe ${i === 0 && m.hot ? 'top' : ''}" data-act="recipe" data-id="${m.r.id}" style="--i:${i + 2}">
      <span class="tile">${m.r.emoji}</span><span><b>${m.r.name}</b>
      <span class="meta-line">${I.clock}<span class="num">${m.r.min} min</span>${m.used.length ? `· ${m.used.length === 1 ? 'usa 1 de tus alimentos' : `usa ${m.used.length} de tus alimentos`}` : '· te faltan ingredientes'}</span>
      <span class="tags">${m.used.slice(0, 4).map(x => `<span class="tag ${x.state === 'porvencer' ? 'hot' : ''}">${esc(x.it.name)}</span>`).join('')}</span></span></button>`).join('')}</div>`;
}

function viewImpacto() {
  const t = today(), recent = S.log.filter(l => diff(t, parse(l.date)) < 30);
  const ok = recent.filter(l => l.action === 'consumido').length, bad = recent.length - ok;
  const rate = recent.length ? Math.round(ok / recent.length * 100) : 0;
  const weeks = [...Array(6)].map((_, w) => {
    const inW = S.log.filter(l => { const d = diff(t, parse(l.date)); return d >= (5 - w) * 7 && d < (6 - w) * 7; });
    return { ok: inW.filter(l => l.action === 'consumido').length, bad: inW.filter(l => l.action === 'desechado').length, label: w === 5 ? 'Esta' : `-${5 - w}` };
  });
  const max = Math.max(1, ...weeks.map(w => w.ok + w.bad));
  const lost = Object.entries(S.log.filter(l => l.action === 'desechado').reduce((m, l) => (m[l.cat] = (m[l.cat] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const lmax = Math.max(1, ...lost.map(l => l[1]));
  return `<header class="top" style="--i:0"><div>${title('Impacto')}<p class="sub">Tus últimos 30 días</p></div>
      <button class="avatar press" data-act="profile" aria-label="Perfil">${esc(first()[0] || 'F').toUpperCase()}</button></header>
    <section class="big-card glass" style="--i:1"><div class="impact-top">
      ${donut([{ v: ok, c: 'var(--fresco)' }, { v: bad, c: 'var(--coral)' }], Math.max(1, ok + bad), `<b class="num c-fresco">${roll(rate + '%', 'rate')}</b><small>aprovechado</small>`, 'green', 'var(--glass-2)')}
      <div><h2>${recent.length ? (rate >= 75 ? '¡Vas muy bien!' : 'Vas mejorando') : 'Aún sin registros'}</h2>
        <p>${recent.length ? `De lo que registraste, aprovechaste <b class="num">${rate}%</b> antes de que se echara a perder.` : 'Cuando marques un alimento como consumido o desechado, aquí verás tu avance.'}</p></div></div>
      <div class="duo"><div><b class="num c-fresco">${roll(ok, 'ok')}</b><span>aprovechados</span></div><div><b class="num c-vencido">${roll(bad, 'bad')}</b><span>desechados</span></div></div>
    </section>
    <section class="sec big-card glass" style="--i:2"><div class="sec-head"><h3>Por semana</h3></div>
      <div class="bars">${weeks.map((w, i) => `<div class="col"><div class="stack" style="--d:${i}">
        ${w.ok ? `<i class="bg-fresco" style="height:${w.ok / max * 120}px;--d:${i}"></i>` : ''}${w.bad ? `<i style="background:var(--coral);height:${w.bad / max * 120}px;--d:${i}"></i>` : ''}</div>
        <small class="num">${w.label}</small></div>`).join('')}</div>
      <div class="legend"><span><span class="dot bg-fresco"></span>Aprovechado</span><span><span class="dot" style="background:var(--coral)"></span>Desechado</span></div>
    </section>
    ${lost.length ? `<section class="sec big-card glass" style="--i:3"><div class="sec-head"><h3>Lo que más se te pasa</h3></div>
      ${lost.map(([cat, n]) => `<div class="hbar"><span style="font-size:1.4rem">${CATS[cat]?.emoji}</span><span><small>${CATS[cat]?.label}</small><span class="track"><i style="width:${n / lmax * 100}%"></i></span></span><b class="num">${n}</b></div>`).join('')}
      <p class="hint" style="margin:12px 0 0">Tip: pon una pinza a estos alimentos en cuanto los abras.</p></section>` : ''}
    <section class="sec facts" style="--i:4">
      <div class="fact glass"><b class="num">80 kg</b><p>de alimento desperdicia al año cada persona en México.</p><small>Fuente: investigación del Parcial 1</small></div>
      <div class="fact glass"><b class="num">90.7%</b><p>de los hogares reporta desperdicio, sobre todo frutas y verduras.</p><small>Fuente: investigación del Parcial 1</small></div>
    </section>
    ${S.log.length ? `<section class="sec big-card glass" style="--i:5"><div class="sec-head"><h3>Historial</h3></div><div class="history">
      ${S.log.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map(l => `<div class="h"><span>${CATS[l.cat]?.emoji || '🧺'}</span>
        <span>${esc(l.name)}<br><small>${fmt(parse(l.date))}</small></span><span class="state ${l.action === 'consumido' ? 'c-fresco' : 'c-vencido'}">${l.action === 'consumido' ? 'Aprovechado' : 'Desechado'}</span></div>`).join('')}
    </div></section>` : ''}`;
}

const VIEWS = { inicio: viewInicio, despensa: viewDespensa, recetas: viewRecetas, impacto: viewImpacto };
const TABS = [['inicio', 'home', 'Inicio'], ['despensa', 'box', 'Despensa'], null, ['recetas', 'chef', 'Recetas'], ['impacto', 'chart', 'Impacto']];

// ---------- onboarding ----------
const SLIDES = [
  { t: 'Cierra el empaque', p: 'Al abrir un alimento, ciérralo con una pinza FRESHTAG. Abraza el empaque y lo mantiene fresco.', art: () => `<img class="art-kit" src="img/pinza-kit.jpg" alt="Pinzas FRESHTAG en crema, verde y coral cerrando empaques">` },
  { t: 'Acerca tu celular', p: 'Cada pinza tiene una etiqueta NFC sin baterías. Tu celular la lee y registra el alimento y la fecha en que lo abriste.', art: () => `<div class="art-nfc"><span class="wave"></span><span class="wave"></span><span class="wave"></span><img class="p" src="img/pinza-verde.jpg" alt=""><span class="phone">${I.nfc}</span></div>` },
  { t: 'Recibe el aviso', p: 'Te avisamos antes de que caduque y te sugerimos recetas con lo que está por vencer.', art: () => `<div class="art-alert">${[
    ['🥛', 'Leche', 'porvencer', 'Vence mañana', .2], ['🍓', 'Fresas', 'fresco', '3 días', .6], ['🥛', 'Crema', 'vencido', 'Venció hace 2 días', 0]].map(([e, n, s, l, w]) =>
    `<div class="item glass s-${s}"><span class="bubble">${e}</span><span><b>${n}</b><span class="meta">Refri</span></span><span class="right">${stateTag(s)}<span class="left num">${l}</span></span><span class="bar"><i style="width:${Math.max(w, .04) * 100}%"></i></span></div>`).join('')}</div>` },
];
function viewOnb() {
  if (ui.onb < SLIDES.length) {
    const s = SLIDES[ui.onb];
    return `<div class="onb"><div class="onb-top"><img src="${logoSrc()}" alt="FRESHTAG"><button data-act="onb-skip">Saltar</button></div>
      <div class="art slide" key="${ui.onb}">${s.art()}</div>
      <div class="slide"><div class="dots">${SLIDES.map((_, i) => `<i class="${i === ui.onb ? 'on' : ''}"></i>`).join('')}<i></i></div>
        <h1>${s.t}</h1><p class="lead">${s.p}</p></div>
      <button class="btn btn-primary block press" style="margin-top:26px" data-act="onb-next">${ui.onb === SLIDES.length - 1 ? 'Crear mi cocina' : 'Siguiente'} ${I.right}</button></div>`;
  }
  return `<form class="onb reg slide" id="reg" novalidate><div class="onb-top"><img src="${logoSrc()}" alt="FRESHTAG"></div>
    <div class="dots">${SLIDES.map(() => '<i></i>').join('')}<i class="on"></i></div>
    <h1>Crea tu cocina</h1><p class="lead">Solo necesitamos tu nombre. Todo se guarda en este celular.</p>
    <label class="field"><span>Tu nombre</span><input class="input" name="name" autocomplete="given-name" placeholder="Ej. Eduardo" required></label>
    <label class="field"><span>Nombre de tu hogar <span class="hint">(opcional)</span></span><input class="input" name="home" placeholder="Ej. Depa Roma"></label>
    <div class="field"><span>¿Cuántas personas viven contigo?</span><div class="stepper">
      <button type="button" data-act="people" data-d="-1" aria-label="Menos">${I.minus}</button><output id="people" class="num">2</output>
      <button type="button" data-act="people" data-d="1" aria-label="Más">${I.plus}</button></div></div>
    <button type="button" class="check on" data-act="demo-toggle" id="demo"><span class="box">${I.check}</span><span><b>Cargar cocina de ejemplo</b><br><span class="hint">Para probar la app con alimentos en los tres estados.</span></span></button>
    <div style="flex:1;min-height:20px"></div>
    <button class="btn btn-primary block press" type="submit" style="margin-top:22px">Empezar ${I.right}</button></form>`;
}

// ---------- render ----------
const TITLES = { inicio: 'Mi cocina', despensa: 'Despensa', recetas: 'Recetas', impacto: 'Impacto' };
function applyTheme() {
  const r = document.documentElement;
  r.dataset.theme = S.prefs.theme; r.classList.toggle('big', !!S.prefs.bigText);
  $('meta[name=theme-color]')?.setAttribute('content', S.prefs.theme === 'light' ? '#F4F0E6' : '#071226');
  const desk = $('.desk .logo'); if (desk) desk.src = logoSrc();
}
function render(animate = false) {
  applyTheme();
  const app = $('#app');
  if (!S.user) { app.innerHTML = viewOnb(); return; }
  if (!$('#view')) {
    app.innerHTML = `<main id="view" class="view"></main><div class="minibar" aria-hidden="true"></div>
      <nav class="tabbar glass" aria-label="Secciones"><span class="ind"></span>${TABS.map(t => t
      ? `<button class="tab" data-act="tab" data-tab="${t[0]}"><span class="pill">${I[t[1]]}</span>${t[2]}</button>`
      : `<button class="fab" data-act="scan" aria-label="Acerca tu celular a una pinza">${I.nfc}</button>`).join('')}</nav>`;
    $('#view').addEventListener('scroll', e => app.classList.toggle('scrolled', e.target.scrollTop > 64), { passive: true });
    animate = true;
  }
  const v = $('#view');
  v.innerHTML = VIEWS[ui.tab]();
  $('.minibar').textContent = TITLES[ui.tab];
  if (animate) { v.classList.remove('anim'); void v.offsetWidth; v.classList.add('anim'); clearTimeout(render.t); render.t = setTimeout(() => v.classList.remove('anim'), 1600); }
  settleRolls(v, animate);
  v.querySelectorAll('[data-seg]').forEach(placeKnob);
  document.querySelectorAll('.tab').forEach(b => { b.classList.toggle('on', b.dataset.tab === ui.tab); b.setAttribute('aria-current', b.dataset.tab === ui.tab ? 'page' : 'false'); });
  placeInd();
}
// masked tab bar: the glass disc springs to the active tab and stretches on the way (gooey)
function placeInd() {
  const ind = $('.tabbar .ind'), on = $(`.tab[data-tab="${ui.tab}"]`); if (!ind || !on) return;
  const x = on.offsetLeft + (on.offsetWidth - 64) / 2, from = Number(ind.dataset.x);
  if (ind.dataset.x && from !== x) ind.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${(from + x) / 2}px) scaleX(1.4)`, offset: .45 }, { transform: `translateX(${x}px)` }],
    { duration: 560, easing: 'cubic-bezier(.34,1.2,.64,1)' });
  ind.style.transform = `translateX(${x}px)`; ind.dataset.x = x;
}
// segmented controls: the knob slides from where it was before the re-render
const knobAt = {};
function placeKnob(seg) {
  const k = $('.knob', seg), on = $('button.on', seg); if (!k || !on) return;
  const key = seg.dataset.seg, x = on.offsetLeft, prev = knobAt[key];
  k.style.width = on.offsetWidth + 'px';
  if (prev !== undefined && prev !== x) { k.style.transition = 'none'; k.style.transform = `translateX(${prev}px)`; void k.offsetWidth; k.style.transition = ''; }
  k.style.transform = `translateX(${x}px)`; knobAt[key] = x;
}
window.addEventListener('resize', () => { placeInd(); document.querySelectorAll('[data-seg]').forEach(placeKnob); });
function go(tab) {
  if (tab === ui.tab) { $('#view')?.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  ui.tab = tab; render(true); $('#view').scrollTop = 0; $('#app').classList.remove('scrolled');
}
const refresh = () => { save(); if ($('#view')) render(); };

// ---------- sheets ----------
let sheetCtx = null;
function openSheet(html, ctx = {}) {
  const root = $('#sheet-root');
  const wasOpen = root.classList.contains('open');
  root.innerHTML = `<div class="scrim" data-act="close"></div><section class="sheet" role="dialog" aria-modal="true">
    <div class="grip" aria-hidden="true"></div><button class="close" data-act="close" aria-label="Cerrar">${I.x}</button><div class="sheet-body">${html}</div></section>`;
  sheetCtx = ctx;
  if (wasOpen) root.classList.add('open'); else requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
  dragToClose(root);
}
function closeSheet() {
  const root = $('#sheet-root');
  if (!root.classList.contains('open')) return;
  root.classList.remove('open'); root.style.removeProperty('--drag'); sheetCtx = null;
  setTimeout(() => { if (!root.classList.contains('open')) root.innerHTML = ''; }, 450);
}
function dragToClose(root) {
  const grip = $('.grip', root); let y0 = null;
  grip.addEventListener('pointerdown', e => { y0 = e.clientY; grip.setPointerCapture(e.pointerId); root.classList.add('dragging'); });
  grip.addEventListener('pointermove', e => { if (y0 !== null) root.style.setProperty('--drag', Math.max(0, e.clientY - y0) + 'px'); });
  const end = e => { if (y0 === null) return; const dy = e.clientY - y0; y0 = null; root.classList.remove('dragging');
    if (dy > 110) closeSheet(); else root.style.setProperty('--drag', '0px'); };
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
}
const setBody = html => { const b = $('#sheet-root .sheet-body'); if (b) b.innerHTML = html; };

function openItem(id) {
  const it = S.items.find(i => i.id === id); if (!it) return;
  const x = info(it), p = pinzaOf(it.pinza), cat = CATS[it.cat];
  const big = x.left < 0 ? `<b class="num c-vencido">${-x.left}</b><small>${-x.left === 1 ? 'día vencido' : 'días vencido'}</small>`
    : x.left === 0 ? `<b class="c-porvencer">Hoy</b><small>vence</small>` : `<b class="num c-${x.state}">${x.left}</b><small>${x.left === 1 ? 'día restante' : 'días restantes'}</small>`;
  openSheet(`<div class="d-head"><span class="bubble">${cat?.emoji || '🧺'}</span><div><h2>${esc(it.name)}</h2>${stateTag(x.state)}</div></div>
    <div class="d-ring">${ring(x.pct, COLOR[x.state], 168, 12, big)}</div>
    <div class="rows glass">
      <div class="r"><span>Abierto</span><b>${fmt(parse(it.opened))}</b></div>
      <div class="r"><span>Caduca</span><b class="c-${x.state}">${fmt(x.exp)}</b></div>
      <div class="r"><span>Categoría</span><b>${cat?.label}</b></div>
      <div class="r"><span>Ubicación</span><b>${PLACES[it.place].label}</b></div>
      <div class="r"><span>Pinza</span><b>${p ? `${pz(p)} ${esc(p.name)}` : 'Sin pinza'}</b></div>
    </div>
    ${x.state === 'vencido' ? `<p class="hint" style="margin:12px 2px 0">Revisa la fecha del empaque. Si tiene mal olor, color o textura, no lo consumas y regístralo como desechado.</p>` : ''}
    <div class="actions two"><button class="btn btn-green press" data-act="consume" data-id="${it.id}">${I.check} Lo consumí</button>
      <button class="btn btn-danger press" data-act="discard" data-id="${it.id}">${I.trash} Lo tiré</button></div>
    <div class="actions" style="margin-top:10px"><button class="btn btn-ghost" data-act="edit" data-id="${it.id}">${I.edit} Editar</button></div>`, { item: id });
}

// form state for add/edit
let F = null;
function openForm(init = {}) {
  const edit = init.id ? S.items.find(i => i.id === init.id) : null;
  F = edit ? { ...edit } : { id: null, name: '', cat: 'lacteos', place: 'refri', opened: iso(today()), days: CATS.lacteos.days, pinza: init.pinza ?? null, touchedDays: false };
  delete knobAt.fplace;
  openSheet(formHTML(), { form: true }); bindForm();
  requestAnimationFrame(() => document.querySelectorAll('#sheet-root [data-seg]').forEach(placeKnob));
}
function formHTML() {
  const free = S.pinzas.filter(p => !itemOn(p.id) || itemOn(p.id).id === F.id);
  const x = info(F), p = pinzaOf(F.pinza), sugg = F.place === 'congelador' ? FREEZER_DAYS : CATS[F.cat].days;
  return `<h2>${F.id ? 'Editar alimento' : 'Registrar alimento'}</h2>
    ${p ? `<span class="pin-chip">${pz(p)} Con ${esc(p.name.toLowerCase())}</span>` : '<p class="hint" style="margin:0">Sin pinza: lo registras a mano.</p>'}
    <label class="field"><span>¿Qué abriste?</span><input class="input" id="f-name" value="${esc(F.name)}" placeholder="Ej. Leche" autocomplete="off" enterkeyhint="done"></label>
    ${F.id ? '' : `<div class="chips" style="margin-top:10px">${QUICK.map(([n, c]) => `<button class="chip" data-act="quick" data-n="${esc(n)}" data-c="${c}">${CATS[c].emoji} ${n}</button>`).join('')}</div>`}
    <div class="field"><span>Categoría</span><div class="pick-grid">${Object.entries(CATS).map(([k, c]) =>
      `<button class="cat ${F.cat === k ? 'on' : ''}" data-act="cat" data-c="${k}"><span>${c.emoji}</span>${c.label}</button>`).join('')}</div></div>
    <div class="field"><span>¿Dónde lo guardas?</span><div class="seg" data-seg="fplace"><span class="knob"></span>${Object.entries(PLACES).map(([k, v]) =>
      `<button class="${F.place === k ? 'on' : ''}" data-act="fplace" data-p="${k}">${v.label}</button>`).join('')}</div></div>
    <label class="field"><span>Lo abriste el</span><input class="input" id="f-date" type="date" value="${F.opened}" max="${iso(today())}"></label>
    <div class="field"><span>Dura abierto</span><div class="stepper">
      <button data-act="days" data-d="-1" aria-label="Un día menos">${I.minus}</button><output class="num">${F.days} ${F.days === 1 ? 'día' : 'días'}</output>
      <button data-act="days" data-d="1" aria-label="Un día más">${I.plus}</button></div>
      <span class="hint">Sugerido para ${CATS[F.cat].label.toLowerCase()}${F.place === 'congelador' ? ' en congelador' : ''}: <span class="num">${sugg}</span> días. Revisa también la etiqueta del empaque.</span></div>
    <div class="preview glass">${ring(x.pct, COLOR[x.state], 46, 5, `<span class="num c-${x.state}">${Math.max(x.left, 0)}</span>`)}
      <span>Caduca el <b>${fmt(x.exp)}</b><br>${stateTag(x.state)}</span></div>
    <div class="field"><span>Pinza</span><div class="chips">
      <button class="chip ${!F.pinza ? 'on' : ''}" data-act="fpinza" data-p="">Sin pinza</button>
      ${free.map(q => `<button class="chip ${F.pinza === q.id ? 'on' : ''}" data-act="fpinza" data-p="${q.id}">${pz(q)} ${esc(q.name)}</button>`).join('')}</div></div>
    <div class="actions"><button class="btn btn-primary block press" data-act="save">${I.check} ${F.id ? 'Guardar cambios' : 'Registrar'}</button></div>`;
}
function rerenderForm() {
  const body = $('#sheet-root .sheet-body'); if (!body) return;
  const top = body.scrollTop; setBody(formHTML()); body.scrollTop = top; bindForm();
  body.querySelectorAll('[data-seg]').forEach(placeKnob);
}
function bindForm() {
  $('#f-name')?.addEventListener('input', e => {
    F.name = e.target.value; e.target.classList.remove('err');
    const hit = QUICK.find(([n]) => n.toLowerCase() === F.name.trim().toLowerCase());
    if (hit && hit[1] !== F.cat) { setCat(hit[1]); }
  });
  $('#f-date')?.addEventListener('change', e => { if (e.target.value) { F.opened = e.target.value; rerenderForm(); } });
}
function setCat(c) {
  F.cat = c;
  if (!F.touchedDays) { F.place = F.place === 'congelador' ? 'congelador' : CATS[c].place; F.days = F.place === 'congelador' ? FREEZER_DAYS : CATS[c].days; }
  rerenderForm();
}

function openRecipe(id) {
  const m = matchRecipes().find(m => m.r.id === id); if (!m) return;
  const sel = new Set(m.used.filter(x => x.state === 'porvencer').map(x => x.it.id));
  const draw = () => `<div class="d-head"><span class="bubble">${m.r.emoji}</span><div><h2>${m.r.name}</h2>
      <span class="meta-line" style="margin:0">${I.clock}<span class="num">${m.r.min} min</span></span></div></div>
    ${m.used.length ? `<h4>De tu cocina</h4>${m.used.map(x => `<button class="check ${sel.has(x.it.id) ? 'on' : ''}" data-act="rsel" data-id="${x.it.id}">
      <span class="box">${I.check}</span><span style="flex:1"><b>${esc(x.it.name)}</b><br><span class="hint">${leftText(x.left)}</span></span>${stateTag(x.state)}</button>`).join('')}` : ''}
    <h4>Ingredientes</h4><ul class="ing">${m.r.ing.map(i => `<li>${i}</li>`).join('')}</ul>
    <h4>Preparación</h4><ol class="steps">${m.r.steps.map(s => `<li><span>${s}</span></li>`).join('')}</ol>
    ${m.used.length ? `<div class="actions"><button class="btn btn-green block" data-act="cooked" ${sel.size ? '' : 'disabled'}>${I.check} La cociné · marcar ${sel.size ? plural(sel.size, 'alimento', 'alimentos') : 'alimentos'} como consumidos</button></div>` : ''}`;
  openSheet(draw(), { recipe: id, sel, draw });
}

function openAlerts() {
  const due = sorted().filter(x => x.state !== 'fresco');
  const can = 'Notification' in window;
  openSheet(`<h2>Avisos</h2><p class="hint" style="margin:0 0 14px">${due.length ? 'Úsalos primero o registra qué pasó con ellos.' : 'No tienes alimentos por vencer. ¡Bien!'}</p>
    <div class="list" style="margin-top:0">${due.map((x, i) => itemCard(x, i)).join('')}</div>
    ${can && !(S.prefs.notif && Notification.permission === 'granted') ? `<div class="actions"><button class="btn btn-primary block" data-act="notif-on">${I.bell} Activar avisos en este celular</button></div>` : ''}`);
}

function openProfile() {
  const u = S.user;
  const sw = (on, act, t, s) => `<button class="toggle" data-act="${act}" role="switch" aria-checked="${!!on}"><span><b>${t}</b><small>${s}</small></span><span class="switch ${on ? 'on' : ''}"></span></button>`;
  openSheet(`<div class="profile-head"><span class="avatar">${esc(first()[0] || 'F').toUpperCase()}</span>
      <div><h2 style="margin:0">${esc(u.name)}</h2><span class="hint">${esc(u.home || 'Mi hogar')} · ${plural(u.people, 'persona', 'personas')}</span></div></div>
    <h4>Mis pinzas</h4><div class="pinzas">${S.pinzas.map(p => { const it = itemOn(p.id); return `<div class="pinza glass">${pinzaImg(p)}
      <span><b>${esc(p.name)}</b><small>${it ? `En: ${esc(it.name)}` : 'Lista para usarse'}</small></span>
      ${NFC ? `<button class="icon-btn glass press" data-act="write" data-id="${p.id}" aria-label="Grabar etiqueta de ${esc(p.name)}">${I.write}</button>`
        : `<button class="icon-btn glass press" data-act="copy" data-id="${p.id}" aria-label="Copiar enlace de ${esc(p.name)}">${I.link}</button>`}</div>`; }).join('')}
      <button class="btn btn-ghost block" data-act="pair">${I.plus} Vincular otra pinza</button></div>
    <p class="hint" style="margin:10px 2px 0">${NFC ? 'Con el lápiz grabas el enlace de la pinza en una etiqueta NFC: así también funciona en iPhone.' : 'Con el enlace de cada pinza puedes programar una etiqueta NFC (por ejemplo con la app NFC Tools): al acercar el iPhone, se abre FRESHTAG en esa pinza.'}</p>
    <h4>Preferencias</h4><div class="rows glass" style="padding:0 16px">
      ${sw(S.prefs.theme === 'light', 'theme-toggle', 'Modo claro', 'Cambia entre el tema oscuro y el claro')}
      ${sw(S.prefs.notif && 'Notification' in window && Notification.permission === 'granted', 'notif-toggle', 'Avisos', 'Una notificación al día con lo que está por vencer')}
      ${sw(S.prefs.bigText, 'big-toggle', 'Texto grande', 'Aumenta el tamaño de toda la app')}</div>
    ${S.prefs.notif ? `<button class="link" style="margin-top:12px" data-act="notif-test">${I.bell} Enviar un aviso de prueba</button>` : ''}
    <h4>Datos</h4><div class="actions" style="margin-top:6px">
      <button class="btn btn-ghost" data-act="demo">Cargar cocina de ejemplo</button>
      <button class="btn btn-danger" data-act="reset">Borrar todo y empezar de cero</button></div>
    <div class="about"><img src="${logoSrc()}" alt="FRESHTAG">Prototipo funcional · Sistema inteligente de organización alimentaria<br>Equipo 6 · Prácticum II · Escuela de Diseño · 2026-60</div>`);
}

// ---------- NFC ----------
let scanCtrl = null;
function scanShell(title, text) {
  const root = $('#scan-root');
  root.innerHTML = `<div class="scan" role="dialog" aria-modal="true" aria-label="Leer pinza">
    <button class="close" data-act="scan-close" aria-label="Cerrar">${I.x}</button>
    <div class="radar"><span class="wave"></span><span class="wave"></span><span class="wave"></span>
      <div class="core"><img src="img/isotipo.svg" alt=""><span class="ok-check"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span></div>
      <span class="phone">${I.nfc}</span></div>
    <h2 id="scan-t">${title}</h2><p id="scan-p">${text}</p><div id="scan-x" style="width:100%;margin-top:auto"></div></div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => $('.scan', root)?.classList.add('open')));
}
function closeScan() {
  scanCtrl?.abort(); scanCtrl = null;
  const s = $('#scan-root .scan'); if (!s) return;
  s.classList.remove('open'); setTimeout(() => { $('#scan-root').innerHTML = ''; }, 400);
}
function idFromReading(e) {
  for (const r of e.message?.records || []) {
    try {
      const txt = new TextDecoder(r.encoding || 'utf-8').decode(r.data);
      const m = txt.match(/#\/tag\/([\w-]+)/) || (r.recordType === 'text' && txt.match(/^(FT-[\w-]+)$/));
      if (m) return m[1];
    } catch { /* unreadable record: fall back to serial */ }
  }
  return e.serialNumber ? 'NFC-' + e.serialNumber.replace(/:/g, '').toUpperCase() : null;
}
async function scan(mode = 'use') {
  closeSheet();
  scanShell(mode === 'pair' ? 'Vincula tu pinza' : 'Acerca tu celular', mode === 'pair'
    ? 'Acerca la pinza nueva a la parte de atrás de tu celular.' : 'Pon la parte de atrás del celular sobre la pinza.');
  if (NFC) {
    try {
      const reader = new NDEFReader(); scanCtrl = new AbortController();
      await reader.scan({ signal: scanCtrl.signal });
      reader.onreading = e => { const id = idFromReading(e); scanCtrl?.abort(); scanCtrl = null; if (id) detected(id, e.serialNumber); };
      reader.onreadingerror = () => { $('#scan-p').textContent = 'No pude leer la pinza. Sepárala y vuelve a acercarla.'; };
      $('#scan-x').innerHTML = `<p style="margin:0 auto;font-size:.82rem">NFC activo · también puedes <button class="link" style="color:#F8C9BF" data-act="sim" data-m="${mode}">simular la lectura</button></p>`;
      return;
    } catch (err) {
      $('#scan-p').textContent = err.name === 'NotAllowedError' ? 'Permite el acceso a NFC para leer la pinza. Mientras tanto, puedes simularlo.' : 'No pude activar el NFC. Puedes simular la lectura.';
    }
  }
  setTimeout(() => simPicker(mode), NFC ? 0 : 1300);
}
function simPicker(mode) {
  const box = $('#scan-x'); if (!box) return;
  const rows = S.pinzas.map((p, i) => { const it = itemOn(p.id); return `<button data-act="sim-pick" data-id="${p.id}" style="--i:${i}">${pinzaImg(p)}
    <span><b>${esc(p.name)}</b><small>${it ? `Cerrando: ${esc(it.name)}` : 'Libre · registra un alimento'}</small></span>${I.right}</button>`; }).join('');
  box.innerHTML = `<div class="sim"><div class="lbl">${I.phone} ${NFC ? 'Simulación' : 'Modo simulación · tu navegador no lee NFC'}</div>
    <div class="sim-list">${mode === 'pair' ? '' : rows}<button data-act="sim-new"><div class="ph">${I.plus}</div><span><b>Pinza nueva</b><small>Simula una etiqueta que la app no conoce</small></span>${I.right}</button></div></div>`;
}
function detected(id, serial) {
  let p = S.pinzas.find(q => q.id === id || (serial && q.serial === serial)), isNew = false;
  if (!p) {
    const colors = ['azul', 'verde', 'coral', 'crema'];
    p = { id, name: `Pinza ${S.pinzas.length + 1}`, color: colors[S.pinzas.length % 4], serial: serial || null };
    S.pinzas.push(p); save(); isNew = true;
  }
  haptic('success');
  const s = $('#scan-root .scan');
  if (s) {
    s.classList.add('ok'); $('#scan-x').innerHTML = '';
    // digits stay in DM Sans: Vice City's "1" reads as "I"
    $('#scan-t').innerHTML = isNew ? '¡Pinza nueva vinculada!' : `¡${esc(p.name).replace(/\d+/g, '<span class="num">$&</span>')}!`;
    const it = itemOn(p.id);
    $('#scan-p').textContent = it ? `Está cerrando: ${it.name}` : 'Lista para registrar un alimento.';
  }
  setTimeout(() => { closeScan(); setTimeout(() => handleTag(p.id), 250); }, s ? 1100 : 0);
}
function handleTag(id) {
  if (!S.user) { ui.pendingTag = id; return; }
  const it = itemOn(id);
  if (it) openItem(it.id); else openForm({ pinza: id });
}
async function writeTag(id) {
  const p = pinzaOf(id);
  scanShell('Grabar etiqueta', `Acerca la etiqueta de ${p.name.toLowerCase()} para guardar su enlace.`);
  try {
    scanCtrl = new AbortController();
    await new NDEFReader().write({ records: [{ recordType: 'url', data: tagLink(id) }] }, { signal: scanCtrl.signal });
    $('#scan-root .scan')?.classList.add('ok'); $('#scan-t').textContent = '¡Etiqueta grabada!'; $('#scan-p').textContent = 'Ahora cualquier celular puede abrir esta pinza.';
    haptic('success'); setTimeout(closeScan, 1400);
  } catch (err) {
    if (err.name !== 'AbortError') $('#scan-p').textContent = 'No se pudo grabar. Revisa que la etiqueta no esté bloqueada e intenta de nuevo.';
  }
}

// ---------- notifications ----------
async function notify(force = false) {
  if (!S.prefs.notif || !('Notification' in window) || Notification.permission !== 'granted') return;
  if (!force && S.notified === iso(today())) return;
  const due = sorted().filter(x => x.state === 'porvencer');
  if (!due.length && !force) return;
  const body = due.length ? (due.length === 1 ? `${due[0].it.name}: ${leftText(due[0].left).toLowerCase()}.` : `${due.length} alimentos por vencer: ${due.slice(0, 3).map(x => x.it.name).join(', ')}.`)
    : 'Todo está fresco en tu cocina.';
  const opts = { body, icon: 'img/icon-192.png', badge: 'img/icon-192.png', tag: 'freshtag-daily' };
  try { const reg = await navigator.serviceWorker?.getRegistration(); reg ? await reg.showNotification('FRESHTAG · Úsalo primero', opts) : new Notification('FRESHTAG · Úsalo primero', opts); }
  catch { toast('Este navegador no pudo mostrar el aviso', 'alert'); return; }
  S.notified = iso(today()); save();
}
async function enableNotif() {
  if (!('Notification' in window)) { toast('Este navegador no permite avisos. En iPhone, agrega la app a tu pantalla de inicio.', 'alert'); return false; }
  const perm = await Notification.requestPermission();
  S.prefs.notif = perm === 'granted'; save();
  toast(S.prefs.notif ? 'Avisos activados' : 'No se activaron los avisos', S.prefs.notif ? 'check' : 'alert');
  if (S.prefs.notif) notify(true);
  return S.prefs.notif;
}

// ---------- feedback ----------
// Inside the Expo Go shell the page talks to expo-haptics; in a browser it falls back to vibration (Android).
function haptic(kind = 'light') {
  if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', kind }));
  else navigator.vibrate?.(kind === 'success' ? [12, 50, 22] : kind === 'warning' ? [24, 40, 24] : 8);
}
function toast(msg, icon = 'check') {
  const root = $('#toast-root'); root.innerHTML = `<div class="toast" role="status">${I[icon]}<span>${esc(msg)}</span></div>`;
  const t = $('.toast', root); requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}
function burst(el) {
  const phone = $('#phone').getBoundingClientRect(), r = el?.getBoundingClientRect() || { left: phone.width / 2, top: phone.height / 2, width: 0, height: 0 };
  const colors = ['#3B8970', '#E96958', '#2A5082', '#E8A33D', '#5FB396'];
  for (let i = 0; i < 22; i++) {
    const c = document.createElement('i'); c.className = 'confetti';
    const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
    c.style.cssText = `left:${r.left - phone.left + r.width / 2}px;top:${r.top - phone.top + r.height / 2}px;background:${colors[i % 5]};--x:${Math.cos(a) * d}px;--y:${Math.sin(a) * d - 40}px;--r:${Math.random() * 540}deg`;
    $('#phone').appendChild(c); setTimeout(() => c.remove(), 950);
  }
}

// ---------- actions ----------
function finish(id, action, el) {
  const it = S.items.find(i => i.id === id); if (!it) return;
  S.items = S.items.filter(i => i.id !== id);
  S.log.push({ id: uid(), name: it.name, cat: it.cat, action, date: iso(today()) });
  const p = pinzaOf(it.pinza);
  if (action === 'consumido') { burst(el); haptic('success'); toast(`¡${it.name} aprovechado!${p ? ` La ${p.name.toLowerCase()} quedó libre.` : ''}`, 'leaf'); }
  else { haptic('warning'); toast(`Registrado. ${p ? `La ${p.name.toLowerCase()} quedó libre.` : 'La próxima vez te avisamos antes.'}`, 'check'); }
  closeSheet(); refresh();
}

const A = {
  tab: d => go(d.tab),
  filter: d => { ui.filter = d.f; if (ui.tab !== 'despensa') { ui.place = 'todo'; go('despensa'); } else render(); },
  place: d => { ui.place = d.p; render(); },
  item: d => openItem(d.id),
  add: () => openForm(),
  scan: () => scan('use'),
  pair: () => scan('pair'),
  sim: d => simPicker(d.m),
  'sim-pick': d => detected(d.id),
  'sim-new': () => detected('FT-' + uid().toUpperCase()),
  'scan-close': closeScan,
  close: closeSheet,
  alerts: openAlerts,
  profile: openProfile,
  recipe: d => openRecipe(d.id),
  consume: (d, el) => finish(d.id, 'consumido', el),
  discard: (d, el) => finish(d.id, 'desechado', el),
  edit: d => openForm({ id: d.id }),
  quick: d => { F.name = d.n; F.touchedDays = false; setCat(d.c); },
  cat: d => setCat(d.c),
  fplace: d => { F.place = d.p; if (!F.touchedDays) F.days = d.p === 'congelador' ? FREEZER_DAYS : CATS[F.cat].days; rerenderForm(); },
  days: d => { F.days = Math.max(1, Math.min(365, F.days + Number(d.d))); F.touchedDays = true; rerenderForm(); },
  fpinza: d => { F.pinza = d.p || null; rerenderForm(); },
  save: () => {
    const name = F.name.trim();
    if (!name) { const n = $('#f-name'); n.classList.add('err'); n.focus(); return; }
    const rec = { id: F.id || uid(), name, cat: F.cat, place: F.place, opened: F.opened, days: F.days, pinza: F.pinza };
    const i = S.items.findIndex(x => x.id === rec.id);
    if (i >= 0) S.items[i] = rec; else S.items.push(rec);
    const x = info(rec), p = pinzaOf(rec.pinza);
    toast(i >= 0 ? 'Cambios guardados' : `${name} registrado${p ? ` con la ${p.name.toLowerCase()}` : ''} · ${leftText(x.left).toLowerCase()}`);
    closeSheet(); refresh(); notify();
  },
  rsel: d => { const c = sheetCtx; if (!c?.sel) return; c.sel.has(d.id) ? c.sel.delete(d.id) : c.sel.add(d.id); setBody(c.draw()); },
  cooked: (d, el) => {
    const c = sheetCtx; if (!c?.sel?.size) return;
    const names = [];
    for (const id of c.sel) { const it = S.items.find(i => i.id === id); if (!it) continue; names.push(it.name);
      S.items = S.items.filter(i => i.id !== id); S.log.push({ id: uid(), name: it.name, cat: it.cat, action: 'consumido', date: iso(today()) }); }
    burst(el); toast(`¡Buen provecho! Aprovechaste ${names.join(', ')}`, 'leaf'); closeSheet(); refresh();
  },
  'notif-on': async () => { if (await enableNotif()) openAlerts(); },
  'notif-toggle': async (d, el) => { goo(el); if (S.prefs.notif) { S.prefs.notif = false; save(); } else await enableNotif(); setTimeout(openProfile, 380); },
  'notif-test': () => notify(true),
  'big-toggle': (d, el) => { goo(el); setTimeout(() => { S.prefs.bigText = !S.prefs.bigText; save(); render(); openProfile(); }, 380); },
  // animated theme toggle: circular reveal from the tap point
  'theme-toggle': (d, el, e) => {
    goo(el);
    const r = document.documentElement, ph = $('#phone').getBoundingClientRect();
    r.style.setProperty('--tx', `${(e?.clientX ?? ph.width / 2)}px`); r.style.setProperty('--ty', `${(e?.clientY ?? ph.height / 2)}px`);
    const flip = () => { S.prefs.theme = S.prefs.theme === 'light' ? 'dark' : 'light'; save(); render(); openProfile(); };
    if (!document.startViewTransition) return setTimeout(flip, 250);
    setTimeout(() => { r.classList.add('theme-x'); const vt = document.startViewTransition(flip); vt.ready.catch(() => {}); vt.finished.finally(() => r.classList.remove('theme-x')); }, 220);
  },
  write: d => { closeSheet(); writeTag(d.id); },
  copy: async d => { try { await navigator.clipboard.writeText(tagLink(d.id)); toast('Enlace copiado'); } catch { prompt('Enlace de la pinza', tagLink(d.id)); } },
  demo: () => { loadDemo(); closeSheet(); ui.tab = 'inicio'; render(true); toast('Cocina de ejemplo cargada'); },
  reset: () => {
    if (!confirm('¿Borrar todos tus alimentos, pinzas e historial?')) return;
    S = fresh(); save(); closeSheet(); ui.onb = 0; ui.tab = 'inicio'; $('#app').innerHTML = ''; render();
  },
  // onboarding
  'onb-next': () => { ui.onb++; render(); },
  'onb-skip': () => { ui.onb = SLIDES.length; render(); },
  people: d => { const o = $('#people'); o.textContent = Math.max(1, Math.min(12, Number(o.textContent) + Number(d.d))); },
  'demo-toggle': (d, el) => el.classList.toggle('on'),
};

function goo(toggleEl) { const s = $('.switch', toggleEl); if (s) { s.classList.add('go'); s.classList.toggle('on'); } }

let swallow = 0;
document.addEventListener('click', e => {
  if (Date.now() < swallow) { e.preventDefault(); e.stopPropagation(); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  e.preventDefault(); haptic(); fn(el.dataset, el, e);
}, true);

// ---------- touch layer: ripple, glass spotlight (aura-lift), swipe actions ----------
const RIPPLE = '.btn, .chip, .stat, .mini, .feature, .tab, .cat, .check, .sim-list button, .stepper button, .impact-mini, .notice';
let lit = null, drag = null;
document.addEventListener('pointerdown', e => {
  const host = e.target.closest(RIPPLE);
  if (host) {
    const r = host.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2, dot = document.createElement('span');
    dot.className = 'ripple'; dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    host.appendChild(dot); setTimeout(() => dot.remove(), 650);
  }
  spot(e);
  const card = e.target.closest('.item[data-swipe]');
  if (card) drag = { el: card, wrap: card.parentElement, x: e.clientX, y: e.clientY, dx: 0, on: false, armed: false, pid: e.pointerId };
}, { passive: true });
function spot(e) {
  const g = e.target.closest?.('.glass');
  if (lit && lit !== g) lit.classList.remove('lit');
  lit = g; if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty('--mx', `${e.clientX - r.left}px`); g.style.setProperty('--my', `${e.clientY - r.top}px`); g.classList.add('lit');
}
document.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse' || e.buttons) spot(e);
  if (!drag || e.pointerId !== drag.pid) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.on) {
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // it's a scroll
    if (Math.abs(dx) < 12) return;
    drag.on = true; drag.el.classList.add('dragging');
    try { drag.el.setPointerCapture(e.pointerId); } catch { /* capture is best-effort */ }
  }
  drag.dx = dx;
  drag.el.style.setProperty('--dx', `${dx}px`);
  drag.wrap.dataset.dir = dx > 0 ? 'r' : 'l';
  const armed = Math.abs(dx) > 110;
  if (armed !== drag.armed) { drag.armed = armed; drag.wrap.classList.toggle('armed', armed); if (armed) haptic(); }
}, { passive: true });
function endDrag() {
  if (lit && matchMedia('(hover: none)').matches) { const l = lit; setTimeout(() => l.classList.remove('lit'), 350); lit = null; }
  const d = drag; drag = null;
  if (!d?.on) return;
  swallow = Date.now() + 400;
  d.el.classList.remove('dragging');
  if (d.armed) {
    const right = d.dx > 0;
    d.el.classList.add(right ? 'gone-r' : 'gone-l');
    setTimeout(() => finish(d.el.dataset.id, right ? 'consumido' : 'desechado', d.wrap), 260);
  } else {
    d.el.style.setProperty('--dx', '0px'); d.wrap.classList.remove('armed');
    setTimeout(() => d.wrap.removeAttribute('data-dir'), 350);
  }
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);
document.addEventListener('input', e => {
  if (e.target.id === 'q') { ui.q = e.target.value; const l = $('#list'); if (l) l.innerHTML = listHTML(); }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'reg') return;
  e.preventDefault();
  const f = new FormData(e.target), name = String(f.get('name') || '').trim();
  if (!name) { const n = e.target.elements.name; n.classList.add('err'); n.focus(); return; }
  S.user = { name, home: String(f.get('home') || '').trim(), people: Number($('#people').textContent) };
  if ($('#demo').classList.contains('on')) loadDemo(); else save();
  ui.tab = 'inicio'; $('#app').innerHTML = ''; render(true);
  toast(`¡Listo, ${first()}! Tu cocina está lista.`, 'leaf');
  if (ui.pendingTag) { const t = ui.pendingTag; ui.pendingTag = null; setTimeout(() => handleTag(t), 700); }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if ($('#scan-root .scan')) closeScan(); else closeSheet();
});

// ---------- deep links: #/tag/<id> (what a programmed NFC tag opens) ----------
function route() {
  const m = location.hash.match(/^#\/tag\/([\w-]+)/);
  if (!m) return;
  history.replaceState(null, '', location.pathname + location.search);
  if (!S.user) { ui.pendingTag = m[1]; return; }
  scanShell('Leyendo pinza', 'Un momento…');
  setTimeout(() => detected(m[1]), 500);
}
window.addEventListener('hashchange', route);

// ---------- boot ----------
render(true);
setTimeout(() => $('#splash')?.classList.add('out'), 900);
setTimeout(route, 1000);
setTimeout(() => notify(), 2500);
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(() => {});

// self-check of the semáforo thresholds (runs once, silent unless broken)
console.assert(info({ opened: iso(today()), days: 3 }).state === 'fresco'
  && info({ opened: iso(addDays(today(), -1)), days: 3 }).state === 'porvencer'
  && info({ opened: iso(addDays(today(), -4)), days: 3 }).state === 'vencido', 'semáforo thresholds broken');
