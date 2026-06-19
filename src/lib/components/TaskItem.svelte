<script lang="ts">
	import type { Task } from '$lib/types/task';
	import Button from './Button.svelte';
	import TimeSlider from './TimeSlider.svelte';

	let { id, name, hours, originalHours, color, locked, actual }: Task = $props();
</script>

<div class="opacity-100 transform-none duration-150">
	<div
		class="transition-[border-color_0.2s,box-shadow_0.2s] relative pt-3.5 pb-3 px-3.5 mb-2 select-none bg-bg-elev border border-border rounded-main overflow-hidden"
	>
		<div class="flex items-center gap-2.5 mb-2.5 relative">
			<button
				class="w-3.5 h-3.5 rounded-full border-[medium] bg-current border-current p-0 shrink-0 cursor-pointer shadow-[0_0_0_2px_rgba(132,204,22,0.2)]"
				aria-label="Edit color"
				style="color:{color}"
			></button>
			<div class="flex-1 min-w-0">
				<div
					class="flex items-center gap-2 mb-0.5 tracking-[-0.01em] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer text-[15px] font-medium text-text"
				>
					<span class="overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
				</div>
				<div class="flex gap-2 items-center font-mono text-[11px] text-text-3">
					<span>08:00</span>
					<span>→</span>
					<span>10:15</span>
					<span class="opacity-40 mx-1 my-0">·</span>
					<span class="font-medium" style="color:{color}">2h 15m</span>
				</div>
			</div>
			<div class="flex gap-0.5 shrink-0">
				<div class="flex gap-px mr-1">
					<Button iconOnly outline size="sm" aria-label="Decrease {name}"
						><svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg
						></Button
					>
					<Button iconOnly outline size="sm" aria-label="Increase {name}">
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"
							></line></svg
						>
					</Button>
				</div>
				<Button iconOnly outline size="sm" aria-label="Save favourite">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><polygon
							points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
						></polygon></svg
					>
				</Button>
				<Button iconOnly outline size="sm" aria-label="Lock">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><rect x="3" y="11" width="18" height="11" rx="2"></rect><path
							d="M7 11V7a5 5 0 0 1 9.9-1"
						></path></svg
					>
				</Button>
				<Button iconOnly outline size="sm" aria-label="Delete">
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
						></line></svg
					>
				</Button>
			</div>
		</div>
		<TimeSlider min={0} max={14} value={5} {color} />
	</div>
</div>
