export default function initHomepage() {
  function createTile(title, text) {
    const tile = document.createElement('article');
    tile.className = 'tile';
    const h3 = document.createElement('h3');
    h3.textContent = title;
    const p = document.createElement('p');
    p.textContent = text;
    tile.appendChild(h3);
    tile.appendChild(p);
    return tile;
  }

  const root = document.querySelector('.content');
  if (!root) return;

  root.innerHTML = '';

  const tilesWrap = document.createElement('section');
  tilesWrap.className = 'tiles';
  // Coming soon: generic feature announcements
  tilesWrap.appendChild(
    createTile(
      'Feature A',
      'Exciting new capability arriving soon. We\'re hard at work bringing this to you. Stay tuned for updates.'
    )
  );
  tilesWrap.appendChild(
    createTile(
      'Feature B',
      'An important addition to the platform. Currently in development. Be among the first to try it when it launches.'
    )
  );
  tilesWrap.appendChild(
    createTile(
      'Feature C',
      'A powerful new tool we\'re building for you. Coming in the next release. Sign up for early access.'
    )
  );

  root.appendChild(tilesWrap);
}
