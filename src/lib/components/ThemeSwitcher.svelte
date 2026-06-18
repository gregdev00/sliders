<script lang="ts">
	import { onMount } from 'svelte';
	import Button from './Button.svelte';

	// Grab everything synchronously right away
	const savedTheme = localStorage.getItem('theme');
	const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
	const initialTheme = savedTheme || (prefersLight ? 'light' : 'dark');

	// Set the reactive state immediately. Svelte will boot up with the correct theme.
	let currentTheme = $state(initialTheme);

	onMount(() => {
		// Drop the transition-blocking class on the next animation frames
		const raf = requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				document.documentElement.classList.remove('preload-no-transitions');
			});
		});

		// Listen for system theme changes if the user hasn't explicitly locked in a preference
		const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
		const handleChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem('theme')) {
				currentTheme = e.matches ? 'light' : 'dark';
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => {
			cancelAnimationFrame(raf);
			mediaQuery.removeEventListener('change', handleChange);
		};
	});

	// Keep the HTML attribute and localStorage completely synchronized
	$effect(() => {
		document.documentElement.setAttribute('data-theme', currentTheme);

		// Only save to localStorage if it's explicitly set (handling the system-default boundary)
		const saved = localStorage.getItem('theme');
		if (
			saved ||
			currentTheme !==
				(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
		) {
			localStorage.setItem('theme', currentTheme);
		}
	});

	function toggleTheme() {
		currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', currentTheme); // Lock it in on click
	}

	function resetToSystem() {
		localStorage.removeItem('theme');
		currentTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
	}
</script>

<Button outline iconOnly onclick={toggleTheme} aria-label="Toggle theme">
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<circle cx="12" cy="12" r="5"></circle>
		<line x1="12" y1="1" x2="12" y2="3"></line>
		<line x1="12" y1="21" x2="12" y2="23"></line>
		<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
		<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
		<line x1="1" y1="12" x2="3" y2="12"></line>
		<line x1="21" y1="12" x2="23" y2="12"></line>
		<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
		<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
	</svg>
</Button>
