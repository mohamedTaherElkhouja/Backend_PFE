const express = require("express")
const router = express.Router()
const adminController = require('../controller/adminController')
router.post("/createAdmin",adminController.createAdmin)
router.get("/getAllUsers",adminController.getAllUsers)
router.get("/getUserById/:id",adminController.getUserById)
router.get("/getAllPvHistory",adminController.getAllPvHistory)
module.exports=router