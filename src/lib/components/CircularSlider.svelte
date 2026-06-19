<script lang="ts">
	interface Props {
		dayStart: number;
		dayEnd: number;
		nowHour: number;
		onChange?: void;
	}

	const RING_SIZE = 240,
		RING_CX = 120,
		RING_CY = 120,
		RING_R = 100,
		RING_THUMB = 14;

	let dragging = $state(false);

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

	function onUp(): void {}

	function onMove(): void {}

	function hourToAngle(hour: number): number {
		return (hour / 24) * 2 * Math.PI - Math.PI / 2;
	}
</script>

<div class="flex flex-col items-center gap-2 bg-bg-elev border border-border rounded-main p-5 mb-4">
	<div class="relative" style={`width: ${RING_SIZE}px; height: ${RING_SIZE}px;`}>
		<svg
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
					font-weight="500">{String(label.h).padStart(2, '0')}</text
				>
			{/each}
		</svg>
	</div>
</div>
