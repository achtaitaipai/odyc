import {
	Account,
	AppwriteException,
	Client,
	Databases,
	ID,
	OAuthProvider,
	Query,
	Storage,
	type Models
} from 'appwrite';
import randomName from '@scaleway/random-name';
import { type Games, type CommunityHighlights, type Profiles, type Feedback } from './appwrite';
import slugify from 'slugify';
import { stores } from './stores.svelte';
import { PUBLIC_ODYC_VERSION } from '$env/static/public';
import { generateAvatar } from './avatar';
import type { Locale } from './i18n';

type BackendPrefs = {
	theme?: string;
	profileId?: string;
	vimModeEnabled?: boolean;
	selectedLocale?: Locale;
};
export type BackendUser = Models.User<BackendPrefs>;

export class Backend {
	// Connection
	static #client = new Client()
		.setEndpoint('https://fra.cloud.appwrite.io/v1')
		.setProject('odyc-js');

	// Service SDKs
	static #account: Account = new Account(this.#client);
	static #databases: Databases = new Databases(this.#client);
	static #storage: Storage = new Storage(this.#client);

	static async signInAnonymous() {
		return await this.#account.createAnonymousSession();
	}

	static async createJWT() {
		return await this.#account.createJWT();
	}

	static async signInMagicURL(email: string) {
		return await this.#account.createEmailToken(ID.unique(), email, true);
	}

