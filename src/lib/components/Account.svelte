<script lang="ts">
	import { authService } from '$lib/services/AuthService.svelte';
	import Button from '$lib/components/Button.svelte';
	import SyncBadge from './SyncBadge.svelte';

	async function onSignIn(): Promise<void> {
		await authService.signInWithGoogle();
	}

	async function onSignOut(): Promise<void> {
		await authService.signOut();
	}
</script>

<div
	class="flex items-center justify-between text-[11px] tracking-[0.06em] font-mono text-text-3 uppercase font-medium mb-2"
>
	<span>Account & sync</span>
	{#if authService.isAuthenticated}
		<SyncBadge />
	{/if}
</div>
<div class="p-3.5 bg-bg-input border border-border rounded-main">
	{#if authService.user}
		<div class="flex items-center gap-2.5 mb-3">
			<img
				class="size-9 rounded-full object-cover"
				src={authService.user.photoURL}
				referrerpolicy="no-referrer"
				alt="User profile"
			/>
			<div class="min-w-0 flex-1">
				<div
					class="text-[13px] font-medium color-text overflow-hidden text-ellipsis whitespace-nowrap"
				>
					{authService.user.displayName}
				</div>
				<div class="text-[11px] text-text-3 overflow-hidden text-ellipsis whitespace-nowrap">
					{authService.user.email}
				</div>
			</div>
		</div>
		<Button class="w-full" onclick={onSignOut}>Sign out</Button>
	{:else}
		<div class="text-[13px] text-text-2 mb-2.5 leading-normal">
			Sign in to sync your tasks, week plan and settings across all your devices. Your data stays
			private — only you can read it.
		</div>
		<Button class="w-full" onclick={onSignIn} disabled={authService.isSigningIn}>
			<svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"
				><path
					fill="#FFC107"
					d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
				></path><path
					fill="#FF3D00"
					d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
				></path><path
					fill="#4CAF50"
					d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.3-7.2 2.3-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
				></path><path
					fill="#1976D2"
					d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C41.4 35.4 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"
				></path></svg
			>
			{authService.isSigningIn ? 'Opening...' : 'Sign in with Google'}
		</Button>
	{/if}
</div>
