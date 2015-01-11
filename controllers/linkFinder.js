var https = require('https');
var cheerio = require('cheerio');
module.exports = function (request, response) {
    var keywords = request.query.keywords.join(' '),
        url = 'https://www.google.fr/search?client=ubuntu&channel=fs&ie=utf-8&oe=utf-8&gfe_rd=cr&q=' + encodeURI(keywords);
    https.get(url, function (res) {
        res.setEncoding('utf8');
        var html = '';
        res.on('data', function(chunk) {
            html += chunk;
        }).on('end', function() {
            var $ = cheerio.load(html),
                $links = $('h3.r > a'),
                urlArray = [];
            $links.each(function(i, elem) {
                url = $(this).attr('href');
                urlArray.push(url.slice(7, url.indexOf('&sa')));
            });                
            console.log('Connection to Google: OK. Keyword(s) ' + keywords + ' get ' + urlArray.length + ' result(s)');
            response.status(200).json({success: true, urls: urlArray });
        }).on('error', function() {
            response.status(500).json({error: true, message: 'Unable to connect to Google' });
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        response.status(500).json({error: true, message: 'Internal Server Error' });
    });
};