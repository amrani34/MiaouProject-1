var express = require('express');
var bodyParser = require('body-parser');
var linkFinder = require('./controllers/linkFinder');
var keywordFinder = require('./controllers/keywordFinder');
var app = express();
var port = process.argv[2] || 8080;

app.use(express.static('public')).use(bodyParser.json()).post('/links/:engine', linkFinder).post('/keyword', keywordFinder).listen(port, function() {
    console.log('Listening on port: ' +port);
});