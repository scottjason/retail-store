var express = require('express');
var router = express.Router();
var indexCtrl = require('../controllers/index');

router.get('/hello', function(req, res, next){
	console.log('ht');
})

router.get('/', indexCtrl.render);

module.exports = router;
