import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import recipesRoutes from './routes/recipesRoutes.js';
import categoriesRoutes from './routes/categoriesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';
import ingredientsRouter from './routes/ingredientsRoute.js';

const PORT = process.env.PORT ?? 3000;
const app = express();

// Load API docs defensively: an empty or malformed swagger.json must not crash boot.
let swaggerDocument = null;
try {
  swaggerDocument = JSON.parse(
    readFileSync(new URL('../swagger.json', import.meta.url), 'utf-8'),
  );
} catch {
  console.warn('⚠️  swagger.json is missing or invalid — run "npm run swagger".');
}

const allowedOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow non-browser clients (no Origin header) and whitelisted frontends.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

app.use(logger);
app.use(express.json());
app.use(cookieParser());

app.use(authRoutes);
app.use(recipesRoutes);
app.use(ingredientsRouter);
app.use(categoriesRoutes);
if (swaggerDocument) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
app.use(userRoutes);

app.use(notFoundHandler);

app.use(errors());

app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Docs available at /api-docs`);
});
