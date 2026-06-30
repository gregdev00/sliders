<script lang="ts">
	import type { Task } from '$lib/types/task';
	import { formatHours, formatTime } from '$lib/utils/formatUtils';
	import Button from './Button.svelte';
	import TimeSlider from './TimeSlider.svelte';
	import clsx from 'clsx';

	interface Props {
		task: Task;
		taskStart: number;
		stepMinutes: number;
		dayLen: number;
		isActive?: boolean;
		isFavourite?: boolean;
		progress: number | undefined;
		onDelete: (id: string) => void;
		onFavourite: (id: string) => void;
		onEdit: (task: Task) => void;
		onLock: (id: string, updatedFields: Partial<Task>) => void;
		onChange: (id: string, updatedFields: Partial<Task>) => void;
	}

	let {
		task,
		taskStart,
		stepMinutes,
		dayLen,
		isActive = true,
		isFavourite = false,
		progress,
		onDelete,
		onFavourite,
		onEdit,
		onLock,
		onChange
	}: Props = $props();

	let isMenuOpen = $state(false);

	const taskEnd = $derived(taskStart + task.hours);
	const stepH = $derived(stepMinutes / 60);

	const nudge = (dir: number) => {
		if (task.locked) return;
		const next = Math.max(0, Math.min(dayLen, task.hours + dir * stepH));
		onChange?.(task.id, {
			hours: (Math.round((next * 60) / stepMinutes) * stepMinutes) / 60
		});
	};
</script>

