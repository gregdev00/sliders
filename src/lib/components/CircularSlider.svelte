<script lang="ts">
	interface Props {
		dayStart: number;
		dayEnd: number;
		nowHour: number;
		onChange?: (start: number, end: number) => void;
	}

	let { dayStart = 1, dayEnd = 6, nowHour = 2, onChange }: Props = $props();

	const RING_SIZE = 240,
		RING_CX = 120,
		RING_CY = 120,
		RING_R = 100,
		RING_THUMB = 14;

	const LERP_RING = 0.2;
	const TOL_SLIDER = 0.005;

	let svgRef: SVGElement | null = $state(null);
	let displayStartAngle = $state((() => hourToAngle(dayStart))());
	let displayEndAngle = $state((() => hourToAngle(dayEnd))());

	let targetStartAngle = $state((() => hourToAngle(dayStart))());
	let targetEndAngle = $state((() => hourToAngle(dayEnd))());

	let rafId: number | null = null;

	// if incoming properties change, run anim
	$effect(() => {
		if (!dragging) {
			targetStartAngle = hourToAngle(dayStart);
			targetEndAngle = hourToAngle(dayEnd);
			startAnim();
		}
	});

	// Cleanup animations on component destruction
	$effect(() => {
		return () => {
			if (rafId) cancelAnimationFrame(rafId);
		};
	});

	function startAnim() {
		if (rafId) return;

		const run = () => {
			const dS = angleDelta(displayStartAngle, targetStartAngle);
			const dE = angleDelta(displayEndAngle, targetEndAngle);

			displayStartAngle += dS * LERP_RING;
			displayEndAngle += dE * LERP_RING;

			if (Math.abs(dS) < TOL_SLIDER && Math.abs(dE) < TOL_SLIDER) {
				displayStartAngle = targetStartAngle;
				displayEndAngle = targetEndAngle;
				rafId = null;
				return;
			}

			rafId = requestAnimationFrame(run);
		};
		rafId = requestAnimationFrame(run);
	}

	function getAngle(e: PointerEvent): number {
		if (!svgRef) return 0;
		const rect = svgRef.getBoundingClientRect();
		const cx = e.clientX,
			cy = e.clientY;
		return Math.atan2(
			((cy - rect.top) / rect.height) * RING_SIZE - RING_CY,
			((cx - rect.left) / rect.width) * RING_SIZE - RING_CX
		);
	}

	let startHandlePos = $derived({
		x: RING_CX + RING_R * Math.cos(displayStartAngle),
		y: RING_CY + RING_R * Math.sin(displayStartAngle)
	});

	let endHandlePos = $derived({
		x: RING_CX + RING_R * Math.cos(displayEndAngle),
		y: RING_CY + RING_R * Math.sin(displayEndAngle)
	});

	let dragging = $state<'start' | 'end' | null>(null);

	function onUp(): void {
		dragging = null;
		targetStartAngle = hourToAngle(dayStart);
		targetEndAngle = hourToAngle(dayEnd);
		startAnim();
	}

	function onDown(which: 'start' | 'end') {
		return (e: PointerEvent) => {
			e.preventDefault();
			e.stopPropagation();

			dragging = which;

			const circle = e.currentTarget as SVGCircleElement;
			circle.setPointerCapture(e.pointerId);
		};
	}

	function onMove(e: PointerEvent): void {
		if (!dragging) return;

		const rawAngle = getAngle(e);
		const snappedHour = angleToHourSnapped(rawAngle);

		if (dragging === 'start') {
			targetStartAngle = rawAngle;
			startAnim();
			onChange?.(snappedHour, dayEnd);
		} else {
			targetEndAngle = rawAngle;
			startAnim();
			onChange?.(dayStart, snappedHour);
		}
	}

	function hourToAngle(hour: number): number {
		return (hour / 24) * 2 * Math.PI - Math.PI / 2;
	}

	function angleToHourSnapped(angle: number): number {
		return Math.round(((((((angle + Math.PI / 2) / (2 * Math.PI)) * 24) % 24) + 24) % 24) * 2) / 2;
	}

	function angleDelta(from: number, to: number): number {
		let delta = (((to - from) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		if (delta > Math.PI) delta -= 2 * Math.PI;
		return delta;
	}

	function ringArcPath(angleStart: number, angleEnd: number, radius: number): string {
		let span = (((angleEnd - angleStart) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		if (span < 0.001) span = 2 * Math.PI;
		const large = span > Math.PI ? 1 : 0;
		const x1 = RING_CX + radius * Math.cos(angleStart),
			y1 = RING_CY + radius * Math.sin(angleStart);
		const x2 = RING_CX + radius * Math.cos(angleEnd),
			y2 = RING_CY + radius * Math.sin(angleEnd);
		return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
	}

	interface Tick {
		x1: number;
		x2: number;
		y1: number;
		y2: number;
		h: number;
	}

	interface HourLabel {
		x: number;
		y: number;
		h: number;
	}

	const ticks: Tick[] = [];
	for (let h = 0; h < 24; h += 3) {
		const a = hourToAngle(h);
		const r1 = RING_R - 6,
			r2 = RING_R + 6;
		ticks.push({
			x1: RING_CX + r1 * Math.cos(a),
			y1: RING_CY + r1 * Math.sin(a),
			x2: RING_CX + r2 * Math.cos(a),
			y2: RING_CY + r2 * Math.sin(a),
			h
		});
	}

	const LABEL_OFFSET = RING_R + 22;

	const hourLabels: HourLabel[] = [0, 6, 12, 18].map((h) => {
		const a = hourToAngle(h);

		return {
			x: RING_CX + LABEL_OFFSET * Math.cos(a),
			y: RING_CY + LABEL_OFFSET * Math.sin(a),
			h
		};
	});

	let hourHandleCoords = $derived.by(() => {
		if (typeof nowHour !== 'number') return null;

		const a = hourToAngle(nowHour);
		const r1 = RING_R - 12;
		const r2 = RING_R + 12;

		return {
			x1: RING_CX + r1 * Math.cos(a),
			y1: RING_CY + r1 * Math.sin(a),
			x2: RING_CX + r2 * Math.cos(a),
			y2: RING_CY + r2 * Math.sin(a),
			dotX: RING_CX + (RING_R + 14) * Math.cos(a),
			dotY: RING_CY + (RING_R + 14) * Math.sin(a)
		};
	});
</script>

<div class="flex flex-col items-center gap-2 bg-bg-elev border border-border rounded-main p-5 mb-4">
	<div class="relative" style={`width: ${RING_SIZE}px; height: ${RING_SIZE}px;`}>
		<svg
			bind:this={svgRef}
			role="slider"
			aria-label="Slide around"
			aria-valuemin="0"
			aria-valuemax="100"
			aria-valuenow="0"
			aria-valuetext="asd"
			tabindex="0"
			class="block touch-none overflow-visible"
			width={RING_SIZE}
			height={RING_SIZE}
			onpointerup={onUp}
			onpointermove={onMove}
		>
			<!-- Outer track -->
			<circle
				cx={RING_CX}
				cy={RING_CY}
				r={RING_R}
				fill="none"
				stroke="var(--bg-track)"
				stroke-width="2"
			/>
			<!-- Hour ticks -->
			{#each ticks as tick}
				<line
					x1={tick.x1}
					y1={tick.y1}
					x2={tick.x2}
					y2={tick.y2}
					stroke="var(--text-4)"
					stroke-width="1"
					opacity={tick.h === 0 || tick.h === 12 ? 0.7 : 0.35}
				/>
			{/each}
			<!-- Hour labels -->
			{#each hourLabels as label}
				<text
					x={label.x}
					y={label.y + 4}
					text-anchor="middle"
					font-family="var(--font-mono)"
					font-size="10"
					fill="var(--text-4)"
					font-weight="500"
				>
					{String(label.h).padStart(2, '0')}
				</text>
			{/each}
			<!-- "now" indicator — live current time tick -->
			{#if hourHandleCoords}
				<g pointer-events="none">
					<line
						x1={hourHandleCoords.x1}
						y1={hourHandleCoords.y1}
						x2={hourHandleCoords.x2}
						y2={hourHandleCoords.y2}
						stroke="var(--accent-3)"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<circle
						cx={hourHandleCoords.dotX}
						cy={hourHandleCoords.dotY}
						r="3.5"
						fill="var(--accent-3)"
					>
						<animate attributeName="opacity" values="1;0.45;1" dur="2s" repeatCount="indefinite" />
					</circle>
				</g>
			{/if}
			<!-- Active arc -->
			<defs>
				<linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stop-color="var(--accent-2)" />
					<stop offset="100%" stop-color="var(--accent)" />
				</linearGradient>
			</defs>
			<path
				d={ringArcPath(displayStartAngle, displayEndAngle, RING_R)}
				fill="none"
				stroke="url(#arcGrad)"
				stroke-width="4"
				stroke-linecap="round"
				opacity={0.9}
			/>
			<!-- Day start hour generous hitbox -->
			<circle
				tabindex="0"
				role="slider"
				aria-label="Day start hour"
				aria-valuemin="0"
				aria-valuemax="24"
				aria-valuenow={dayStart}
				cx={startHandlePos.x}
				cy={startHandlePos.y}
				r="26"
				fill="transparent"
				style="cursor: grab;"
				onpointerdown={onDown('start')}
			/>
			<!-- Day start hour outer circle -->
			<circle
				cx={startHandlePos.x}
				cy={startHandlePos.y}
				r={RING_THUMB}
				fill="var(--bg-elev)"
				stroke="var(--accent-2)"
				stroke-width="3"
				pointer-events="none"
			/>
			<!-- Day start hour inner circle -->
			<circle
				cx={startHandlePos.x}
				cy={startHandlePos.y}
				r="4"
				fill="var(--accent-2)"
				pointer-events="none"
			/>
			<!-- Day end hour generous hitbox -->
			<circle
				tabindex="0"
				role="slider"
				aria-label="Day end hour"
				aria-valuemin="0"
				aria-valuemax="24"
				aria-valuenow={dayEnd}
				cx={endHandlePos.x}
				cy={endHandlePos.y}
				r="26"
				fill="transparent"
				style="cursor: grab;"
				onpointerdown={onDown('end')}
			/>
			<!-- Day end hour outer circle -->
			<circle
				cx={endHandlePos.x}
				cy={endHandlePos.y}
				r={RING_THUMB}
				fill="var(--bg-elev)"
				stroke="var(--accent)"
				stroke-width="3"
				pointer-events="none"
			/>
			<!-- Day end hour inner circle -->
			<circle
				cx={endHandlePos.x}
				cy={endHandlePos.y}
				r="4"
				fill="var(--accent)"
				pointer-events="none"
			/>
		</svg>
	</div>
</div>
