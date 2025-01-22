import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/db';
import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import type { Theme, Language, UserSettings } from '$lib/stores/userSettings';

const defaultSettings: UserSettings = {
    pushNotifications: false,
    emailNotifications: false,
    theme: 'LIGHT',
    language: 'en'
};

function isValidTheme(value: any): value is Theme {
    return value === 'LIGHT' || value === 'DARK';
}

function isValidLanguage(value: any): value is Language {
    return value === 'en' || value === 'nl' || value === 'fr';
}

function validateUpdateData(data: any): Partial<UserSettings> {
    const validatedData: Partial<UserSettings> = {};

    if ('pushNotifications' in data) {
        validatedData.pushNotifications = Boolean(data.pushNotifications);
    }
    if ('emailNotifications' in data) {
        validatedData.emailNotifications = Boolean(data.emailNotifications);
    }
    if ('theme' in data && isValidTheme(data.theme)) {
        validatedData.theme = data.theme;
    }
    if ('language' in data && isValidLanguage(data.language)) {
        validatedData.language = data.language;
    }

    return validatedData;
}

export const GET: RequestHandler = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const settings = await prisma.userSettings.findUnique({
        where: { userId: locals.user.id }
    });

    if (!settings) {
        // Return default settings if none exist
        return json(defaultSettings);
    }

    return json(settings);
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const rawData = await request.json();
    const validatedData = validateUpdateData(rawData);

    if (Object.keys(validatedData).length === 0) {
        throw error(400, 'No valid settings to update');
    }

    try {
        const settings = await prisma.userSettings.upsert({
            where: { userId: locals.user.id },
            update: validatedData,
            create: {
                userId: locals.user.id,
                ...defaultSettings,
                ...validatedData
            }
        });

        return json(settings);
    } catch (err) {
        console.error('Failed to update user settings:', err);
        throw error(500, 'Failed to update settings');
    }
};