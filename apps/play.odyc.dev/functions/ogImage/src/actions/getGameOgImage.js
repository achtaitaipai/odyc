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
          fontSize: 40,
          color: 'white',
          background: 'black',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <h1>Hello There 👋</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  return res.binary(
    Buffer.from(await response.arrayBuffer()),
    response.status,
    Object.fromEntries(response.headers)
  );
}
