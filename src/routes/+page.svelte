<script lang="ts">
	import CircularSlider from '$lib/components/CircularSlider.svelte';
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import TaskList from '$lib/components/TaskList.svelte';

	let helpModalOpen = $state(false);
</script>

<Header onHelpClick={() => (helpModalOpen = true)} />

<div class="grid grid-cols-[380px_1fr] gap-6 items-start px-5 py-4">
	<div class="sticky top-32.5 self-start">
		<CircularSlider />
	</div>
	<div>
		<div class="flex gap-2 mb-3.5">Settings</div>
		<div class="mb-3.5">
			<TaskList />
		</div>
	</div>
</div>

<Modal bind:isOpen={helpModalOpen}>asd</Modal>
