import type { Settings } from '$lib/types/settings';

class SettingsService implements Settings {
	#showTimeLine = $state(true);
	#snapSize = $state(15);
	#dark = $state(false);

	get showTimeline() {
		return this.#showTimeLine;
	}
	set showTimeline(v) {
		this.#showTimeLine = v;
	}

	get snapSize() {
		return this.#snapSize;
	}
	set snapSize(v) {
		this.#snapSize = v;
	}

	get dark() {
		return this.#dark;
	}
	set dark(v) {
		this.#dark = v;
	}
}

export const settingsService = new SettingsService();
