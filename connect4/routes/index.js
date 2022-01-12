const { request } = require('express');
var express = require('express');
const gameStats = require('../gamestats');
var router = express.Router();

/* GET for any page in the game */
// router.get('*', (req, res,next) => {
//     if(req.get("Accept").includes('html')){ // if the request is for an html page not js css or images
//         console.log(req.url);
//         gameStats.onlinePlayers++; // we increase the online players
//         // and we decrease the online players when they leave from the web socket in the server
//     }
//     next();
// });

router.get('/', function(req, res, next) {
    console.log(gameStats);
    res.render('splash.ejs', gameStats);
});
router.get('/game', function(req, res, next) {
    res.sendFile('game.html', { root: "./public" });
});
router.get('/tutorial', function(req, res, next) {
    res.sendFile('tutorial.html', { root: "./public" });
});

module.exports = router;