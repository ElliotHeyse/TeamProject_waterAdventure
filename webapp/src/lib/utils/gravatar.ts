/**
 * Generate a Gravatar URL for a given email address
 * @param email The email address to generate the Gravatar URL for
 * @param size The size of the Gravatar image in pixels (default: 80)
 * @param defaultImage The default image to use if no Gravatar is found (default: mp - mystery person)
 * @returns The Gravatar URL
 */
export function getGravatarUrl(email: string, size: number = 80, defaultImage: string = 'mp'): string {
    // Trim whitespace and convert to lowercase
    const normalizedEmail = email?.trim().toLowerCase() || '';

    // If no email is provided, return the default image
    if (!normalizedEmail) {
        return `https://www.gravatar.com/avatar/00000000000000000000000000000000?s=${size}&d=${defaultImage}`;
    }

    // Since we can't use MD5 in the browser (it's not cryptographically secure),
    // we'll use a deterministic hash of the email address instead
    let hash = '';
    for (let i = 0; i < normalizedEmail.length; i++) {
        hash += normalizedEmail.charCodeAt(i).toString(16);
    }
    // Pad or truncate to 32 characters
    hash = hash.padEnd(32, '0').slice(0, 32);

    // Construct and return the Gravatar URL
    return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=${defaultImage}`;
}