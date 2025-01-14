import { writable } from 'svelte/store';

export const isMobileView = writable(false);

// Set up the media query listener if we're in the browser
if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(max-width: 768px)'); // Adjust breakpoint as needed
    
    // Initial value
    isMobileView.set(mediaQuery.matches);
    
    // Update the store whenever the viewport changes
    mediaQuery.addEventListener('change', (e) => {
        isMobileView.set(e.matches);
    });
}