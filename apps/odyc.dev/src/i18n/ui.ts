import type { Locale } from '.'

export const translations: Record<Locale, { [key: string]: string }> = {
	en: {
		'nav.docs': 'Docs',
		'nav.playground': 'Playground',
	},
	fr: {
		'nav.docs': 'Documentation',
		'nav.playground': 'Éditeur',
	},
} as const
