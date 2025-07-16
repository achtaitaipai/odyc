import { translations } from './translations';

export const locales = ['en', 'fr'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const languages: Record<Locale, string> = {
	en: 'English',
	fr: 'Français'
};

export function useTranslations(locale = defaultLocale) {
	return function t(key: keyof (typeof translations)[typeof defaultLocale]) {
		return translations[locale][key] || translations[defaultLocale][key];
	};
}
