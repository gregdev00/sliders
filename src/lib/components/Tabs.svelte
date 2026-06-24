<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setContext } from 'svelte';

	interface Props {
		activeTab?: string | null;
		children: Snippet;
	}

	let { activeTab = $bindable(null), children }: Props = $props();

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
