<script lang="ts">
	import type { Task } from '$lib/types/task';

	interface Props {
		task: Task;
		snapSize: number;
		onHoursChange: (hour: number) => void;
		onDelete: (id: string) => void;
	}

	let { task, snapSize, onHoursChange, onDelete }: Props = $props();
</script>
