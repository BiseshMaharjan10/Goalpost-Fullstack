const router = require('express').Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const authGuard = require('../helpers/authGuard');
const isAdmin = require('../helpers/isAdmin');

router.get('/', authGuard, isAdmin, getSettings);
router.put('/', authGuard, isAdmin, updateSettings);

module.exports = router;