<script lang="ts">
	interface Props {
		checked: boolean;
		label?: string;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}

	let { checked = $bindable(false), label, disabled = false, onchange }: Props = $props();

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		checked = target.checked;
		onchange?.(checked);
	}
</script>

<label
	class="group inline-flex items-center gap-3 cursor-pointer select-none {disabled
		? 'opacity-50 cursor-not-allowed'
		: ''}"
>
	<input type="checkbox" {checked} {disabled} onchange={handleChange} class="sr-only" />

	<div
		class="relative w-11 h-6 bg-bg-track rounded-full transition-colors duration-200
        group-has-[:checked]:bg-accent"
	>
		<div
			class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-out
            group-has-[:checked]:translate-x-5"
		></div>
	</div>

	{#if label}
		<span class="text-sm font-medium text-text">{label}</span>
	{/if}
</label>
