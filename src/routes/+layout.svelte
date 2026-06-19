<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { taskService } from '$lib/services/TaskService.svelte';

	let { children } = $props();

	taskService.init();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Sliders</title>
	<script>
		// Look for manual preference first, then check system query, default to dark
		const savedTheme = localStorage.getItem('theme');
		const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches
			? 'light'
			: 'dark';

		document.documentElement.setAttribute('data-theme', savedTheme || systemTheme);
		// Temporarily disable transitions on load to kill the FOUC flash
		document.documentElement.classList.add('preload-no-transitions');
	</script>
</svelte:head>
{@render children()}
