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
  // Generic feature placeholders (final features TBD)
  tilesWrap.appendChild(
    createTile('Feature A', 'A short, generic description of a planned capability.')
  );
  tilesWrap.appendChild(
    createTile('Feature B', 'Another brief generic description to represent future work.')
  );
  tilesWrap.appendChild(
    createTile('Feature C', 'Placeholder text describing an upcoming area of focus.')
  );

  root.appendChild(tilesWrap);
}
