import { type Models } from 'appwrite';

// Auto-generated using `appwrite types -l ts ./src/lib`

export type Games = Models.Document & {
	name: string;
	thumbnailFileId: string | null;
	ownerProfileId: string;
	description: string | null;
	howToPlay: string | null;
	tags: string[] | null;
	slug: string | null;
	private: boolean;
	collaboratorProfileIds: string[] | null;
};

export type CommunityHighlights = Models.Document & {
	gameId: string;
};

export type Profiles = Models.Document & {
	name: string;
	avatarPixels: string | null;
};
