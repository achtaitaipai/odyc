import type { Locale } from '.'

export const translations = {
	en: {
		'nav.docs': 'Docs',
		'nav.playground': 'Playground',
		'docs.summary': 'Summary',
		'docs.navigation.aria': 'Documentation navigation',
		'docs.menu.open.aria': 'Open navigation menu',
	},
	fr: {
		'nav.docs': 'Documentation',
		'nav.playground': 'Éditeur',
		'docs.summary': 'Sommaire',
		'docs.navigation.aria': 'Navigation de la documentation',
		'docs.menu.open.aria': 'Ouvrir le menu de navigation',
	},
} as const satisfies Record<Locale, Record<string, string>>
