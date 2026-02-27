const router = require('express').Router();
const multer = require("multer");
const upload = multer();
const uploadProductImages = require("../helpers/multer");

const {registerUser, loginUser, getallUser,getMe, updateImage} = require('../controllers/userController');
const verifyEmail = require('../helpers/verifyEmail');
const authGuard = require("../helpers/authGuard");
const isAdmin = require('../helpers/isAdmin');

router.post('/registerUser',upload.none(),registerUser);
router.get("/verify-email",verifyEmail);
router.get("/getAllUser",authGuard,isAdmin,getallUser);
router.post("/loginUser",loginUser);
router.put("/updateImage",authGuard,uploadProductImages,updateImage);
router.get("/getme",authGuard,getMe);

module.exports = router;