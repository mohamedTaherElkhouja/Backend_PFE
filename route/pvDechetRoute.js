const express = require('express');
const router = express.Router();


const pvDechetController=require("../controller/pvDechetController")

router.post('/createPvDechet',pvDechetController.createPvDechet)

module.exports=router