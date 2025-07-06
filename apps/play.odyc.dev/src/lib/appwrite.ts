import { type Models } from 'appwrite';

// Auto-generated using `appwrite types -l ts ./src/lib`

export type Feedback = Models.Document & {
	fileId: string | null;
	text: string;
};

export type Games = Models.Document & {
	name: string;
	thumbnailFileId: string | null;
	ownerProfileId: string;
	description: string | null;
	howToPlay: string | null;
	slug: string;
	collaboratorProfileIds: string[] | null;
	code: string | null;
	version: string;
};

export type CommunityHighlights = Models.Document & {
	gameId: string;
};

export type Profiles = Models.Document & {
	name: string;
	avatarPixels: string | null;
	description: string | null;
};
