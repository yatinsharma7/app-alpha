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

  tilesWrap.appendChild(
    createTile('Performance', 'Bundles optimized for fast first paint and quick iteration.', { cta: 'Profile', variant: 'alt' })
  );
  tilesWrap.appendChild(
    createTile('Adaptable', 'Composable modules let you extend features without friction.', { cta: 'Explore' })
  );
  tilesWrap.appendChild(
    createTile('Accessible', 'Built with semantic markup and sensible defaults for accessibility.', { cta: 'Learn' })
  );

  root.appendChild(tilesWrap);
}
