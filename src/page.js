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

  // Generic content for this page (details TBD) — announcement style
  tilesWrap.appendChild(
    createTile(
      'Capability X',
      'We\'re thrilled to announce work on this exciting capability. Expected to ship very soon. Learn more by exploring our roadmap.',
      { cta: 'Get Notified', variant: 'alt' }
    )
  );
  tilesWrap.appendChild(
    createTile(
      'Capability Y',
      'An extensible feature designed with you in mind. In active development. Join our community to share feedback.',
      { cta: 'Join Community' }
    )
  );
  tilesWrap.appendChild(
    createTile(
      'Capability Z',
      'Quality and accessibility improvements on the horizon. We\'re committed to delivering excellence. Check back soon.',
      { cta: 'See Roadmap' }
    )
  );

  root.appendChild(tilesWrap);
}