	static signInGitHub() {
		const path =
			window.location.origin +
			'/oauth/callback?redirect=' +
			encodeURIComponent(window.location.pathname);
		this.#account.createOAuth2Token(
			OAuthProvider.Github,
			path, // On success
			path // On failure
		);
	}

	static async signInFinish(userId: string, tokenSecret: string): Promise<Models.Session> {
		return this.#account.createSession(userId, tokenSecret);
	}

	static async getUserSafe(): Promise<BackendUser | undefined> {
		try {
			const user = await this.#account.get<BackendPrefs>();
			return user;
		} catch (error: unknown) {
			if (error instanceof AppwriteException && error.code === 401) {
				return undefined;
			}
			throw error;
		}
	}

	static async signOut() {
		return await this.#account.deleteSession('current');
	}

	static async updateThemePrefs(theme: string) {
		const prefs = await this.#account.getPrefs();
		return await this.#account.updatePrefs<BackendPrefs>({ ...prefs, theme });
	}

	static async updateProfileIdPrefs(profileId: string) {
		const prefs = await this.#account.getPrefs();
		return await this.#account.updatePrefs<BackendPrefs>({ ...prefs, profileId });
	}

	static async updateVimModePrefs(enabled: boolean) {
		const prefs = await this.#account.getPrefs();
		return await this.#account.updatePrefs<BackendPrefs>({ ...prefs, vimModeEnabled: enabled });
	}

	static async updateSelectedLocalePrefs(locale: Locale) {
		const prefs = await this.#account.getPrefs();
		return await this.#account.updatePrefs<BackendPrefs>({ ...prefs, selectedLocale: locale });
	}

	static async getProfile(profileId: string) {
		return await this.#databases.getDocument<Profiles>('main', 'profiles', profileId);
	}

	static async listProfiles(profileIds: string[]) {
		return await this.#databases.listDocuments<Profiles>('main', 'profiles', [
			Query.equal('$id', profileIds)
		]);
	}

	static async createProfile(userId: string, name?: string) {
		if (!name) {
			name = randomName(undefined, ' ');
		}

		const id = ID.unique();
		const seed = id.split('').reduce((prev, curr) => prev + curr.charCodeAt(0), 0);
		const avatarPixels = generateAvatar(8, 8, seed);

		return await this.#databases.createDocument<Profiles>('main', 'profiles', id, {
			name,
			avatarPixels,
			userId
		});
	}

	static async listGames(queries: string[]) {
		return await this.#databases.listDocuments<Games>('main', 'games', queries);
	}
	static async getGame(gameId: string) {
		return await this.#databases.getDocument<Games>('main', 'games', gameId);
	}
	static async getGameBySlug(slug: string) {
		const result = await this.#databases.listDocuments<Games>('main', 'games', [
			Query.limit(1),
			Query.equal('slug', slug)
		]);

		if (!result.documents[0]) {
			throw new Error(`Game with slug ${slug} not found`);
		}

		return result.documents[0];
	}
	static async updateGameCode(gameId: string, code: string, thumbnailFileId?: string) {
		return await this.#databases.updateDocument<Games>('main', 'games', gameId, {
			code,
			thumbnailFileId: thumbnailFileId ? thumbnailFileId : undefined
		});
	}

	static async updateGameName(gameId: string, name: string) {
		return await this.#databases.updateDocument<Games>('main', 'games', gameId, {
			name
		});
	}

	static async updateGameVersion(gameId: string, version: string) {
		return await this.#databases.updateDocument<Games>('main', 'games', gameId, {
			version
		});
	}

	static async updateGameDescription(gameId: string, description: string, howToPlay: string) {
		return await this.#databases.updateDocument<Games>('main', 'games', gameId, {
			description,
			howToPlay
		});
	}

	static async updateGameUrl(gameId: string, slug: string) {
		try {
			return await this.#databases.updateDocument<Games>('main', 'games', gameId, {
				slug
			});
		} catch (err: unknown) {
			if (err instanceof AppwriteException) {
				if (err.type === 'document_already_exists') {
					throw new Error('This URL is already taken by another game.');
				}
			}

			throw err;
		}
	}

	static getSceenshotPreview(fileId: string) {
		return this.#storage.getFileView('screenshots', fileId).toString();
	}

	static async getCommunityHighlights(): Promise<Models.DocumentList<Games>> {
		const highlights = await this.#databases.listDocuments<CommunityHighlights>(
			'main',
			'communityHighlights',
			[Query.orderDesc('$createdAt'), Query.limit(10), Query.select(['gameId'])]
		);

		const highlightIds = highlights.documents.map((highlight) => highlight.gameId);
		if (highlightIds.length <= 0) {
			return {
				total: 0,
				documents: []
			};
		}

		return await this.listGames([Query.equal('$id', highlightIds), Query.orderDesc('$createdAt')]);
	}

	static async updateProfile(profileId: string, name: string, sprite: string, description: string) {
		return await this.#databases.updateDocument<Profiles>('main', 'profiles', profileId, {
			name,
			avatarPixels: sprite,
			description
		});
	}

	static async cloneGame(game: Games) {
		const obj = JSON.parse(JSON.stringify(game));

		for (const key in obj) {
			if (key.startsWith('$')) {
				delete obj[key];
			}
		}

		obj.ownerProfileId = stores.profile?.$id;
		obj.slug = ID.unique();
		obj.name = obj.name + ' (Clone)';

		return await this.#databases.createDocument<Games>('main', 'games', obj.slug, obj);
	}

	static async createGame(name: string, code = '', thumbnailFileId = '') {
		const game = {
			name,
			slug: slugify(name).toLowerCase(),
			ownerProfileId: stores.profile?.$id,
			code,
			thumbnailFileId: thumbnailFileId ? thumbnailFileId : '/screenshot.png',
			version: PUBLIC_ODYC_VERSION ?? 'latest'
		};
		try {
			return await this.#databases.createDocument<Games>('main', 'games', ID.unique(), game);
		} catch (error: unknown) {
			if (error instanceof AppwriteException && error.code === 409) {
				const id = ID.unique();
				game.slug = id;
				return await this.#databases.createDocument<Games>('main', 'games', id, game);
			}
			throw error;
		}
	}

	static async deleteGame(gameId: string) {
		return await this.#databases.deleteDocument('main', 'games', gameId);
	}

	static async createScreenshotFile(blob: Blob) {
		return await this.#storage.createFile(
			'screenshots',
			ID.unique(),
			new File([blob], 'screenshot.png')
		);
	}

	static async createFeedbackFile(blob: Blob) {
		return await this.#storage.createFile(
			'feedbacks',
			ID.unique(),
			new File([blob], 'feedback.png')
		);
	}

	static async createFeedback(text: string, fileId: string) {
		return await this.#databases.createDocument<Feedback>('main', 'feedbacks', ID.unique(), {
			fileId,
			text
		});
	}
}
