// src/middlewares/corsConfig.ts
import cors, { CorsOptions } from "cors";

const whitelist: string[] = [
  "http://localhost:5173", // frontend dev
  "https://monfrontendprod.com" // frontend prod
];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: Postman)
    if (!origin) return callback(null, true);

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // permet l'envoi de cookies / JWT
};

export default cors(corsOptions);
