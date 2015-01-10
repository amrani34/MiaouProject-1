var http = require('http');
var https = require('https');
var cheerio = require('cheerio');
module.exports = function (request, response) {
    var results = {
        success: false,
        message: 'No urls found',
        p: []
    },
        nbUrl = request.urls.length,
        nbComplete = 0,
        protocol;
    
    if (nbUrl) {        
        request.urls.forEach(function(url) {
            protocol = (url.slice(0, 5) === 'https') ? https : http;
            protocol.get(url, function (res) {
                res.setEncoding('utf8');
                var html = '';
                res.on('data', function(chunk) {
                    html += chunk;
                }).on('end', function() {                    
                    var $ = cheerio.load(html),
                        strictMode = request.query.strict || false,
                        keywords = request.query.keyword.split(',').map(function (keyword) {
                            return new RegExp(keyword, 'i');
                        }),
                        filters = ['p','h1', 'h2', 'h3'],
                        minLength = 40,
                        maxLentgh = 800,
                        resultLimit = 5;
                    
                    filters.forEach(function (selector) {
                        $(selector).each(function () {
                            var text = $(this).text();
                            if (text.length < minLength || text.length > maxLentgh)
                                return;
                            if (strictMode) {
                                var valid = true;
                                
                                keywords.forEach(function(keyword) {
                                    if (!keyword.test(text))
                                        valid = false;                                    
                                });
                                
                                if (valid)
                                    results.p.push(text);
                            } else {
                                keywords.forEach(function(keyword) {                                    
                                    if (!keyword.test(text))
                                        return;
                                    results.p.push(text);
                                });
                            }
                        });
                    });
                    
                    nbComplete++
                    console.log('Connection to '+ url +': OK');
                    
                    if (nbComplete != nbUrl)
                        return;
                    
                    results.success = true;
                    results.message = 'Found ' + results.p.length + 'result(s)';
                    response.status(200).json(results);                        
                }).on('error', function(e) {
                    console.log('Connection to '+ url +': '+ e.message);
                    nbComplete++
                    if (nbComplete == nbUrl)
                        response.status(500).json({error: true, message: 'Internal Server Error' });
                });
            });
        });
    }
};