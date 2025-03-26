const express = require("express")
const router = express.Router()
const auth =require("../controller/auth") 
router.post("/Login",auth.Login)
module.exports=router
