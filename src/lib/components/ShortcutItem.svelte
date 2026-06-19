<script lang="ts">
	interface Props {
		shortcut: string;
		description: string;
	}

	let { shortcut, description }: Props = $props();
</script>

<div class="flex items-center justify-between px-3 py-2 bg-bg-input rounded-[10px]">
	<span
		class="font-mono text-[11px] font-medium text-text-3 bg-bg-elev-2 border border-border rounded-md px-1.5 py-0.5 min-w-12 text-center"
		>{shortcut}</span
	>
	<span class="text-[13px] text-text-2">{description}</span>
</div>
