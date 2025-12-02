export default function initSecondary() {
  const root = document.querySelector('.content');
  if (!root) return;

  root.innerHTML = '';

  // Create a simple variation of the tile layout: stacked intro + tiles with different tones
  const intro = document.createElement('section');
  intro.className = 'secondary-intro';
  const h1 = document.createElement('h1');
  h1.textContent = 'Updates & Roadmap';
  const p = document.createElement('p');
  p.textContent = 'High-level notes about future plans; specifics will be finalized later.';
  intro.appendChild(h1);
  intro.appendChild(p);

  const tilesWrap = document.createElement('section');
  tilesWrap.className = 'tiles';

  function makeTile(title, text, opts = {}) {
    const tile = document.createElement('article');
    tile.className = 'tile';
    if (opts.variant === 'soft') tile.classList.add('soft');

    const h3 = document.createElement('h3');
    h3.textContent = title;
    const desc = document.createElement('p');
    desc.textContent = text;

    tile.appendChild(h3);
    tile.appendChild(desc);

    // small link-style CTA
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'tile-link';
    a.textContent = 'Read more';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      // placeholder action: highlight tile briefly
      tile.style.outline = '3px solid rgba(37,99,235,0.12)';
      setTimeout(() => (tile.style.outline = ''), 600);
    });
    tile.appendChild(a);

    return tile;
  }

  tilesWrap.appendChild(
    makeTile('Planned Area 1', 'A brief, non-specific description representing a focus area.', { variant: 'soft' })
  );
  tilesWrap.appendChild(
    makeTile('Planned Area 2', 'Placeholder text indicating another area under consideration.')
  );
  tilesWrap.appendChild(
    makeTile('Planned Area 3', 'Generic note about potential integrations and tooling.')
  );

  root.appendChild(intro);
  root.appendChild(tilesWrap);
}
