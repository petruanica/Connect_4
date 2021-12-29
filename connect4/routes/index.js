var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.sendFile('splash.html', { root: "./public" });
});
router.get('/home', function(req, res, next) {
    res.sendFile('splash.html', { root: "./public" });
});
router.get('/game', function(req, res, next) {
    res.sendFile('game.html', { root: "./public" });
});
router.get('/tutorial', function(req, res, next) {
    res.sendFile('tutorial.html', { root: "./public" });
});

module.exports = router;