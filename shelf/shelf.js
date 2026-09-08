(() => {
  'use strict';
  const collection = window.SHELF_COLLECTION;
  const shelf = document.querySelector('#shelf');
  const viewport = document.querySelector('#shelf-scroll');
  const search = document.querySelector('#search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const dialog = document.querySelector('#detail');
  const palette = [
    ['#a9422e','#fff0d0'], ['#d6c5a0','#292015'], ['#233d46','#eee2ba'],
    ['#343027','#e4c990'], ['#405241','#fff1cd'], ['#bd8d38','#24190d'],
    ['#342e40','#f3e1c5'], ['#262421','#e9dfc9'], ['#7c3535','#fff1d7'],
    ['#9ca4a0','#172328'], ['#19354e','#ece7d6'], ['#c3b497','#31271c']
  ];
  let filter = 'all';
  let opener;
  let rowWidth = 0;
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  // Fixed per-title variations prevent the shelf from changing appearance on each search.
  const styled = collection.map((item, index) => ({
    ...item, index, width: item.type === 'movie' ? 32 + index % 3 * 3 : 38 + index % 5 * 5,
    height: item.type === 'movie' ? 213 + index % 2 * 13 : 201 + index % 6 * 9
  }));
  function openDetail(item, button) {
    opener = button;
    document.querySelector('#detail-title').textContent = item.title;
    document.querySelector('#detail-type').textContent = item.type === 'book'
      ? 'Book / on the shelf'
      : `${item.format || 'Movie'} / on the shelf`;
    const creator = document.querySelector('#detail-creator');
    creator.textContent = item.creator;
    creator.hidden = !item.creator;
    document.querySelector('#detail-year').textContent = item.year || '';
    document.querySelector('#detail-note').textContent = item.description || 'A description has not been matched to this copy yet.';
    const match = document.querySelector('#detail-match');
    match.textContent = item.matchNote || '';
    match.hidden = !item.matchNote;
    const cover = document.querySelector('#detail-cover');
    cover.replaceChildren();
    const fallback = document.createElement('span');
    fallback.className = 'cover-fallback';
    fallback.textContent = item.cover ? 'Loading cover…' : 'Cover not yet matched';
    cover.append(fallback);
    if (item.cover) {
      // A fresh image per opening prevents late responses from a previous title
      // replacing the current cover. Images load only when details are opened.
      const image = document.createElement('img');
      image.alt = `${item.type === 'movie' ? 'Poster' : 'Cover'} for ${item.title}`;
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
      image.hidden = true;
      image.addEventListener('load', () => { image.hidden = false; fallback.hidden = true; });
      image.addEventListener('error', () => { image.hidden = true; fallback.hidden = false; fallback.textContent = 'Cover unavailable'; });
      cover.append(image);
      image.src = item.cover;
    }
    const links = document.querySelector('#detail-links');
    links.replaceChildren();
    for (const link of item.links || []) {
      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = `${link.label} ↗`;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      links.append(anchor);
    }
    const source = document.querySelector('#detail-source');
    source.replaceChildren();
    if (item.source) {
      source.append('Sources: ');
      const anchor = document.createElement('a');
      anchor.href = item.source.url;
      anchor.textContent = item.source.label;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      source.append(anchor, '. Artwork may differ from my edition.');
    }
    document.body.classList.add('modal-open');
    dialog.showModal();
  }
  function makeSpine(item) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `spine ${item.type}`;
    button.dataset.id = item.id;
    button.setAttribute('aria-label', `${item.title} — ${item.type === 'book' ? 'Book' : 'Movie'}`);
    button.setAttribute('aria-haspopup', 'dialog');
    button.title = item.title;
    const [color, letter] = palette[item.index % palette.length];
    for (const [key, value] of Object.entries({width:`${item.width}px`,height:`${item.height}px`,color,letter,lean:`${item.index % 9 === 0 ? -1.5 : item.index % 11 === 0 ? 1 : 0}deg`})) button.style.setProperty(`--${key}`,value);
    const title = document.createElement('span'); title.className = 'spine-title'; title.textContent = item.title;
    const mark = document.createElement('span'); mark.className = 'spine-mark'; mark.textContent = item.type === 'movie' ? 'FILM' : '◆'; mark.setAttribute('aria-hidden','true');
    button.append(title,mark);
    button.addEventListener('click', () => openDetail(item, button));
    return button;
  }
  function render(resetScroll = false) {
    const query = normalize(search.value);
    const visible = styled.filter(item => (filter === 'all' || item.type === filter) && normalize(item.title).includes(query));
    const focusedId = document.activeElement?.dataset.id;
    const fragment = document.createDocumentFragment();
    // The cabinet has a minimum width on mobile; rows never turn into a card grid.
    const padding = parseFloat(getComputedStyle(shelf).borderLeftWidth) * 2 + (window.innerWidth <= 650 ? 24 : 32);
    rowWidth = Math.floor(shelf.getBoundingClientRect().width);
    const capacity = rowWidth - padding;
    let row, used = 0;
    visible.forEach(item => {
      if (!row || used + item.width + 3 > capacity) {
        row = document.createElement('div'); row.className = 'shelf-row'; fragment.append(row); used = 0;
      }
      row.append(makeSpine(item)); used += item.width + 3;
    });
    shelf.replaceChildren(fragment);
    document.querySelector('#empty').hidden = visible.length > 0;
    // update() restores layout before measuring when leaving the empty state.
    viewport.hidden = visible.length === 0;
    const books = visible.filter(item => item.type === 'book').length;
    document.querySelector('#count').textContent = `${visible.length} of ${collection.length} titles · ${books} books / ${visible.length - books} movies`;
    if (resetScroll) viewport.scrollLeft = 0;
    if (focusedId) shelf.querySelector(`[data-id="${focusedId}"]`)?.focus({preventScroll:true});
  }
  function update() { viewport.hidden = false; render(true); }
  search.addEventListener('input', update);
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    filters.forEach(candidate => candidate.setAttribute('aria-pressed', String(candidate === button)));
    update();
  }));
  document.querySelector('#reset').addEventListener('click', () => {
    search.value = ''; filter = 'all';
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
    update(); search.focus();
  });
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button, a[href]')].filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (opener?.isConnected) opener.focus({preventScroll:true}); });
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  document.querySelector('.controls').hidden = false;
  render();
  new ResizeObserver(() => {
    if (!viewport.hidden && Math.floor(shelf.getBoundingClientRect().width) !== rowWidth) render();
  }).observe(shelf);
})();
