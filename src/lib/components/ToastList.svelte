<script lang="ts">
	import { toastService } from '$lib/services/ToastService.svelte';
	import { fly } from 'svelte/transition';
	import Toast from './Toast.svelte';

	// Reverse so the newest toast is on top
	const activeToasts = $derived([...toastService.toasts].reverse());
</script>

<div
	class="fixed left-1/2 -translate-x-1/2 bottom-[calc(24px+env(safe-area-inset-bottom,0px))]
           z-200 grid place-items-center w-max pointer-events-none"
>
	{#each activeToasts as toast, i (toast.id)}
		{#if i < 4}
			<div
				in:fly={{ y: 30, duration: 280, opacity: 0 }}
				out:fly={{ y: -15, duration: 200, opacity: 0 }}
				class="col-start-1 row-start-1 transition-all duration-300 ease-out pointer-events-auto"
				style="
                    --index: {i};
                    transform: translateY(calc(var(--index) * -8px)) scale(calc(1 - var(--index) * 0.04));
                    z-index: {100 - i};
                    opacity: {i === 3 ? 0 : 1 - i * 0.15};
                "
			>
				<Toast {...toast} />
			</div>
		{/if}
	{/each}
</div>
