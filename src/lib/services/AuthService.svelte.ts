// src/lib/services/AuthService.svelte.ts
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';

import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';

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

	constructor() {
		const app = initializeApp(firebaseConfig);
		this.#auth = getAuth(app);

		this.#auth.onAuthStateChanged(async (user: User | null) => {
			this.#user = user;
			this.#loading = false;
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
			console.error('Google Sign-In failed:', error);
		} finally {
			this.#isSigningIn = false;
		}
	}

	async signOut() {
		if (!this.#auth) return;
		try {
			await this.#auth.signOut();
		} catch (error) {
			console.error('Sign-Out failed:', error);
		}
	}
}

export const authService = new AuthService();
