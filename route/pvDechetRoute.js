const express = require('express');
const router = express.Router();



const pvDechetController=require("../controller/pvDechetController")

router.post('/createPvDechet',pvDechetController.createPvDechet)
router.get('/getAllPvDechetsByUser/:userId',pvDechetController.getAllPvDechetsByUser)
router.post("/SavePvDechet",pvDechetController.SavePvDechet)
router.post("/fromSavedtoValidated/:pvDechetId",pvDechetController.fromSavedtoValidated)
router.post("/UpdatePvDechet/:dechetId",pvDechetController.UpdatePvDechet)

module.exports=router