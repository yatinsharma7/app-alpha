export default function initPage() {
  // Slightly different tile creation to give this page a unique feel:
  // - adds a small CTA button
  // - supports an "alt" variant for a different accent
  function createTile(title, text, opts = {}) {
    const tile = document.createElement('article');
    tile.className = 'tile';
    if (opts.variant === 'alt') tile.classList.add('alt');

    const h3 = document.createElement('h3');
    h3.textContent = title;

    const p = document.createElement('p');
    p.textContent = text;

    tile.appendChild(h3);
    tile.appendChild(p);

    if (opts.cta) {
      const btn = document.createElement('button');
      btn.className = 'cta';
      btn.type = 'button';
      btn.textContent = opts.cta;
      btn.addEventListener('click', () => {
        // placeholder action: toggle a pressed state
        const pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
      });
      tile.appendChild(btn);
    }

    return tile;
  }

  const root = document.querySelector('.content');
  if (!root) return;

  root.innerHTML = '';

  const tilesWrap = document.createElement('section');
  tilesWrap.className = 'tiles';

  // Generic content for this page (details TBD)
  tilesWrap.appendChild(
    createTile('Capability X', 'A neutral description of a future capability.', { cta: 'Action', variant: 'alt' })
  );
  tilesWrap.appendChild(
    createTile('Capability Y', 'Another neutral descriptor for an extensible feature.', { cta: 'Explore' })
  );
  tilesWrap.appendChild(
    createTile('Capability Z', 'Placeholder description for accessibility or quality improvements.', { cta: 'Learn' })
  );

  root.appendChild(tilesWrap);
}
