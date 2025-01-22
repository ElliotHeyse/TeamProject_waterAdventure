import { writable } from 'svelte/store';

export type Theme = 'LIGHT' | 'DARK';
export type Language = 'en' | 'nl' | 'fr';

export interface UserSettings {
    pushNotifications: boolean;
    emailNotifications: boolean;
    theme: Theme;
    language: Language;
}

const defaultSettings: UserSettings = {
    pushNotifications: false,
    emailNotifications: false,
    theme: 'LIGHT',
    language: 'en'
};

function createUserSettingsStore() {
    const { subscribe, set, update } = writable<UserSettings>(defaultSettings);

    return {
        subscribe,
        set,
        async load() {
            try {
                const response = await fetch('/api/user/settings');
                if (response.ok) {
                    const settings = await response.json();
                    set(settings);
                    // Apply theme
                    document.documentElement.classList.toggle('dark', settings.theme === 'DARK');
                }
            } catch (err) {
                console.error('Failed to load user settings:', err);
            }
        },
        async updateSettings(updates: Partial<UserSettings>) {
            try {
                const response = await fetch('/api/user/settings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });

                if (response.ok) {
                    const settings = await response.json();
                    set(settings);
                    // Apply theme if it was updated
                    if ('theme' in updates) {
                        document.documentElement.classList.toggle('dark', settings.theme === 'DARK');
                    }
                    return true;
                }
                return false;
            } catch (err) {
                console.error('Failed to update user settings:', err);
                return false;
            }
        }
    };
}

export const userSettings = createUserSettingsStore();