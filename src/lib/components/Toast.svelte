<script lang="ts">
	import type { Toast } from '$lib/types/toast';

	interface Props extends Omit<Toast, 'type' | 'id'> {
		type?: Toast['type'];
	}

	let { message, type = 'info' }: Props = $props();

	const TOAST_THEME = {
		info: {
			toastBg: 'bg-bg-elev',
			dotBg: 'bg-accent-2'
		},
		error: {
			toastBg: 'bg-danger',
			dotBg: 'bg-danger'
		}
	} as const;

	const theme = $derived(TOAST_THEME[type] || TOAST_THEME.info);
</script>

<div
	class="inline-flex items-center gap-2 shadow-lg rounded-full border border-border font-[13px] text-text px-4.5 py-2.5 {theme.toastBg}"
>
	<span class="size-1.5 rounded-full {theme.dotBg}"></span>
	<span>{message}</span>
</div>
