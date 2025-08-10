import { defaultLocale } from './i18n';

export function useDurationFrom(locale = defaultLocale) {
	return function (from: string) {
		const date = new Date(from);

		const now = new Date();
		const diffMs = date.getTime() - now.getTime();

		// Convert milliseconds to seconds
		const diffSeconds = Math.round(diffMs / 1000);

		// Define time units in seconds
		const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
			['year', 365 * 24 * 60 * 60],
			['month', 30 * 24 * 60 * 60],
			['week', 7 * 24 * 60 * 60],
			['day', 24 * 60 * 60],
			['hour', 60 * 60],
			['minute', 60],
			['second', 1]
		];

		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

		// Find the largest unit that makes sense
		for (const [unit, secondsInUnit] of units) {
			const value = diffSeconds / secondsInUnit;

			if (Math.abs(value) >= 1) {
				return rtf.format(Math.round(value), unit);
			}
		}

		// Fallback for very small differences
		return rtf.format(0, 'second');
	};
}
