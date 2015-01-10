var express = require('express');
var linkFinder = require('./controllers/linkFinder');
var keywordFinder = require('./controllers/keywordFinder');
var app = express();
app.use(express.static('public')).get('/keyword', linkFinder, keywordFinder).listen(8080);