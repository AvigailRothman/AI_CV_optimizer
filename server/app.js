import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRoute from "./routes/uploadRoute.js";

// console.log("ENV KEY: ", process.env.GEMINI_API_KEY);


dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

// Path to root directory of project
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // go 1 directory up → ../.env
// dotenv.config({ path: path.join(__dirname, "../.env") });

const app = express();

app.use(cors());
app.use(express.json());

// static folder for downloaded PDFs
app.use("/output", express.static("output"));

app.use("/upload", uploadRoute);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
