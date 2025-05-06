const express = require("express");
const cors = require("cors");
const fitbitRoutes = require("./fitbit");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/fitbit", fitbitRoutes);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
