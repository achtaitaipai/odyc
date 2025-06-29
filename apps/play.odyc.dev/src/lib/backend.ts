import { Account, AppwriteException, Client, ID, OAuthProvider, type Models } from 'appwrite';

type BackendPrefs = {
	theme: string;
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

	static async signInAnonymous() {
		return await this.#account.createAnonymousSession();
	}

	static async signInMagicURL(email: string) {
		return await this.#account.createEmailToken(ID.unique(), email, true);
	}

	static signInGitHub() {
		let path =
			window.location.origin +
			'/oauth/callback?redirect=' +
			encodeURIComponent(window.location.pathname);
		// TODO: Ensure to keep lang in path if present
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

	static async updateThemePrefferences(theme: string) {
		const prefs = await this.#account.getPrefs();
		return await this.#account.updatePrefs({ ...prefs, theme });
	}
}
