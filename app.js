var express = require('express');
var linkFinder = require('./controllers/linkFinder');
var keywordFinder = require('./controllers/keywordFinder');
var app = express();
var port = process.argv[2] || 8080;

app.use(express.static('public')).get('/links/:engine', linkFinder).get('/keyword', keywordFinder).listen(port, function() {
    console.log('Listening on port: ' +port);
});