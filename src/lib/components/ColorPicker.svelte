<script lang="ts">
	import { PALETTE } from '$lib/constants/colors';
	import type { HexColor } from '$lib/types/hexColor';
	import Label from './Label.svelte';

	interface Props {
		selectedColor: HexColor;
		onChange?: (selectedColor: HexColor) => void;
	}

	let { selectedColor = $bindable(), onChange }: Props = $props();

	let isCustomSelected = $derived(
		!PALETTE.some((palette) => palette.color.toLowerCase() === selectedColor?.toLowerCase())
	);

	function handleColorSelect(color: HexColor) {
		selectedColor = color;
		onChange?.(color);
	}

	function handleCustomColor(e: Event) {
		const target = e.target as HTMLInputElement;
		const color = target.value as HexColor;
		handleColorSelect(color);
	}
</script>

<Label for="colorSelect">Color</Label>
<div id="colorSelect" class="grid grid-cols-7 gap-2">
	{#each PALETTE as palette}
		<button
			onclick={() => handleColorSelect(palette.color as HexColor)}
			aria-label={palette.name}
			type="button"
			class="w-full aspect-square min-h-9 border-2 rounded-full p-0 cursor-pointer transition-colors"
			class:border-text={selectedColor === palette.color}
			class:border-transparent={selectedColor !== palette.color}
			style:background={palette.color}
			style:box-shadow={selectedColor === palette.color
				? `0 0 0 2px var(--bg-elev), 0 0 0 4px ${palette.color}66`
				: 'none'}
		></button>
	{/each}

	<label
		class="relative w-full aspect-square border-2 border-text rounded-full cursor-pointer flex items-center justify-center overflow-hidden transition-colors"
		style:background={isCustomSelected ? selectedColor : 'transparent'}
		title="Custom Color"
		style:box-shadow={isCustomSelected
			? `0 0 0 2px var(--bg-elev), 0 0 0 4px ${selectedColor}66`
			: 'none'}
	>
		{#if isCustomSelected}
			<span
				class="size-5 z-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-[1px] shadow-sm transition-transform scale-110"
			>
				<svg
					class="size-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"
					></line></svg
				>
			</span>
		{:else}
			<span class="text-text leading-none z-10 select-none">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"
					></line></svg
				>
			</span>
		{/if}

		<input
			type="color"
			value={isCustomSelected ? selectedColor : '#ffffff'}
			oninput={handleCustomColor}
			class="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 opacity-0 cursor-pointer"
		/>
	</label>
</div>
