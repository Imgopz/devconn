const express = require("express");
const app = express();

app.get('/', (req, res) => console.log("Api is running...!"))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server has been started on port: ${PORT}`));