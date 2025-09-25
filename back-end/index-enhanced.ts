import express from "express";
import path from "path";
import dotenv from "dotenv";
import taskRoutes from "./src/routes/TaskRouteEnhanced.js";
import authRoutes from "./src/routes/AuthRoute.js";
import actionLogRoutes from "./src/routes/ActionLogRoute.js";
import corsMiddleware from "./src/middlewares/corsConfig.js";
// import cors from "cors";



dotenv.config();

const app = express();

app.use(express.json());
app.set("json spaces", 2);


// app.use(cors({
//   origin: "http://localhost:5173", // frontend
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));

// ⚡ CORS global
app.use(corsMiddleware);

// ✅ Monter les routes auth avec /todo comme préfixe
app.use("/todo/auth", authRoutes);

// ✅ Monter les routes tâches avec /todo comme préfixe
app.use("/todo/tasks", taskRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/todo/tasks", actionLogRoutes);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
