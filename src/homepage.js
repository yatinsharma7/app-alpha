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
  tilesWrap.appendChild(createTile('Fast**', 'Small and fast build with minimal setup.'));
  tilesWrap.appendChild(createTile('Flexible', 'Easily adapt the template for your app.'));
  tilesWrap.appendChild(createTile('Accessible', 'Aria-ready structure and semantic HTML.'));

  root.appendChild(tilesWrap);
}
