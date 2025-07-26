import { getGameOgImage } from './actions/getGameOgImage.js';
import { Client, Databases } from 'node-appwrite';

export default async (context) => {
  const client = new Client()
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(context.req.headers['x-appwrite-key']);

  const databases = new Databases(client);

  if (context.req.path.startsWith('/v1/og-images/games/')) {
    return getGameOgImage(context, { client, databases });
  }

  return context.res.send('Not Found', 404);
};
