# HunarHub

HunarHub is a digital marketplace connecting customers with local micro-entrepreneurs, traditional skills, and handmade products.

## Run locally

```bash
cd client
npm install
npm run dev
```

Create `client/.env` from `.env.example` and set:

```text
VITE_API_URL=http://localhost:5000/api
```

## Backend

The Express and MongoDB backend lives in `server/`.

```bash
cd server
npm install
npm run dev
```

Create `server/.env` from `.env.example` and set:

```text
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

## Deployment

Deploy the `client/` directory to Vercel with build command `npm run build` and output directory `dist`. Set `VITE_API_URL` to the deployed Render API URL ending in `/api`.

Deploy the `server/` directory to Render with build command `npm install` and start command `npm start`. Set `MONGODB_URI` to a MongoDB Atlas connection string, `JWT_SECRET` to a long random secret, and `CLIENT_URL` to the Vercel origin. Multiple comma-separated frontend origins are supported for previews.

Available API endpoints:

- `GET /api/health`
- `GET /api/categories`
- `GET /api/categories/:id`
- `GET /api/entrepreneurs`
- `GET /api/entrepreneurs/:id`
- `GET /api/products`
- `GET /api/products/:id`
