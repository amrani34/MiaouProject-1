var express = require('express');
var linkFinder = require('./controllers/linkFinder');
var keywordFinder = require('./controllers/keywordFinder');
var app = express();
app.use(express.static('public')).get('/links', linkFinder).get('/keyword', keywordFinder).listen(80);