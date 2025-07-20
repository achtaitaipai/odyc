import { ImageResponse } from '@vercel/og';

export async function getGameOgImage({ req, res }) {
  const gameId = req.path.split('/')[4] ?? '';

  if (!gameId) {
    return res.send('URL param "gameId" is required.', 400);
  }

  const response = new ImageResponse(
    (
      <div
        style={{
          fontSize: 52,
          color: '#EDEDF0',
          background: '#19191D',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          fontFamily: 'Inter',
          flexDirection: 'column',
          gap: '-70px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1 style={{ opacity: 0.6, fontSize: 40 }}>Dynamic OG images with</h1>
        <h1 style={{ fontFamily: 'Inter-Bold', fontSize: 'bold', color: '#FD366E' }}>
          Appwrite Functions
        </h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: await loadGoogleFont('Inter'),
          style: 'normal',
        },
        {
          name: 'Inter-Bold',
          data: await loadGoogleFont('Inter'),
          style: 'bold',
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
