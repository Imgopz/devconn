const express = require("express");
const app = express();
const connectDB = require("./config/db")

connectDB();


// Init middleware
app.use(express.json({ extended: false })); // to get the data from the each route.

app.get('/', (req, res) => console.log("Api is running...!"));

//This will help us to follow RESTful routes
app.use('/api/user', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/post', require('./routes/api/post'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server has been started on port: ${PORT}`));