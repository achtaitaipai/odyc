import type { Locale } from './index.ts';

export const translations = {
	en: {
		'overview.yourGames': 'Your Games',
		'overview.createFirstGame': 'Create your first game!',
		'overview.collaborations': 'Your Collaborations',
		'overview.noCollaboration': "You have not yet collaborated on someone else's game.",

		settings: 'Settings',

		'ui.nothingHere': 'Nothing here yet',
		'ui.lastModified': 'Last modified',

		'games.create': 'Create Game'
	},
	fr: {
		'overview.yourGames': 'Vos Jeux',
		'overview.createFirstGame': 'Créez votre premier jeu!',
		'overview.collaborations': 'Vos Collaborations',
		'overview.noCollaboration': "Vous n'avez pas encore collaboré sur le jeu d'une autre personne.",

		settings: 'Réglages',

		'ui.nothingHere': 'Rien pour le moment',
		'ui.lastModified': 'Dernière modification',

		'games.create': 'Créer un jeu'
	}
} as const;
