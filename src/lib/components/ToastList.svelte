<script lang="ts">
	import { toastService } from '$lib/services/ToastService.svelte';
	import { fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import Toast from './Toast.svelte';

	// get 4 most recent toasts
	const activeToasts = $derived([...toastService.toasts].reverse().slice(0, 4));
</script>

<div
	class="fixed left-1/2 -translate-x-1/2 bottom-[calc(24px+env(safe-area-inset-bottom,0px))]
           z-200 grid place-items-center w-max pointer-events-none"
>
	{#each activeToasts as toast, i (toast.id)}
		<div
			animate:flip={{ duration: 250 }}
			class="col-start-1 row-start-1 transition-all duration-300 ease-out pointer-events-auto"
			style="
                --index: {i};
                transform: translateY(calc(var(--index) * -8px)) scale(calc(1 - var(--index) * 0.04));
                z-index: {100 - i};
                opacity: {i === 3 ? 0 : 1 - i * 0.15};
            "
		>
			<div
				in:fly={{ y: 40, duration: 300, opacity: 0 }}
				out:fly={{ y: -15, duration: 200, opacity: 0 }}
			>
				<Toast {...toast} />
			</div>
		</div>
	{/each}
</div>
