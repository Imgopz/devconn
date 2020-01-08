const express = require("express");
const app = express();
const connectDB = require("./config/db")

app.get('/', (req, res) => console.log("Api is running...!"))

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server has been started on port: ${PORT}`));