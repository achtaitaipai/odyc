import { ImageResponse } from '@vercel/og';

export async function getGameOgImage({ req, res, log }, { databases }) {
  const gameId = req.path.split('/')[4] ?? '';

  if (!gameId) {
    return res.send('URL param "gameId" is required.', 400);
  }

  let game;
  try {
    game = await databases.getDocument('main', 'games', gameId);
  } catch (error) {
    log(error);
    return res.send('Game not found.', 404);
  }

  const name = game.name ? game.name : 'Unnamed game';
  const description = game.description
    ? game.description
    : 'Game without description.';
  const thumbnailFileId = game.thumbnailFileId ? game.thumbnailFileId : null;
  const ownerProfileId = game.ownerProfileId ? game.ownerProfileId : '';

  const thumbnailUrl =
    thumbnailFileId === null
      ? 'https://odyc-play.appwrite.network/game-placeholder.png'
      : thumbnailFileId.startsWith('/')
        ? 'https://odyc-play.appwrite.network' + thumbnailFileId
        : `https://fra.cloud.appwrite.io/v1/storage/buckets/screenshots/files/${thumbnailFileId}/view?project=odyc-js`;

  const descriptionChunks = description.split('\n');

  let profile;
  try {
    profile = await databases.getDocument('main', 'profiles', ownerProfileId);
  } catch (error) {
    log(error);
    return res.send('Profile not found.', 404);
  }

  const { name: profileName } = profile;

  const response = new ImageResponse(
    (
      <div
        style={{
          color: '#FFFFFF',
          background: '#000000',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          gap: '0px',
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '570px',
            height: '630px',
            flexDirection: 'column',
            justifyContent: 'space-between',
            margin: 0,
            padding: '50px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
              margin: 0,
              padding: 0,
            }}
          >
            <h1
              style={{
                fontFamily: 'Inter-Semibold',
                fontWeight: '600',
                fontSize: '56px',
                margin: 0,
                padding: 0,
              }}
            >
              {name}
            </h1>

            <h3
              style={{
                fontFamily: 'Inter',
                fontWeight: '400',
                fontSize: '28px',
                opacity: '0.5',
                margin: 0,
                padding: 0,
              }}
            >
              Developed by {profileName}
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '28px',
                fontFamily: 'Inter',
                fontWeight: '400',
                gap: '0px',
                margin: 0,
                padding: 0,
                marginTop: '16px',
              }}
            >
              {descriptionChunks.map((chunk) =>
                chunk ? (
                  <p style={{ margin: 0, padding: 0 }}>{chunk}</p>
                ) : (
                  <p style={{ margin: 0, padding: 0, height: '30px' }}></p>
                )
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', margin: 0, padding: 0 }}>
            <img
              style={{
                width: '35px',
                height: '35px',
                imageRendering: 'pixelated',
              }}
              src="https://odyc-play.appwrite.network/logo-70.png"
            />
            <span
              style={{
                fontFamily: 'Pixelify-Semibold',
                fontSize: '32px',
                fontWeight: '600',
              }}
            >
              Odyc.js
            </span>
          </div>
        </div>
        <img
          style={{
            width: '630px',
            height: '630px',
          }}
          src={thumbnailUrl}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await loadGoogleFont('Inter'),
          style: 'regular',
        },
        {
          name: 'Inter-Semibold',
          data: await loadGoogleFont('Inter'),
          style: 'semibold',
        },
        {
          name: 'Pixelify-Semibold',
          data: await loadGoogleFont('Pixelify+Sans'),
          style: 'semibold',
        },
      ],
    }
  );

  return res.binary(
    Buffer.from(await response.arrayBuffer()),
    response.status,
    Object.fromEntries(response.headers)
  );
}

async function loadGoogleFont(font) {
  const url = `https://fonts.googleapis.com/css2?family=${font}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error('failed to load font data');
}
