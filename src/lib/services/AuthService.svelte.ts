// src/lib/services/AuthService.svelte.ts
import { initializeApp, FirebaseError } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';

import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';
import { toastService } from './ToastService.svelte';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID
};

class AuthService {
	#user: User | null = $state(null);
	#loading = $state(true);
	#isSigningIn = $state(false);
	#auth;

	#isFirstAuthCheck = true;

	constructor() {
		const app = initializeApp(firebaseConfig);
		this.#auth = getAuth(app);

		this.#auth.onAuthStateChanged(async (user: User | null) => {
			const previouslyAuthenticated = this.#user !== null;

			this.#user = user;
			this.#loading = false;

			// Trigger the success toast ONLY if this isn't the initial background app mount check
			if (user && (!this.#isFirstAuthCheck || this.#isSigningIn)) {
				// Ensure we don't spam toasts on accidental double calls
				if (!previouslyAuthenticated) {
					toastService.showToast(`Welcome, ${user.displayName || 'User'}!`, 'info');
				}
			}

			this.#isFirstAuthCheck = false;
		});
	}

	get user() {
		return this.#user;
	}
	get loading() {
		return this.#loading;
	}
	get isSigningIn() {
		return this.#isSigningIn;
	}
	get isAuthenticated() {
		return this.#user !== null;
	}

	async signInWithGoogle() {
		if (!this.#auth) return;
		const provider = new GoogleAuthProvider();

		this.#isSigningIn = true;
		try {
			await signInWithPopup(this.#auth, provider);
		} catch (error) {
			let errorMessage = 'An unexpected error occurred.';

			if (error instanceof FirebaseError) {
				errorMessage = error.message;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}

			toastService.showToast('Google Sign-in failed: ' + errorMessage, 'error');
		} finally {
			this.#isSigningIn = false;
		}
	}

	async signOut() {
		if (!this.#auth) return;
		try {
			await this.#auth.signOut();
			toastService.showToast('Signed out');
		} catch (error) {
			const errMsg = error instanceof Error ? error.message : String(error);
			console.error('Sign-Out failed:', errMsg);
		}
	}
}

export const authService = new AuthService();
