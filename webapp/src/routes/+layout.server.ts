import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user) {
        return {
            user: null,
            settings: null
        };
    }

    const settings = await prisma.userSettings.findUnique({
        where: { userId: locals.user.id }
    });

    return {
        user: locals.user,
        settings: settings || {
            pushNotifications: true,
            emailNotifications: true,
            themeMode: 'LIGHT',
            language: 'en'
        }
    };
};