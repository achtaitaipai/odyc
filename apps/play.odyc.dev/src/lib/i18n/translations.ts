import type { Locale } from './index.ts';

export const translations = {
	en: {
		// Overview
		'overview.yourGames': 'Your Games',
		'overview.createFirstGame': 'Create your first game!',
		'overview.collaborations': 'Your Collaborations',
		'overview.noCollaboration': "You have not yet collaborated on someone else's game.",

		// Navigation
		'nav.home': 'Home',
		'nav.myProfile': 'My Profile',
		'nav.settings': 'Settings',
		'nav.signIn': 'Sign In',
		'nav.logout': 'Log out',
		'nav.feedback': 'Feedback',
		'nav.dashboard': 'Dashboard',
		'nav.documentation': 'Documentation',
		'nav.github': 'GitHub',
		'nav.discord': 'Discord',

		// Authentication
		'auth.welcome': 'Welcome to Odyc.js Play',
		'auth.welcomeDescription': 'Create and share your pixel-perfect games with the community',
		'auth.email': 'Email',
		'auth.signIn': 'Sign in',
		'auth.continue': 'Continue',
		'auth.or': 'Or',
		'auth.signInWith': 'Sign in with',
		'auth.emailSent': 'Email with OTP was sent to your inbox.',
		'auth.signInSuccess': 'Successfully signed in. Welcome!',
		'auth.enterCode': 'Enter the 6-digit code sent to your email',
		'auth.anonymousContinue': 'Continue as guest',
		'auth.guestAccountWarning': 'You are using guest account!',
		'auth.guestAccountDescription': 'Everything you do is saved, but only this computer can access it.',
		'auth.connectWithGitHub': 'Connect with GitHub',
		'auth.newHere': 'Are you new here?',
		'auth.firstTimeConnecting': 'If it\'s your first time connecting with GitHub, please',
		'auth.signInToExisting': 'Sign in to existing account',

		// Settings & Profile
		settings: 'Settings',
		'profile.settings': 'Profile settings',
		'profile.settingsDescription': 'Configure your public presence on Odyc.js Play',
		'profile.accountPreferences': 'Account preferences',
		'profile.accountPreferencesDescription': 'Configure settings for your Odyc Play account',
		'profile.name': 'Name',
		'profile.description': 'Description',
		'profile.picture': 'Profile picture',
		'profile.pictureEditor': 'Profile picture editor',
		'profile.pictureEditorDescription': 'Paint your own avatar.',
		'profile.openEditor': 'Open editor',
		'profile.closeEditor': 'Close editor',
		'profile.updateProfile': 'Update profile',
		'profile.updatePreferences': 'Update preferences',
		'profile.preferredLanguage': 'Preferred language',
		'profile.enableVim': 'Enable Vim mode',
		'profile.enableVimDescription': 'Toggles support for Vim keybindings in code editor.',
		'profile.anonymous': 'Anonymous',
		'profile.gamesCreated': 'Games created',
		'profile.gameCreated': 'Game created',
		'profile.userGames': "'s games",
		'profile.userProfile': "'s profile",
		'profile.noGamesYet': 'This user has not yet created any games.',
		'profile.placeholder.name': 'Awesome gamer',

		// Games
		'games.create': 'Create Game',
		'games.openInEditor': 'Open in editor',
		'games.delete': 'Delete',
		'games.deleteConfirm': 'Are you absolutely sure?',
		'games.deleteDescription': 'This action cannot be undone. This will permanently delete your game and remove all associated data.',
		'games.cancel': 'Cancel',
		'games.continue': 'Continue',
		'games.featured': 'Featured Games',
		'games.noFeatured': 'No games are featured',
		'games.noFeaturedDescription': 'We manually feature games we consider enjoyable to play. Stay tuned for first games!',
		'games.developedBy': 'Developed by',
		'games.playNow': 'Play now',

		// UI Elements
		'ui.nothingHere': 'Nothing here yet',
		'ui.lastModified': 'Last modified',
		'ui.close': 'Close',
		'ui.submit': 'Submit',
		'ui.cancel': 'Cancel',
		'ui.save': 'Save',
		'ui.update': 'Update',
		'ui.delete': 'Delete',
		'ui.loading': 'Loading...',
		'ui.backToHomepage': 'Back to homepage',

		// Feedback
		'feedback.title': "Let's make Odyc.js better",
		'feedback.description': 'Odyc.js evolves with community. Tell us how we can make Odyc.js better for you.',
		'feedback.message': 'Tell us about your experience',
		'feedback.messagePlaceholder': 'Type your message here.',
		'feedback.messageHelp': 'Your can tell us about bug you faced, or feature you want to see.',
		'feedback.screenshotIncluded': 'Screenshot included',
		'feedback.submitSuccess': 'Feedback submitted successfully.',

		// Commands
		'commands.placeholder': 'Type a command...',
		'commands.toggleTheme': 'Toggle theme',
		'commands.openGame': 'Open game in editor ...',

		// Notifications
		'notifications.profileUpdated': 'Profile updated successfully.',
		'notifications.preferencesUpdated': 'Preferences updated successfully.',
		'notifications.signInRequired': 'You need to be signed in to access this page.',
		'notifications.error': 'An error occurred. Please try again.',

		// Time
		'time.lastModified': 'Last modified',

		// Footer
		'footer.allRightsReserved': 'All rights reserved.',
		'footer.madeWithLove': 'Made with love and'
	},
	fr: {
		// Overview
		'overview.yourGames': 'Vos Jeux',
		'overview.createFirstGame': 'Créez votre premier jeu!',
		'overview.collaborations': 'Vos Collaborations',
		'overview.noCollaboration': "Vous n'avez pas encore collaboré sur le jeu d'une autre personne.",

		// Navigation
		'nav.home': 'Accueil',
		'nav.myProfile': 'Mon Profil',
		'nav.settings': 'Réglages',
		'nav.signIn': 'Se connecter',
		'nav.logout': 'Se déconnecter',
		'nav.feedback': 'Commentaires',
		'nav.dashboard': 'Tableau de bord',
		'nav.documentation': 'Documentation',
		'nav.github': 'GitHub',
		'nav.discord': 'Discord',

		// Authentication
		'auth.welcome': 'Bienvenue sur Odyc.js Play',
		'auth.welcomeDescription': 'Créez et partagez vos jeux pixel-perfect avec la communauté',
		'auth.email': 'Email',
		'auth.signIn': 'Se connecter',
		'auth.continue': 'Continuer',
		'auth.or': 'Ou',
		'auth.signInWith': 'Se connecter avec',
		'auth.emailSent': 'Un email avec le code OTP a été envoyé dans votre boîte de réception.',
		'auth.signInSuccess': 'Connexion réussie. Bienvenue !',
		'auth.enterCode': 'Entrez le code à 6 chiffres envoyé à votre email',
		'auth.anonymousContinue': 'Continuer en tant qu\'invité',
		'auth.guestAccountWarning': 'Vous utilisez un compte invité !',
		'auth.guestAccountDescription': 'Tout ce que vous faites est sauvegardé, mais seul cet ordinateur peut y accéder.',
		'auth.connectWithGitHub': 'Se connecter avec GitHub',
		'auth.newHere': 'Vous êtes nouveau ici ?',
		'auth.firstTimeConnecting': 'Si c\'est votre première connexion avec GitHub, veuillez',
		'auth.signInToExisting': 'Se connecter au compte existant',

		// Settings & Profile
		settings: 'Réglages',
		'profile.settings': 'Paramètres du profil',
		'profile.settingsDescription': 'Configurez votre présence publique sur Odyc.js Play',
		'profile.accountPreferences': 'Préférences du compte',
		'profile.accountPreferencesDescription': 'Configurez les paramètres de votre compte Odyc Play',
		'profile.name': 'Nom',
		'profile.description': 'Description',
		'profile.picture': 'Photo de profil',
		'profile.pictureEditor': 'Éditeur de photo de profil',
		'profile.pictureEditorDescription': 'Dessinez votre propre avatar.',
		'profile.openEditor': 'Ouvrir l\'éditeur',
		'profile.closeEditor': 'Fermer l\'éditeur',
		'profile.updateProfile': 'Mettre à jour le profil',
		'profile.updatePreferences': 'Mettre à jour les préférences',
		'profile.preferredLanguage': 'Langue préférée',
		'profile.enableVim': 'Activer le mode Vim',
		'profile.enableVimDescription': 'Active le support des raccourcis clavier Vim dans l\'éditeur de code.',
		'profile.anonymous': 'Anonyme',
		'profile.gamesCreated': 'Jeux créés',
		'profile.gameCreated': 'Jeu créé',
		'profile.userGames': ' - jeux',
		'profile.userProfile': ' - profil',
		'profile.noGamesYet': 'Cet utilisateur n\'a pas encore créé de jeux.',
		'profile.placeholder.name': 'Joueur génial',

		// Games
		'games.create': 'Créer un jeu',
		'games.openInEditor': 'Ouvrir dans l\'éditeur',
		'games.delete': 'Supprimer',
		'games.deleteConfirm': 'Êtes-vous absolument sûr ?',
		'games.deleteDescription': 'Cette action ne peut pas être annulée. Cela supprimera définitivement votre jeu et toutes les données associées.',
		'games.cancel': 'Annuler',
		'games.continue': 'Continuer',
		'games.featured': 'Jeux mis en avant',
		'games.noFeatured': 'Aucun jeu n\'est mis en avant',
		'games.noFeaturedDescription': 'Nous mettons manuellement en avant les jeux que nous considérons comme agréables à jouer. Restez à l\'écoute pour les premiers jeux !',
		'games.developedBy': 'Développé par',
		'games.playNow': 'Jouer maintenant',

		// UI Elements
		'ui.nothingHere': 'Rien pour le moment',
		'ui.lastModified': 'Dernière modification',
		'ui.close': 'Fermer',
		'ui.submit': 'Soumettre',
		'ui.cancel': 'Annuler',
		'ui.save': 'Enregistrer',
		'ui.update': 'Mettre à jour',
		'ui.delete': 'Supprimer',
		'ui.loading': 'Chargement...',
		'ui.backToHomepage': 'Retour à l\'accueil',

		// Feedback
		'feedback.title': 'Améliorons Odyc.js ensemble',
		'feedback.description': 'Odyc.js évolue avec la communauté. Dites-nous comment nous pouvons améliorer Odyc.js pour vous.',
		'feedback.message': 'Parlez-nous de votre expérience',
		'feedback.messagePlaceholder': 'Tapez votre message ici.',
		'feedback.messageHelp': 'Vous pouvez nous parler d\'un bug rencontré, ou d\'une fonctionnalité que vous aimeriez voir.',
		'feedback.screenshotIncluded': 'Capture d\'écran incluse',
		'feedback.submitSuccess': 'Commentaires soumis avec succès.',

		// Commands
		'commands.placeholder': 'Tapez une commande...',
		'commands.toggleTheme': 'Basculer le thème',
		'commands.openGame': 'Ouvrir le jeu dans l\'éditeur ...',

		// Notifications
		'notifications.profileUpdated': 'Profil mis à jour avec succès.',
		'notifications.preferencesUpdated': 'Préférences mises à jour avec succès.',
		'notifications.signInRequired': 'Vous devez être connecté pour accéder à cette page.',
		'notifications.error': 'Une erreur est survenue. Veuillez réessayer.',

		// Time
		'time.lastModified': 'Dernière modification',

		// Footer
		'footer.allRightsReserved': 'Tous droits réservés.',
		'footer.madeWithLove': 'Fait avec amour et'
	}
} as const;
