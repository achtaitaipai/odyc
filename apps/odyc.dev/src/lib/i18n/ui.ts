import type { Locale } from '.'

export const translations: Record<Locale, { [key: string]: string }> = {
	en: {
		'nav.docs': 'Docs',
		'nav.playground': 'Playground',
		'ui.search': 'Search',
	},
	fr: {
		'nav.docs': 'Documentation',
		'nav.playground': 'Éditeur',
		'ui.search': 'Rechercher',
	},
} as const
