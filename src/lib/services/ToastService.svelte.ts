import { TOAST_CONFIG } from '$lib/constants/toasts';
import type { Toast, ToastType } from '$lib/types/toast';

class ToastService {
	#toasts = $state<Toast[]>([]);

	get toasts() {
		return this.#toasts;
	}

	showToast(
		message: string,
		type: ToastType = 'info',
		durationMs = TOAST_CONFIG.VISIBLE_DURATION_MS
	) {
		const id = crypto.randomUUID();

		this.#toasts.push({ id, message, type });

		if (durationMs > 0) setTimeout(() => this.dismissToast(id), durationMs);
	}

	dismissToast(id: string) {
		const index = this.#toasts.findIndex((toast) => toast.id === id);
		if (index !== -1) this.#toasts.splice(index, 1);
	}
}

export const toastService = new ToastService();
