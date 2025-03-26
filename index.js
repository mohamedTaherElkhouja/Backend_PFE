const cors = require('cors');


const express = require('express');
const app = express();
var bodyParser = require("body-parser")
app.use(cors());
require('./dbConfig/dbConfig');
require('dotenv').config({path:"./config/.env"})
app.use(bodyParser.json())
app.use(express.json())
var routerUser=require("./route/userRoute")
var routerAuth=require("./route/authRoute")
var routerRole=require("./route/roleRoute")
var routerCatergorie=require("./route/categorieRoute")
var routerDechet=require("./route/dechetRoute")
var routerPvDechet=require("./route/pvDechetRoute")
app.use("/categorie",routerCatergorie)
app.use("/user",routerUser)
app.use("/auth",routerAuth)
app.use("/role",routerRole)
app.use("/dechet",routerDechet)
app.use("/pvDechet",routerPvDechet)

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello, Node.js!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});