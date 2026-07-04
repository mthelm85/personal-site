import type { CapabilityReport, Tier } from './capability';

export type PanelId = 'about' | 'contact' | 'placard:sapling';

/**
 * Global garden state (rune-based). Grows with the milestones —
 * audio and the visited set arrive in M5+.
 */
class GardenState {
	/** null until the capability probe finishes. */
	report = $state<CapabilityReport | null>(null);

	/** Landing overlay dismissed — the visitor is in the garden. */
	entered = $state(false);

	/** Open DOM content panel, if any. */
	panel = $state<PanelId | null>(null);

	get tier(): Tier | null {
		return this.report?.tier ?? null;
	}
}

export const garden = new GardenState();
