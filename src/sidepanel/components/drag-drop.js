import { loadPresets, savePresets } from '../services/storage.js';
import { closeAllMenus } from './menu.js';

const ANIM_MS = 220;
const DRAG_THRESHOLD_PX = 5;

let listEl = null;
let ghostEl = null;
let pressState = null;
let dragState = null;

export function attachReorderHandlers(listElement) {
  if (listEl) return;
  listEl = listElement;
  ghostEl = document.getElementById('dragGhost');

  listEl.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
}

function onPointerDown(e) {
  if (e.button !== 0 && e.pointerType === 'mouse') return;
  if (e.target.closest('button')) return;
  if (e.target.closest('.menu-dropdown')) return;

  const item = e.target.closest('.preset-item');
  if (!item) return;

  pressState = {
    item,
    startX: e.clientX,
    startY: e.clientY,
  };
}

function onPointerMove(e) {
  if (pressState && !dragState) {
    const dx = e.clientX - pressState.startX;
    const dy = e.clientY - pressState.startY;
    if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
      startDrag(e);
    } else {
      return;
    }
  }

  if (!dragState) return;

  ghostEl.style.left = (e.clientX - dragState.offsetX) + 'px';
  ghostEl.style.top = (e.clientY - dragState.offsetY) + 'px';

  const target = elementUnder(e.clientX, e.clientY);
  if (!target || target === dragState.placeholder) return;

  const rect = target.getBoundingClientRect();
  const isBefore = (e.clientY - rect.top) < rect.height / 2;

  if (isBefore && target.previousElementSibling === dragState.placeholder) return;
  if (!isBefore && target.nextElementSibling === dragState.placeholder) return;

  flipAnimate(() => {
    if (isBefore) {
      target.parentNode.insertBefore(dragState.placeholder, target);
    } else {
      target.parentNode.insertBefore(dragState.placeholder, target.nextSibling);
    }
  });
}

function startDrag(e) {
  closeAllMenus();

  const { item } = pressState;
  const rect = item.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  ghostEl.textContent = '';
  const clone = item.cloneNode(true);
  clone.classList.remove('dragging');
  ghostEl.appendChild(clone);
  ghostEl.style.width = rect.width + 'px';
  ghostEl.style.left = (e.clientX - offsetX) + 'px';
  ghostEl.style.top = (e.clientY - offsetY) + 'px';
  ghostEl.style.display = 'block';

  const placeholder = document.createElement('div');
  placeholder.className = 'preset-placeholder';
  placeholder.style.height = rect.height + 'px';
  item.parentNode.insertBefore(placeholder, item);

  item.classList.add('dragging');
  document.body.classList.add('is-dragging');

  dragState = { item, placeholder, offsetX, offsetY };
  pressState = null;
}

function endDrag() {
  pressState = null;
  if (!dragState) return;

  const { item, placeholder } = dragState;
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.replaceChild(item, placeholder);
  }
  item.classList.remove('dragging');

  ghostEl.style.display = 'none';
  ghostEl.textContent = '';
  document.body.classList.remove('is-dragging');
  dragState = null;

  savePresetOrder();
}

function elementUnder(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const item = el.closest('.preset-item, .preset-placeholder');
  if (!item || !listEl.contains(item)) return null;
  if (item.classList.contains('dragging')) return null;
  return item;
}

function flipAnimate(mutator) {
  const items = [...listEl.children].filter(el => !el.classList.contains('dragging'));
  const firstRects = new Map();
  items.forEach(el => firstRects.set(el, el.getBoundingClientRect()));

  mutator();

  items.forEach(el => {
    const first = firstRects.get(el);
    if (!first || !el.isConnected) return;
    const last = el.getBoundingClientRect();
    const dy = first.top - last.top;
    if (dy === 0) return;

    el.style.transition = 'none';
    el.style.transform = `translateY(${dy}px)`;
    requestAnimationFrame(() => {
      el.style.transition = `transform ${ANIM_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
      el.style.transform = '';
    });
    setTimeout(() => {
      el.style.transition = '';
      el.style.transform = '';
    }, ANIM_MS + 30);
  });
}

async function savePresetOrder() {
  const presets = await loadPresets();
  const items = listEl.querySelectorAll('.preset-item');

  let changed = false;
  items.forEach((item, index) => {
    const presetId = item.dataset.presetId;
    if (presets[presetId] && presets[presetId].order !== index) {
      presets[presetId].order = index;
      changed = true;
    }
  });

  if (!changed) return;
  await savePresets(presets);
}
