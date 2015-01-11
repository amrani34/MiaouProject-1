var http = require('http');
var https = require('https');
var cheerio = require('cheerio');
module.exports = function (request, response) {
    var keywords = request.query.keywords.join(' '),
        engine = request.params.engine.toLowerCase(),
        selector,
        protocol,
        url;
    
    switch (engine) {
        case 'google':
            protocol = https;
            url = 'https://www.google.fr/search?client=ubuntu&channel=fs&ie=utf-8&oe=utf-8&gfe_rd=cr&q=' + encodeURI(keywords);
            selector = 'h3.r > a';
            break;
        
        case 'bing':
            protocol = http;
            url = 'http://www.bing.com/search?q=' + encodeURI(keywords);
            selector = 'li.b_algo > h2 > a';
            break;
            
        default:
            url = false;
            break;
    }
    
    if (!url)
        response.status(500).json({error: true, message: 'Invalid Search Engine' });
        
    protocol.get(url, function (res) {
        res.setEncoding('utf8');
        var html = '';
        res.on('data', function(chunk) {
            html += chunk;
        }).on('end', function() {
            var $ = cheerio.load(html),
                $links = $(selector),
                urlArray = [];
            $links.each(function(i, elem) {
                url = $(this).attr('href');
                
                if (engine === 'google') // Google met de la merde dans ses urls
                    url = url.slice(7, url.indexOf('&sa'));
                
                urlArray.push(url);
            });
            
            console.log('Connection to '+ engine +': OK. Keyword(s) ' + keywords + ' get ' + urlArray.length + ' result(s)');
            response.status(200).json({success: true, urls: urlArray });
        }).on('error', function() {
            response.status(500).json({error: true, message: 'Unable to connect to Google' });
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        response.status(500).json({error: true, message: 'Internal Server Error' });
    });
};