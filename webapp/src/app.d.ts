import type { AvailableLanguageTag } from "../../lib/paraglide/runtime"
import type { ParaglideLocals } from "@inlang/paraglide-sveltekit"
import type { User } from '@prisma/client';

// See https://kit.svelte.dev/docs/types#app
declare global {
	namespace App {
		interface Locals {
    paraglide: ParaglideLocals<AvailableLanguageTag>,

			user: User | null;
		}
	}
}

export {};
