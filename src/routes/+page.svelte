<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';

	let helpModalOpen = $state(false);
</script>

<Header onHelpClick={() => (helpModalOpen = true)} />
<Modal bind:isOpen={helpModalOpen}>asd</Modal>
