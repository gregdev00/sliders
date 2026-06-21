<script lang="ts">
	import type { Task } from '$lib/types/task';
	import { CIRCULAR_SLIDER_CONFIG as sliderConfig } from '$lib/constants/sliderConfig';
	import { TIME_PRECISION_CONFIG } from '$lib/constants/timePrecisionConfig';
	import { DONUT_CONFIG } from '$lib/constants/donutConfig';
	import { DONUT_ANIMATION_CONFIG } from '$lib/constants/donutConfig';
	import { formatHours } from '$lib/utils/formatUtils';

	interface Props {
		tasks: Task[];
		total: number;
		isOver: boolean;
		dayLen: number;
		dayStart: number;
		selectedId: string | null;
		onSelectTask: (id: string | null) => void;
	}

	let { tasks, total, isOver, dayLen, dayStart, selectedId, onSelectTask }: Props = $props();

	const display = $derived(
		isOver ? tasks.map((task) => ({ ...task, hours: task.hours * (dayLen / total) })) : tasks
	);
	const remaining = $derived(
		Math.max(0, dayLen - display.reduce((sum, task) => sum + task.hours, 0))
	);

	const slices = $derived<DonutSlice[]>([
		...display,
		...(remaining > TIME_PRECISION_CONFIG.HOUR_MATCH_TOLERANCE
			? [{ id: 'free', hours: remaining, color: 'var(--bg-track)', isFree: true as const }]
			: [])
	]);

	interface AngleState {
		startA: number;
		sw: number;
	}

	type DonutSlice =
		| (Task & { isFree?: false })
		| { id: string; hours: number; color: string; isFree: true };

	let animatedAngles = $state<Record<string, AngleState>>({});
	let targetAngles = $state<Record<string, AngleState>>({});

	let donutRafId: number | null = null;

	$effect(() => {
		const computedTargets: Record<string, AngleState> = {};
		let currentAngle = -Math.PI / 2; // Always start at 12 o'clock position

		// Calculate destination targets for every slice
		for (const slice of slices) {
			const sweep = dayLen > 0 ? (slice.hours / dayLen) * 2 * Math.PI : 0;
			computedTargets[slice.id] = {
				startA: currentAngle,
				sw: Math.max(0, sweep)
			};
			currentAngle += sweep;
		}

		targetAngles = computedTargets;

		// Hydrate the animated angles object for any brand new slice entries
		for (const id of Object.keys(computedTargets)) {
			if (!animatedAngles[id]) {
				animatedAngles[id] = { ...computedTargets[id] };
			}
		}

		if (!donutRafId) {
			const run = () => {
				let requiresMoreFrames = false;
				const nextFrameAngles: Record<string, AngleState> = {};

				for (const id of Object.keys(targetAngles)) {
					const tgt = targetAngles[id];
					const cur = animatedAngles[id] || { ...tgt };

					const diffStart = Math.abs(tgt.startA - cur.startA);
					const diffSweep = Math.abs(tgt.sw - cur.sw);

					// Snap to absolute targets if close enough to tolerance
					if (
						diffStart < DONUT_ANIMATION_CONFIG.ANGULAR_SNAP_TOLERANCE &&
						diffSweep < DONUT_ANIMATION_CONFIG.ANGULAR_SNAP_TOLERANCE
					) {
						nextFrameAngles[id] = { ...tgt };
					} else {
						// Smoothly ease values toward targets
						nextFrameAngles[id] = {
							startA: cur.startA + (tgt.startA - cur.startA) * DONUT_ANIMATION_CONFIG.LERP,
							sw: cur.sw + (tgt.sw - cur.sw) * DONUT_ANIMATION_CONFIG.LERP
						};
						requiresMoreFrames = true;
					}
				}

				animatedAngles = nextFrameAngles;
				donutRafId = requiresMoreFrames ? requestAnimationFrame(run) : null;
			};
			donutRafId = requestAnimationFrame(run);
		}
	});

	// Clean up active frame requests when component drops from DOM
	$effect(() => {
		return () => {
			if (donutRafId) cancelAnimationFrame(donutRafId);
		};
	});

	function buildSegmentPath(startAngle: number, sweepAngle: number): string {
		// If the slice is microscopic, return an empty path to prevent rendering artifacts
		if (sweepAngle < 0.001) return '';

		const endAngle = startAngle + sweepAngle;

		// Outer Arc points
		const x1 = DONUT_CONFIG.CX + DONUT_CONFIG.R * Math.cos(startAngle);
		const y1 = DONUT_CONFIG.CY + DONUT_CONFIG.R * Math.sin(startAngle);
		const x2 = DONUT_CONFIG.CX + DONUT_CONFIG.R * Math.cos(endAngle);
		const y2 = DONUT_CONFIG.CY + DONUT_CONFIG.R * Math.sin(endAngle);

		// Inner Arc points
		const x3 = DONUT_CONFIG.CX + DONUT_CONFIG.INNER * Math.cos(endAngle);
		const y3 = DONUT_CONFIG.CY + DONUT_CONFIG.INNER * Math.sin(endAngle);
		const x4 = DONUT_CONFIG.CX + DONUT_CONFIG.INNER * Math.cos(startAngle);
		const y4 = DONUT_CONFIG.CY + DONUT_CONFIG.INNER * Math.sin(startAngle);

		// Flag to tell SVG arc commands whether to take the short or long route around the circle
		const largeArcFlag = sweepAngle > Math.PI ? 1 : 0;

		return [
			`M ${x1} ${y1}`, // Move to outer start point
			`A ${DONUT_CONFIG.R} ${DONUT_CONFIG.R} 0 ${largeArcFlag} 1 ${x2} ${y2}`, // Clockwise arc along outer rim
			`L ${x3} ${y3}`, // Line straight inward to inner rim
			`A ${DONUT_CONFIG.INNER} ${DONUT_CONFIG.INNER} 0 ${largeArcFlag} 0 ${x4} ${y4}`, // Counter-clockwise arc along inner rim
			`Z` // Close the path back to (x1, y1)
		].join(' ');
	}

	const segments = $derived.by(() => {
		return slices
			.map((slice) => {
				const angleData = animatedAngles[slice.id] || targetAngles[slice.id];
				if (!angleData || angleData.sw < 0.002) return null;

				const isSel = !slice.isFree && selectedId === slice.id;

				return { slice, isSel, ...angleData };
			})
			.filter(
				(seg): seg is { slice: DonutSlice; isSel: boolean; startA: number; sw: number } =>
					seg !== null
			);
	});

	const selectedTask = $derived(selectedId ? tasks.find((task) => task.id === selectedId) : null);

	// Auto-detect "sleep" task by name (matches "sleep", "alvás", etc.)
	const isSleepName = (name: string) => /sleep|alv|rest|nap/i.test(name || '');
	const sleepTask = $derived(tasks.find((task) => isSleepName(task.name)));
	const sleepHours = $derived(sleepTask?.hours || 0);
	const workHours = $derived(
		tasks.filter((task) => task !== sleepTask).reduce((sum, task) => sum + task.hours, 0)
	);
