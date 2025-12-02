import "./template.css";
import initHomepage from "./homepage";
import initPage from "./page";
import initSecondary from "./secondary";

function setActiveLink(el) {
	// clear previous
	document.querySelectorAll('.header a').forEach(a => {
		a.classList.remove('active');
		a.removeAttribute('aria-current');
	});
	if (!el) return;
	el.classList.add('active');
	el.setAttribute('aria-current', 'page');
}

function loadFromHash(hash) {
	switch (hash) {
		case '#about':
			initPage();
			setActiveLink(document.getElementById('about-link'));
			break;
		case '#store':
			initSecondary();
			setActiveLink(document.getElementById('store-link'));
			break;
		case '#home':
		default:
			initHomepage();
			setActiveLink(document.getElementById('home-link'));
			break;
	}
}

window.addEventListener('hashchange', () => {
	loadFromHash(location.hash);
});

window.addEventListener('DOMContentLoaded', () => {
	// Load initial view according to hash (if present) or default to home
	if (location.hash) {
		loadFromHash(location.hash);
	} else {
		initHomepage();
		setActiveLink(document.getElementById('home-link'));
	}

	// Wire up click handlers (degrade gracefully thanks to href values)
	const homeLink = document.getElementById('home-link');
	const aboutLink = document.getElementById('about-link');
	const storeLink = document.getElementById('store-link');

	if (homeLink) {
		homeLink.addEventListener('click', (e) => {
			e.preventDefault();
			initHomepage();
			setActiveLink(homeLink);
			history.pushState({}, '', '#home');
		});
	}

	if (aboutLink) {
		aboutLink.addEventListener('click', (e) => {
			e.preventDefault();
			initPage();
			setActiveLink(aboutLink);
			history.pushState({}, '', '#about');
		});
	}

	if (storeLink) {
		storeLink.addEventListener('click', (e) => {
			e.preventDefault();
			initSecondary();
			setActiveLink(storeLink);
			history.pushState({}, '', '#store');
		});
	}
});