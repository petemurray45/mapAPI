import express from "express";
import dotenv from "dotenv";
import mapRoute from "./routes/mapRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use("/", mapRoute);
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
