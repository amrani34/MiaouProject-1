var express = require('express');
var http = require('http');
var app = express();

app.use(express.static('public'))
    .get('/url', function (request, response) {
        var url = request.query.url;
        console.log(url);
    
        http.get(url, function(res) {
            res.pipe(response);
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    })
    .get('/keyword', function (request, response) {
        var options = {
            hostname: 'www.google.fr',
            port: 80,
            path: '/search?q=' + encodeURI(request.query.keyword),
            method: 'GET'
        };
    
        http.request(options, function(res) {            
            res.pipe(response);
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    });

app.listen(8080);