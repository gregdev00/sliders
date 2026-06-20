export type ToastType = 'info' | 'error';

export interface Toast {
	id: string;
	message: string;
	type: ToastType;
}
