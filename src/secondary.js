export default function initSecondary() {
  const root = document.querySelector('.content');
  if (!root) return;

  root.innerHTML = '';

  // Create a simple variation of the tile layout: stacked intro + tiles with different tones
  const intro = document.createElement('section');
  intro.className = 'secondary-intro';
  const h1 = document.createElement('h1');
  h1.textContent = 'What\'s Coming Next';
  const p = document.createElement('p');
  p.textContent = 'Sneak peek at our roadmap and upcoming initiatives. We\'re building something great for you.';
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
    makeTile(
      'Planned Area 1',
      'A key initiative we\'re excited about. Our team is dedicated to making this a reality. More details coming soon.',
      { variant: 'soft' }
    )
  );
  tilesWrap.appendChild(
    makeTile(
      'Planned Area 2',
      'Another strategic focus for the platform. We\'re listening to your feedback and building accordingly. Watch this space.'
    )
  );
  tilesWrap.appendChild(
    makeTile(
      'Planned Area 3',
      'Powerful integrations and tooling in the works. We\'re partnering with industry leaders to bring you the best experience.'
    )
  );

  root.appendChild(intro);
  root.appendChild(tilesWrap);
}