</script>

<svg
	class="absolute top-0 left-0"
	width={sliderConfig.RING_SIZE}
	height={sliderConfig.RING_SIZE}
	style="pointer-events: none;"
>
	<g style="pointer-events: auto;">
		<!-- Donut segments -->
		{#each segments as seg (seg.slice.id)}
			{#if seg.slice.isFree}
				<path
					d={buildSegmentPath(seg.startA, seg.sw)}
					fill="var(--bg-track)"
					opacity={0.6}
					style="pointer-events: none;"
				/>
			{:else}
				<path
					d={buildSegmentPath(seg.startA, seg.sw)}
					fill={seg.slice.color}
					stroke={seg.isSel ? 'var(--text)' : 'var(--bg-elev)'}
					stroke-width={seg.isSel ? 2 : 1}
					role="button"
					tabindex={0}
					aria-label={`Select task ${seg.slice.name || ''}`}
					aria-pressed={seg.isSel}
					style="
                cursor: pointer;
                transition: stroke-width 0.15s, stroke 0.15s;
                filter: {seg.isSel ? `drop-shadow(0 0 8px ${seg.slice.color}aa)` : 'none'};
                pointer-events: auto;
                outline: none;
            "
					onclick={() => {
						onSelectTask(seg.slice.id === selectedId ? null : seg.slice.id);
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onSelectTask(seg.slice.id === selectedId ? null : seg.slice.id);
						}
					}}
				/>
			{/if}
		{/each}
		<!-- Center hole -->
		<circle
			cx={DONUT_CONFIG.CX}
			cy={DONUT_CONFIG.CY}
			r={DONUT_CONFIG.INNER - 1}
			fill="var(--bg-elev)"
			pointer-events="none"
		/>
		<!-- Center label -->
		<g pointer-events="none">
			{#if selectedTask}
				<text
					x={DONUT_CONFIG.CX}
					y={DONUT_CONFIG.CY - 4}
					text-anchor="middle"
					font-family="var(--font-mono)"
					font-size="22"
					fill={selectedTask.color}
					font-weight="600"
					letter-spacing="-0.02em"
				>
					{formatHours(selectedTask.hours)}
				</text>
				<text
					x={DONUT_CONFIG.CX}
					y={DONUT_CONFIG.CY + 14}
					text-anchor="middle"
					font-family="var(--font-sans)"
					font-size="11"
					fill="var(--text-2)"
					letter-spacing="-0.005em"
				>
					{selectedTask.name.length > 16 ? selectedTask.name.slice(0, 16) + '…' : selectedTask.name}
				</text>
			{:else if sleepTask}
				<text
					x={DONUT_CONFIG.CX}
					y={DONUT_CONFIG.CY - 4}
					text-anchor="middle"
					font-family="var(--font-sans)"
					font-size="22"
					fill={sleepTask.color}
					font-weight="600"
					letter-spacing="-0.02em"
				>
					{formatHours(sleepHours)}
					<tspan
						x={DONUT_CONFIG.CX}
						dy="18"
						font-size="13"
						font-weight="500"
						fill={sleepTask.color}
						opacity="0.9">sleep</tspan
					>
				</text>
				<text
					x={DONUT_CONFIG.CX}
					y={DONUT_CONFIG.CY + 30}
					text-anchor="middle"
					font-family="var(--font-sans)"
					font-size="11"
					fill="var(--text-3)"
					letter-spacing="-0.005em"
				>
					{workHours > 0 ? `${formatHours(workHours)} work` : 'no work yet'}
				</text>
			{:else}
				<text
					x={DONUT_CONFIG.CX}
					y={DONUT_CONFIG.CY - 4}
					text-anchor="middle"
					font-family="var(--font-sans)"
					font-size="22"
					fill={isOver ? 'var(--danger)' : 'var(--text)'}
					font-weight="600"
					letter-spacing="-0.02em"
				>
					{formatHours(total)}
				</text>
				<text
					x={DONUT_CONFIG.CX}
					y={DONUT_CONFIG.CY + 14}
					text-anchor="middle"
					font-family="var(--font-mono)"
					font-size="10"
					fill={isOver ? 'var(--danger)' : 'var(--text-3)'}
					letter-spacing="0.06em"
				>
					{isOver ? 'OVER' : `of ${formatHours(dayLen)}`}
				</text>
			{/if}
		</g>
	</g>
</svg>