<div class="opacity-100 transform-none duration-150">
	<div
		role="listitem"
		class={clsx(
			'transition-[border-color_0.2s,box-shadow_0.2s] relative pt-3.5 pb-3 px-3.5 mb-2 select-none bg-bg-elev border rounded-main overflow-hidden',
			'border-border'
		)}
		style:border-color={isActive ? task.color : null}
		style:box-shadow={isActive ? `0 0 0 1px ${task.color}55, 0 4px 16px ${task.color}22` : null}
		oncontextmenu={(e) => e.preventDefault()}
	>
		{#if isActive && typeof progress === 'number'}
			<div
				class="absolute left-0 top-0 bottom-0 pointer-events-none"
				style="width: {Math.max(
					0,
					Math.min(100, progress * 100)
				)}%; background: linear-gradient(90deg, {task.color}10, {task.color}05);"
			></div>
		{/if}

		<div class="flex items-center flex-wrap gap-2.5 mb-2.5 relative">
			<button
				onclick={() => onEdit({ ...task })}
				class="hidden md:block w-3.5 h-3.5 rounded-full border-[medium] bg-current border-current p-0 shrink-0 cursor-pointer shadow-[0_0_0_2px_rgba(132,204,22,0.2)]"
				aria-label="Edit color"
				style="color:{task.color}"
			></button>

			<div class="flex-1 min-w-32">
				<button
					onclick={() => onEdit({ ...task })}
					class="w-full flex items-center gap-2 mb-0.5 tracking-[-0.01em] overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-medium text-text disabled:cursor-default md:cursor-pointer"
					type="button"
					disabled={typeof window !== 'undefined' && window.innerWidth < 768}
				>
					<span class="overflow-hidden text-ellipsis whitespace-nowrap">{task.name}</span>
					{#if isActive}
						<span
							class="inline-flex items-center gap-1 px-1.75 py-0.5 rounded-full font-mono text-[9px] font-semibold shrink-0 tracking-[0.08em] uppercase"
							style="background: {task.color}22; color: {task.color}"
						>
							<span class="size-1.25 rounded-full animate-pulse" style="background: {task.color}"
							></span>
							Now
						</span>
					{/if}
				</button>
				<div class="flex gap-2 items-center font-mono text-[11px] text-text-3">
					<span>{formatTime(taskStart)}</span>
					<span class="opacity-40">→</span>
					<span>{formatTime(taskEnd)}</span>
					<span class="opacity-40 mx-1 my-0">·</span>
					<span class="font-medium" style="color:{task.color}">{formatHours(task.hours)}</span>
				</div>
			</div>

			<div class="flex gap-1 items-center shrink-0 relative">
				{#if !task.locked}
					<div class="hidden md:flex gap-px mr-1">
						<Button
							onclick={() => nudge(-1)}
							iconOnly
							outline
							ghost
							size="sm"
							aria-label="Decrease {task.name}"
							style="color: var(--text-4)"
						>
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg
							>
						</Button>
						<Button
							onclick={() => nudge(1)}
							iconOnly
							outline
							ghost
							size="sm"
							aria-label="Increase {task.name}"
							style="color: var(--text-4)"
						>
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
				{/if}

				<div class="hidden md:flex gap-0.5 items-center">
					<Button
						onclick={() => onFavourite(task.id)}
						iconOnly
						outline
						ghost
						size="sm"
						style="color: {isFavourite ? 'var(--accent-3)' : 'var(--text-4)'}"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill={isFavourite ? 'currentColor' : 'none'}
							stroke="currentColor"
							stroke-width="2"
							><polygon
								points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
							/></svg
						>
					</Button>

					<Button
						onclick={() => onLock(task.id, { locked: !task.locked })}
						iconOnly
						outline
						ghost
						size="sm"
						style="color: {task.locked ? 'var(--accent-2)' : 'var(--text-4)'}"
					>
						{#if task.locked}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								><rect x="3" y="11" width="18" height="11" rx="2" /><path
									d="M7 11V7a5 5 0 0 1 10 0v4"
								/></svg
							>
						{:else}
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								><rect x="3" y="11" width="18" height="11" rx="2"></rect><path
									d="M7 11V7a5 5 0 0 1 9.9-1"
								></path></svg
							>
						{/if}
					</Button>
				</div>

				<div class="block md:hidden relative">
					<Button
						iconOnly
						outline
						ghost
						size="sm"
						aria-label="More options"
						style="color: var(--text-4)"
						onclick={() => (isMenuOpen = !isMenuOpen)}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
						>
							<circle cx="12" cy="12" r="1" fill="currentColor"></circle>
							<circle cx="12" cy="5" r="1" fill="currentColor"></circle>
							<circle cx="12" cy="19" r="1" fill="currentColor"></circle>
						</svg>
					</Button>

					{#if isMenuOpen}
						<button
							class="fixed inset-0 z-10 cursor-default"
							onclick={() => (isMenuOpen = false)}
							aria-label="Close menu"
						></button>

						<div
							class="absolute right-0 top-full mt-1 bg-bg-elev border border-border rounded-main shadow-lg p-1.5 flex gap-1 items-center z-20"
						>
							{#if !task.locked}
								<Button
									onclick={() => nudge(-1)}
									iconOnly
									outline
									ghost
									size="sm"
									style="color: var(--text-4)"
								>
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg
									>
								</Button>
								<Button
									onclick={() => nudge(1)}
									iconOnly
									outline
									ghost
									size="sm"
									style="color: var(--text-4)"
								>
									<svg
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2.5"
										><line x1="12" y1="5" x2="12" y2="19"></line><line
											x1="5"
											y1="12"
											x2="19"
											y2="12"
										></line></svg
									>
								</Button>
								<div class="w-px h-4 bg-border mx-0.5"></div>
							{/if}

							<Button
								onclick={() => {
									onEdit({ ...task });
									isMenuOpen = false;
								}}
								iconOnly
								outline
								ghost
								size="sm"
								style="color: var(--text-4)"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
									><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path
										d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
									></path></svg
								>
							</Button>

							<Button
								onclick={() => {
									onFavourite(task.id);
									isMenuOpen = false;
								}}
								iconOnly
								outline
								ghost
								size="sm"
								style="color: {isFavourite ? 'var(--accent-3)' : 'var(--text-4)'}"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill={isFavourite ? 'currentColor' : 'none'}
									stroke="currentColor"
									stroke-width="2"
									><polygon
										points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
									/></svg
								>
							</Button>

							<Button
								onclick={() => {
									onLock(task.id, { locked: !task.locked });
									isMenuOpen = false;
								}}
								iconOnly
								outline
								ghost
								size="sm"
								style="color: {task.locked ? 'var(--accent-2)' : 'var(--text-4)'}"
							>
								{#if task.locked}
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										><rect x="3" y="11" width="18" height="11" rx="2" /><path
											d="M7 11V7a5 5 0 0 1 10 0v4"
										/></svg
									>
								{:else}
									<svg
										width="16"
										height="16"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										><rect x="3" y="11" width="18" height="11" rx="2"></rect><path
											d="M7 11V7a5 5 0 0 1 9.9-1"
										></path></svg
									>
								{/if}
							</Button>
						</div>
					{/if}
				</div>

				{#if !task.locked}
					<Button
						iconOnly
						outline
						ghost
						color="danger"
						size="sm"
						aria-label="Delete"
						onclick={() => onDelete?.(task.id)}
					>
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
				{/if}
			</div>
		</div>

		<TimeSlider
			ariaLabel={`${task.name} hours`}
			min={0}
			max={dayLen}
			step={stepMinutes}
			value={task.hours}
			color={task.color}
			locked={task.locked}
			onChange={(hours) => onChange(task.id, { hours: hours })}
		/>
	</div>
</div>
