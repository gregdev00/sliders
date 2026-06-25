<script lang="ts">
	import { TIME_SLIDER_ANIMATION_CONFIG } from '$lib/constants/sliderConfig';
	import { TIME_PRECISION_CONFIG } from '$lib/constants/timePrecisionConfig';
	import { formatHours } from '$lib/utils/formatUtils';

	interface Props {
		min?: number;
		max?: number;
		value?: number;
		color?: string;
		step: number;
		locked: boolean;
		ariaLabel?: string;
		onChange?: (value: number) => void;
	}

	let {
		min = 0,
		max = 24,
		value = $bindable(42),
		step = 15,
		color = '#34a8eb',
		locked = false,
		ariaLabel,
		onChange
	}: Props = $props();

	const stepH = $derived(step / 60);

	let trackElement: HTMLDivElement | undefined;
	let fillElement: HTMLDivElement | undefined;
	let thumbElement: HTMLDivElement | undefined;

	let isDragging = false;
	let lastSnap = value;
	let targetRaw = value;
	let currentRaw = value;
	let rafId: number | null = null;

	function snapToStep(value: number): number {
		return Math.max(min, Math.min(max, Math.round(value / stepH) * stepH));
	}

	function applyPercentage(percent: number) {
		const p = Math.max(0, Math.min(100, percent));
		if (fillElement) fillElement.style.width = p + '%';
		if (thumbElement) thumbElement.style.left = p + '%';
	}

	function animTo(t: number) {
		targetRaw = t;
		if (rafId !== null) return;

		const run = () => {
			const d = targetRaw - currentRaw;
			if (Math.abs(d) < TIME_PRECISION_CONFIG.HOUR_MATCH_TOLERANCE) {
				currentRaw = targetRaw;
				applyPercentage((currentRaw / max) * 100);
				rafId = null;
				return;
			}
			currentRaw += d * TIME_SLIDER_ANIMATION_CONFIG.LERP;
			applyPercentage((currentRaw / max) * 100);
			rafId = requestAnimationFrame(run);
		};
		rafId = requestAnimationFrame(run);
	}

	$effect(() => {
		const currentColor = color;

		animTo(value);

		if (fillElement) {
			fillElement.style.background = `linear-gradient(90deg, ${currentColor}66, ${currentColor})`;
		}
	});

	// Cleanup RAF on unmount
	$effect(() => {
		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
	});

	function getRaw(clientX: number): number {
		if (!trackElement) return 0;
		const r = trackElement.getBoundingClientRect();
		return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * max;
	}

	function getSnap(clientX: number): number {
		return snapToStep(getRaw(clientX));
	}

	function handlePointerDown(e: PointerEvent) {
		if (locked || e.button !== 0) return;
		e.preventDefault();
		isDragging = true;

		trackElement?.setPointerCapture(e.pointerId);
		trackElement?.focus();

		// Nyers pozícióra ugrik azonnal (mint React onDown)
		const r = getRaw(e.clientX);
		currentRaw = r;
		targetRaw = r;
		applyPercentage((r / max) * 100);

		const s = getSnap(e.clientX);
		value = s;
		lastSnap = s;
		onChange?.(s);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		animTo(getRaw(e.clientX));

		const s = getSnap(e.clientX);
		if (s !== lastSnap) {
			try {
				if (navigator.vibrate) navigator.vibrate(3);
			} catch {}
			lastSnap = s;
		}
		value = s;
		onChange?.(s);
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging) return;
		isDragging = false;
		trackElement?.releasePointerCapture(e.pointerId);

		const s = getSnap(e.clientX);
		value = s;
		animTo(s);
		onChange?.(s);
	}

	// Mouse wheel support
	function handleWheel(e: WheelEvent) {
		if (locked) return;
		e.preventDefault();

		const dir = e.deltaY > 0 ? -1 : 1;
		const big = e.shiftKey ? 4 : 1;
		const next = Math.max(min, Math.min(max, value + dir * stepH * big));

		const finalized = snapToStep(next);
		value = finalized;
		onChange?.(finalized);
	}

	// Keyboard support
	function handleKeyDown(e: KeyboardEvent) {
		if (locked) return;
		let delta = 0;

		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -stepH;
		else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = stepH;
		else if (e.key === 'PageDown') delta = -stepH * 4;
		else if (e.key === 'PageUp') delta = stepH * 4;
		else if (e.key === 'Home') {
			e.preventDefault();
			value = min;
			onChange?.(min);
			return;
		} else if (e.key === 'End') {
			e.preventDefault();
			value = max;
			onChange?.(max);
			return;
		} else return;

		e.preventDefault();
		const next = Math.max(min, Math.min(max, value + delta));
		const finalized = snapToStep(next);
		value = finalized;
		onChange?.(finalized);
	}
</script>

<div
	bind:this={trackElement}
	class="relative h-11 rounded-xl select-none touch-none overflow-visible bg-bg-track outline-accent"
	class:cursor-not-allowed={locked}
	class:cursor-pointer={!locked}
	class:touch-pan-y={locked}
	class:touch-none={!locked}
	tabindex={locked ? -1 : 0}
	role="slider"
	aria-label={ariaLabel || 'Hours'}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	aria-valuetext={formatHours(value)}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onkeydown={handleKeyDown}
	onwheel={handleWheel}
>
	<div class="absolute inset-0 rounded-xl overflow-hidden">
		<div
			bind:this={fillElement}
			class="absolute rounded-xl left-0 top-0 bottom-0"
			style="background: linear-gradient(90deg, {color}66, {color});"
		></div>
	</div>
	<div
		bind:this={thumbElement}
		class="absolute bg-white w-1.5 h-8 top-2/4 rounded-[3px] translate-y-[-50%] pointer-events-none"
	></div>
</div>
