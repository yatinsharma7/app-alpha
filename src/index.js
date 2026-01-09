import "./template.css";
import initPage from "./page";
import initHomepage from "./homepage";

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
		case '#team-assembly':
			initPage();
			setActiveLink(document.getElementById('team-assembly-link'));
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
	const teamAssemblyLink = document.getElementById('team-assembly-link');

	if (homeLink) {
		homeLink.addEventListener('click', (e) => {
			e.preventDefault();
			initHomepage();
			setActiveLink(homeLink);
			history.pushState({}, '', '#home');
		});
	}

	if (teamAssemblyLink) {
		teamAssemblyLink.addEventListener('click', (e) => {
			e.preventDefault();
			initPage();
			setActiveLink(teamAssemblyLink);
			history.pushState({}, '', '#team-assembly');
		});
	}
});