<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';

	interface Props {
		defaultTab?: string | null;
		children: Snippet;
	}

	let { defaultTab = null, children }: Props = $props();

	let activeTab = $derived<string | null>(defaultTab);

	function registerTab(id: string) {
		if (activeTab === null) {
			activeTab = id;
		}
	}

	function setActive(id: string) {
		activeTab = id;
	}

	setContext('tabs', {
		get activeTab() {
			return activeTab;
		},
		setActive,
		registerTab
	});
</script>

<div class="flex flex-col w-full">
	{@render children()}
</div>
