import express from "express";
import { config } from "dotenv";
config();

const app = express();

// Parse JSON bodies
app.use(express.json({
  // store the raw request body to use it for signature verification
  verify: (req, res, buf, encoding) => {
    req.rawBody = buf?.toString(encoding || "utf8");
  },
}));

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

// Routes
import webhookRoute from "./routes/webhookRoute.js";
app.use("/api", webhookRoute);

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(process.env.PORT, () => {
  console.log("Server is running on port "+process.env.PORT);
});
