<script lang="ts">
	const RING_SIZE = 240,
		RING_CX = 120,
		RING_CY = 120,
		RING_R = 100,
		RING_THUMB = 14;

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
		</svg>
	</div>
</div>
