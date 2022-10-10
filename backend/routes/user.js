const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');
const loginValidator = require('../midleware/login-validator')
const max = require('../midleware/limiter')
const auth = require('../midleware/auth')

router.post('/signup', loginValidator.email, loginValidator.password, userCtrl.signup);
router.post('/login', max.limiter, loginValidator.email, userCtrl.login);


router.get('/users/:id', auth, userCtrl.getOneUser);
router.delete('/users/:id', auth, userCtrl.deleteUser);


module.exports = router;