import { getGameOgImage } from './actions/getGameOgImage.js';

export default async (context) => {
  if (context.req.path.startsWith('/v1/og-images/games/')) {
    return getGameOgImage(context);
  }

  return context.res.send('Not Found', 404);
};
