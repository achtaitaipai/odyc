import {
	Account,
	AppwriteException,
	Client,
	Databases,
	ID,
	OAuthProvider,
	Query,
	type Models
} from 'appwrite';
import randomName from '@scaleway/random-name';
import { type Games, type CommunityHighlights, type Profiles } from './appwrite';
import slugify from 'slugify';
import { stores } from './stores.svelte';

type BackendPrefs = {
	theme?: string;
	profileId?: string;
};
export type BackendUser = Models.User<BackendPrefs>;

export class Backend {
	// Connection
	static #client = new Client()
		.setEndpoint('https://fra.cloud.appwrite.io/v1')
		.setProject('odyc-js')
		.setDevKey(
			'329615e85608308d251d2b0feccff2e14cc92e8ad976ecb998343f1ba31440c8cef7e7cae83a3eb96eb684b60dc973e7753d3545c0d5ab96b82b2b02c3f8a9904b6525a2a49b9912d78d114de5572f160b6ae0daba57bd826de0b50af2972ab82e74fdf6e8cf462d4a25e93840c969daf38929f289fa2be1c927642a7c99df4f'
		);

	// Service SDKs
	static #account: Account = new Account(this.#client);
	static #databases: Databases = new Databases(this.#client);

	static async signInAnonymous() {
		return await this.#account.createAnonymousSession();
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

	static async getProfile(profileId: string) {
		return await this.#databases.getDocument<Profiles>('main', 'profiles', profileId);
	}

	static async listProfiles(profileIds: string[]) {
		return await this.#databases.listDocuments<Profiles>('main', 'profiles', [
			Query.equal('$id', profileIds)
		]);
	}

	static async createProfile(name?: string) {
		if (!name) {
			name = randomName(undefined, ' ');
		}
		return await this.#databases.createDocument<Profiles>('main', 'profiles', ID.unique(), {
			name
		});
	}

	static async getGames(queries: string[]) {
		return await this.#databases.listDocuments<Games>('main', 'games', queries);
	}
	static async getGame(gameId: string) {
		return await this.#databases.getDocument<Games>('main', 'games', gameId);
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

		return await this.getGames([Query.equal('$id', highlightIds), Query.orderDesc('$createdAt')]);
	}

	static async updateProfile(profileId: string, name: string, sprite: string) {
		return await this.#databases.updateDocument<Profiles>('main', 'profiles', profileId, {
			name,
			avatarPixels: sprite
		});
	}

	static async createGame(name: string) {
		try {
			return await this.#databases.createDocument<Games>('main', 'games', ID.unique(), {
				name,
				slug: slugify(name),
				ownerProfileId: stores.profile?.$id
			});
		} catch (error: unknown) {
			if (error instanceof AppwriteException && error.code === 409) {
				const id = ID.unique();
				return await this.#databases.createDocument<Games>('main', 'games', id, {
					name,
					slug: id,
					ownerProfileId: stores.profile?.$id
				});
			}
			throw error;
		}
	}
}
