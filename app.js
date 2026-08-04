'use strict';

const DOW_IT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const MESI_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d); // orario locale: evita lo shift di un giorno che new Date(iso) darebbe (parse UTC)
}

function formatDayHeader(iso) {
  const date = parseISODate(iso);
  const dow = DOW_IT[date.getDay()];
  const label = `${dow} ${date.getDate()} ${MESI_IT[date.getMonth()]} ${date.getFullYear()}`;
  return { dow, label };
}

function getPlanForDay(day, planBlocksMap) {
  if (!day.planBlock) return null;
  return planBlocksMap[day.planBlock] || null;
}

function getStopForDay(n, stopsList) {
  return stopsList.find(s => n >= s.dayRange[0] && n <= s.dayRange[1]) || null;
}

function clampDayNumber(n, totalDays) {
  return Math.min(Math.max(n, 1), totalDays);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { escapeHTML, parseISODate, formatDayHeader, getPlanForDay, getStopForDay, clampDayNumber };
}

(function () {
  const totalDays = days.length;

  function renderDiarioTimeline() {
    const container = document.getElementById('diario-timeline');
    container.innerHTML = '';
    days.filter(day => day.n <= giornoCorrente).reverse().forEach(day => {
      const { label } = formatDayHeader(day.date);
      const article = document.createElement('article');
      if (day.diario) {
        let photostrip = '';
        if (day.diario.foto && day.diario.foto.length) {
          photostrip = `<div class="photostrip">` + day.diario.foto.map((src, i) =>
            `<div class="photo" tabindex="0" role="button" aria-label="Ingrandisci foto ${i + 1} — ${escapeHTML(day.tappa)}"><div class="frame"><img src="${src}" alt="Foto ${i + 1} — ${escapeHTML(day.tappa)}" loading="lazy"></div></div>`
          ).join('') + `</div>`;
        }
        const paragraphs = day.diario.paragrafi.map((p, i) => `<p class="${i === 0 ? 'lede' : ''}">${escapeHTML(p)}</p>`).join('');
        article.innerHTML = `
          <div class="card">
            <div class="card-strip">
              <span class="card-day">Giorno ${day.n}</span>
              <span class="card-date">${label}</span>
              <span class="card-place">${escapeHTML(day.tappa)}</span>
            </div>
            <div class="card-body">
              ${photostrip}
              <h2>${escapeHTML(day.diario.titolo)}</h2>
              ${paragraphs}
            </div>
          </div>
        `;
      } else {
        article.innerHTML = `
          <div class="card">
            <div class="card-strip card-strip--muted">
              <span class="card-day">Giorno ${day.n}</span>
              <span class="card-date">${label}</span>
              <span class="card-place">${escapeHTML(day.tappa)}</span>
            </div>
            <div class="card-body">
              <p class="entry-pending-note">non ancora scritto</p>
            </div>
          </div>
        `;
      }
      container.appendChild(article);
    });
  }

  function dayNote(day) {
    if (day.logistica.length) {
      const first = day.logistica[0];
      return typeof first === 'object' ? first.text : first;
    }
    const plan = getPlanForDay(day, planBlocks);
    if (plan && plan.length) return plan[0].nome;
    return null;
  }

  function renderProgrammaList() {
    const container = document.getElementById('programma-list');
    container.innerHTML = '';
    let lastStop = null;
    days.forEach(day => {
      const stop = getStopForDay(day.n, stops);
      if (stop && stop !== lastStop) {
        const head = document.createElement('div');
        head.className = 'prog-group-head';
        head.innerHTML = `
          <span class="prog-group-place">${escapeHTML(stop.place)}</span>
          <span class="prog-group-note">${escapeHTML(stop.note)}</span>
        `;
        container.appendChild(head);
        lastStop = stop;
      }
      const { label } = formatDayHeader(day.date);
      const note = dayNote(day);
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'prog-day';
      row.innerHTML = `
        <span class="prog-day-n">Giorno ${day.n}</span>
        <span class="prog-day-date">${label}</span>
        <span class="prog-day-tappa">${escapeHTML(day.tappa)}</span>
        ${note ? `<span class="prog-day-note">${escapeHTML(note)}</span>` : ''}
      `;
      row.addEventListener('click', () => openDayModal(day.n));
      container.appendChild(row);
    });
  }

  function planMetaRow(item) {
    const parts = [
      item.difficolta ? escapeHTML(item.difficolta) : null,
      item.tempo ? escapeHTML(item.tempo) : null,
      item.prenotazione ? `prenotazione: ${escapeHTML(item.prenotazione)}` : null,
      item.costo ? escapeHTML(item.costo) : null
    ].filter(Boolean);
    return parts.map(p => `<span>${p}</span>`).join('');
  }

  function renderDayModal(n) {
    const day = days.find(d => d.n === n);
    const { label } = formatDayHeader(day.date);
    const plan = getPlanForDay(day, planBlocks);
    const body = document.getElementById('day-modal-body');

    let html = `
      <div class="stamp">
        <span class="day">Giorno ${day.n}</span>
        <span class="date">${label}</span>
        <span class="place">${escapeHTML(day.tappa)}</span>
      </div>
    `;

    if (day.logistica.length) {
      html += `<p class="modal-section-title">Logistica</p><ul class="logistica-list">`
        + day.logistica.map(l => {
          if (l && typeof l === 'object' && l.url) {
            return `<li>${escapeHTML(l.text)} — <a href="${escapeHTML(l.url)}" target="_blank" rel="noopener noreferrer">traccia il volo ↗</a></li>`;
          }
          return `<li>${escapeHTML(l)}</li>`;
        }).join('') + `</ul>`;
    }

    if (plan) {
      html += `<p class="modal-section-title">Piano</p><div class="plan-list">`
        + plan.map(item => `
          <div class="plan-item">
            <div class="plan-name">${escapeHTML(item.nome)}</div>
            <p class="plan-detail">${escapeHTML(item.dettaglio)}</p>
            <div class="plan-meta">${planMetaRow(item)}</div>
          </div>
        `).join('') + `</div>`;
    }

    body.innerHTML = html;

    const modal = document.getElementById('day-modal');
    document.getElementById('modal-prev').disabled = n <= 1;
    document.getElementById('modal-next').disabled = n >= totalDays;
    modal.dataset.currentDay = String(n);
  }

  function openDayModal(n) {
    n = clampDayNumber(n, totalDays);
    renderDayModal(n);
    const modal = document.getElementById('day-modal');
    if (!modal.open) modal.showModal();
    history.replaceState(null, '', `#giorno-${n}`);
  }

  function closeDayModal() {
    document.getElementById('day-modal').close();
  }

  function clearHashIfDayLink() {
    if (location.hash.startsWith('#giorno-')) {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function wireUpModal() {
    const modal = document.getElementById('day-modal');
    document.getElementById('modal-close').addEventListener('click', closeDayModal);
    document.getElementById('modal-prev').addEventListener('click', () => {
      openDayModal(Number(modal.dataset.currentDay) - 1);
    });
    document.getElementById('modal-next').addEventListener('click', () => {
      openDayModal(Number(modal.dataset.currentDay) + 1);
    });
    modal.addEventListener('click', e => { if (e.target === modal) closeDayModal(); });
    modal.addEventListener('close', clearHashIfDayLink);
  }

  function openLightbox(src, alt) {
    const img = document.getElementById('lightbox-img');
    img.src = src;
    img.alt = alt || '';
    const dialog = document.getElementById('photo-lightbox');
    if (!dialog.open) dialog.showModal();
  }

  function closeLightbox() {
    document.getElementById('photo-lightbox').close();
  }

  function wireUpLightbox() {
    const dialog = document.getElementById('photo-lightbox');
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    dialog.addEventListener('click', e => { if (e.target === dialog) closeLightbox(); });

    const timeline = document.getElementById('diario-timeline');
    timeline.addEventListener('click', e => {
      const photo = e.target.closest('.photo');
      if (!photo) return;
      const img = photo.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
    timeline.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const photo = e.target.closest('.photo');
      if (!photo) return;
      e.preventDefault();
      const img = photo.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
  }

  function wireUpTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        const target = btn.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + target));
      });
    });
  }

  function openFromHash() {
    const match = location.hash.match(/^#giorno-(\d+)$/);
    if (match) openDayModal(Number(match[1]));
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderDiarioTimeline();
    renderProgrammaList();
    wireUpModal();
    wireUpLightbox();
    wireUpTabs();
    openFromHash();
  });
})();
