import "./template.css";
import initHomepage from "./homepage";
import initPage from "./page";
import initSecondary from "./secondary";

document.addEventListener('DOMContentLoaded', () => {
	initHomepage();

	// Wire up header left-links to load modules on click
	const leftLinks = document.querySelector('.left-links');
	if (leftLinks) {
		const links = leftLinks.querySelectorAll('a');
		const firstLink = links[0];
		const secondLink = links[1];

		if (firstLink) {
			firstLink.addEventListener('click', (e) => {
				e.preventDefault();
				initPage();
			});
		}

		if (secondLink) {
			secondLink.addEventListener('click', (e) => {
				e.preventDefault();
				initSecondary();
			});
		}
	}
});