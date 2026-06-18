<script lang="ts">
	interface Props {
		min?: number;
		max?: number;
		value: number;
	}

	let { min = 0, max = 14, value = $bindable(12.5) }: Props = $props();

	let isDragging = $state(false);
	let trackElement: HTMLDivElement | undefined = $state();

	const percentage = $derived(Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)));

	const ariaValueText = $derived.by(() => {
		const hours = Math.floor(value);
		const minutes = Math.round((value % 1) * 60);
		return `${hours}h ${minutes}m`;
	});

	function updateValueFromCoords(clientX: number) {
		if (!trackElement) return;

		const rect = trackElement.getBoundingClientRect();
		const relativeX = (clientX - rect.left) / rect.width;
		const clampedX = Math.max(0, Math.min(1, relativeX));

		value = min + clampedX * (max - min);
	}

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return;

		isDragging = true;
		trackElement?.setPointerCapture(e.pointerId);
		updateValueFromCoords(e.clientX);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		updateValueFromCoords(e.clientX);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		trackElement?.releasePointerCapture(e.pointerId);
	}

	// Billentyűzet támogatás
	function handleKeyDown(e: KeyboardEvent) {
		const step = 0.5;
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp') {
			e.preventDefault();
			value = Math.min(max, value + step);
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageDown') {
			e.preventDefault();
			value = Math.max(min, value - step);
		} else if (e.key === 'Home') {
			e.preventDefault();
			value = min;
		} else if (e.key === 'End') {
			e.preventDefault();
			value = max;
		}
	}
</script>

<div
	bind:this={trackElement}
	class="relative h-11 rounded-xl cursor-pointer select-none touch-none overflow-visible bg-bg-track outline-accent"
	tabindex="0"
	role="slider"
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	aria-valuetext={ariaValueText}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onkeydown={handleKeyDown}
>
	<div class="absolute inset-0 rounded-xl overflow-hidden">
		<div
			class="absolute rounded-xl left-0 top-0 bottom-0"
			style="width: {percentage}%; background: linear-gradient(90deg, rgba(132, 204, 22, 0.4), rgb(132, 204, 22));"
		></div>
	</div>
	<div
		class="absolute bg-white w-1.5 h-8 top-2/4 rounded-[3px] translate-y-[-50%] pointer-events-none"
		style="left: {percentage}%"
	></div>
</div>
