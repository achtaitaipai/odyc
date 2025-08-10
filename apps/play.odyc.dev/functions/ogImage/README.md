# ogImage

Generate OG image for public game URL.

## 🧰 Usage

### GET /v1/og-images/games/:gameId

- Returns a PNG thumbnail

**Request**

URL params:

- `gameId`: The ID of the game to generate the OG image for.

**Response**

Sample `200` Response:

```text
(binary)
```

## ⚙️ Configuration

| Setting           | Value            |
| ----------------- | ---------------- |
| Runtime           | Node (22)        |
| Entrypoint        | `dist/main.js`   |
| Build Commands    | `npm run bundle` |
| Permissions       | `any`            |
| Timeout (Seconds) | 15               |

## 🔒 Environment Variables

No environment variables required.
