<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import TaskList from '$lib/components/TaskList.svelte';

	let helpModalOpen = $state(false);
</script>

<Header onHelpClick={() => (helpModalOpen = true)} />

<div class="mb-3.5">
	<TaskList />
</div>

<Modal bind:isOpen={helpModalOpen}>asd</Modal>
