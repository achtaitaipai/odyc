import { Client, Databases, Query, Users } from 'node-appwrite';
import { Client as ClientJWT, Databases as DatabasesJWT, Permission, Role } from 'appwrite';
import { SSR_APPWRITE_API_KEY } from '$env/static/private';

export async function POST({ request }) {
	const { userDetail, jwt, gameId } = await request.json();

	const client = new Client()
		.setEndpoint('https://fra.cloud.appwrite.io/v1')
		.setProject('odyc-js')
		.setKey(SSR_APPWRITE_API_KEY);

	const databases = new Databases(client);
	const users = new Users(client);

	let userId;

	try {
		const profile = await databases.listDocuments('main', 'profiles', [
			Query.limit(1),
			Query.or([
				Query.equal('$id', userDetail),
				Query.equal('name', userDetail),
				Query.equal('userId', userDetail)
			])
		]);

		if (profile.documents[0]) {
			userId = profile.documents[0].userId;
		}
	} catch (err: any) {
		// All good, try another strategy
	}

	if (!userId) {
		try {
			const user = await users.list([Query.equal('email', userDetail), Query.limit(1)]);
			if (user.users[0]) {
				userId = user.users[0].$id;
			}
		} catch (err: any) {
			// All good, try another strategy
		}
	}

	if (!userId) {
		return new Response(JSON.stringify({ message: 'User not found.' }), {
			status: 404,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}

	const clientJwt = new ClientJWT()
		.setEndpoint('https://fra.cloud.appwrite.io/v1')
		.setProject('odyc-js')
		.setJWT(jwt);

	const databasesJwt = new DatabasesJWT(clientJwt);

	try {
		const user = await users.get(userId);
		const profileId = user.prefs.profileId ?? '';
		if (!profileId) {
			return new Response(JSON.stringify({ message: 'User has no profile.' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		const game = await databasesJwt.getDocument('main', 'games', gameId);
		const ids = game.collaboratorProfileIds;
		if (ids.includes(profileId)) {
			return new Response(JSON.stringify({ message: 'User is already a collaborator.' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}
		databases.updateDocument(
			'main',
			'games',
			game.$id,
			{
				collaboratorProfileIds: [...ids, profileId]
			},
			[Permission.update(Role.user(userId))]
		);
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (err: any) {
		console.log(err);
		return new Response(JSON.stringify({ message: err.message }), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}
