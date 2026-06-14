<script lang="ts">
	import { onMount } from 'svelte';

	import Button from './Button.svelte';

	let currentTheme = $state('dark');

	onMount(() => {
		// Check if there is preferred scheme that is saved in localstorage
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			currentTheme = savedTheme;
		} else {
			// If there isn't a theme set, check what is the system preferred
			const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
			currentTheme = prefersLight ? 'light' : 'dark';
		}

		// Add listener for system wide theme change event, and if there is no theme saved in localstorage, change dynamically
		const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem('theme')) {
				currentTheme = e.matches ? 'light' : 'dark';
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});

	// Update HTML element and localStorage if currentTheme changes
	$effect(() => {
		if (typeof window !== 'undefined') {
			document.documentElement.setAttribute('data-theme', currentTheme);
			localStorage.setItem('theme', currentTheme);
		}
	});

	function toggleTheme() {
		currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
	}

	function resetToSystem() {
		localStorage.removeItem('theme');
		const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
		currentTheme = prefersLight ? 'light' : 'dark';
	}
</script>

<Button outline iconOnly onclick={toggleTheme} aria-label="Toggle theme"
	><svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line
			x1="12"
			y1="21"
			x2="12"
			y2="23"
		></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line
			x1="18.36"
			y1="18.36"
			x2="19.78"
			y2="19.78"
		></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"
		></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line
			x1="18.36"
			y1="5.64"
			x2="19.78"
			y2="4.22"
		></line></svg
	></Button
>
