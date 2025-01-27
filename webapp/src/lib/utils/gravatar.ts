import md5 from 'crypto-js/md5';

/**
 * Generate a Gravatar URL for a given email address
 * @param email The email address to generate the Gravatar URL for
 * @param size The size of the Gravatar image in pixels (default: 80)
 * @param defaultImage The default image to use if no Gravatar is found (default: mp - mystery person)
 * @returns The Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 80, defaultImage: string = 'mp'): string {
    // Construct and return the Gravatar URL
    return `https://www.gravatar.com/avatar/${md5(email)}?s=${size}&d=${defaultImage}`;
}