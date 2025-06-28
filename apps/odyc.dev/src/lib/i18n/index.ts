import { translations } from './ui'

export type Locale = (typeof locales)[number]

export const locales = ['fr', 'en'] as const
export const defaultLocale: Locale = 'en'

export const languages: Record<Locale, string> = {
	en: 'English',
	fr: 'Français',
}

export function useTranslations(lang: Locale) {
	return function t(key: keyof (typeof translations)[typeof defaultLocale]) {
		return translations[lang][key] || translations[defaultLocale][key]
	}
}

export function getLocaleByPath(path: string): Locale {
	if (!path.startsWith('/')) path = '/' + path
	const [, lang] = path.split('/')
	//@ts-ignore
	if (locales.includes(lang)) return lang as Locale
	return defaultLocale
}
