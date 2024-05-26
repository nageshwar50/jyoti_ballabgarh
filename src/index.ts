import express from "express";

const app = express();
const PORT = process.env.PORT ?? 8000;

// Define Routes
app.get("/", (req, res) =>
  res.json([
    "Hanji (: Good Morning, Good ETM!",
    "My name is Nageshwar, and I specialize in DevOps.",
    "I have achieved Level 1 status with a total of 1.5 years of experience."
  ])
);


app.get("/health", (req, res) =>
  res.json({ message: "System is operating normally 😊" })
);

app.get("/api", (req, res) =>
  res.json({ message: "Level Sab Nikalenge  👀" })
);

// Start the Express Server
app.listen(PORT, () =>
  console.log(`Express application started on PORT ${PORT}`)
);
