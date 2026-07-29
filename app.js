'use strict';

const DOW_IT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const MESI_IT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];

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

function excerpt(text, maxLen) {
  if (text.length <= maxLen) return text;
  const cut = text.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 0 ? lastSpace : maxLen).trim() + '…';
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
  module.exports = { parseISODate, formatDayHeader, excerpt, getPlanForDay, getStopForDay, clampDayNumber };
}

(function () {
  const totalDays = days.length;

  function renderDiarioList() {
    const list = document.getElementById('diario-list');
    list.innerHTML = '';
    days.forEach(day => {
      const { label } = formatDayHeader(day.date);
      const written = !!day.diario;
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'day-row';
      row.innerHTML = `
        <span class="day-n">Giorno ${day.n}</span>
        <span class="day-date">${label}</span>
        <span class="day-place">${day.tappa}</span>
        ${written
          ? `<span class="day-excerpt">${excerpt(day.diario.paragrafi[0], 110)}</span>`
          : `<span class="day-pending">non ancora scritto</span>`}
      `;
      row.addEventListener('click', () => openDayModal(day.n));
      list.appendChild(row);
    });
  }

  function wireUpProgrammaStops() {
    document.querySelectorAll('#tab-programma .stop').forEach(el => {
      const startDay = Number(el.dataset.startDay);
      if (!startDay) return;
      el.classList.add('clickable');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', () => openDayModal(startDay));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDayModal(startDay); }
      });
    });
  }

  function planMetaRow(item) {
    const parts = [item.difficolta, item.tempo,
      item.prenotazione ? `prenotazione: ${item.prenotazione}` : null,
      item.costo].filter(Boolean);
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
        <span class="place">${day.tappa}</span>
      </div>
    `;

    if (day.logistica.length) {
      html += `<p class="modal-section-title">Logistica</p><ul class="logistica-list">`
        + day.logistica.map(l => `<li>${l}</li>`).join('') + `</ul>`;
    }

    if (plan) {
      html += `<p class="modal-section-title">Piano</p><div class="plan-list">`
        + plan.map(item => `
          <div class="plan-item">
            <div class="plan-name">${item.nome}</div>
            <p class="plan-detail">${item.dettaglio}</p>
            <div class="plan-meta">${planMetaRow(item)}</div>
          </div>
        `).join('') + `</div>`;
    }

    html += `<p class="modal-section-title">Diario della serata</p>`;
    if (day.diario) {
      html += `<div class="card">`;
      if (day.diario.foto && day.diario.foto.length) {
        html += `<div class="photostrip">` + day.diario.foto.map((src, i) =>
          `<div class="photo"><img src="${src}" alt="Foto ${i + 1} — ${day.tappa}" loading="lazy"></div>`
        ).join('') + `</div>`;
      }
      html += day.diario.paragrafi.map((p, i) => `<p class="${i === 0 ? 'lede' : ''}">${p}</p>`).join('');
      html += `</div>`;
    } else {
      html += `<p class="diary-pending">il resoconto arriverà la sera del ${label}</p>`;
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
    location.hash = `giorno-${n}`;
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
    renderDiarioList();
    wireUpProgrammaStops();
    wireUpModal();
    wireUpTabs();
    openFromHash();
  });
})();
