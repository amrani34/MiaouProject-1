var http = require('http');
var https = require('https');
var cheerio = require('cheerio');
module.exports = function (request, response) {
    
    /***********************
    * Variables definition *
    ***********************/
    var results = {
        success: false,
        message: 'No urls found',
        p: []
    },
        url = request.query.url.trim(),
        keywords = request.query.keyword.split(',').map(function (keyword) {
            return new RegExp(keyword, 'i');
        }),
        nbComplete = 0,
        strictMode = request.query.strict || false,
        filters = ['p','h1', 'h2', 'h3'],
        minLength = 40,
        maxLentgh = 800,
        resultLimit = request.query.max_results || 2,
        html = '',
        $,
        protocol;
    
    if (url) {
        console.log('Mode strict: ' + strictMode);
        protocol = (url.slice(0, 5) === 'https') ? https : http;        
        protocol.get(url, function (res) {
            res.setEncoding('utf8');
            
            res.on('data', function(chunk) {
                html += chunk;
            }).on('end', function() {                    
                $ = cheerio.load(html),
                    
                filters.forEach(function (selector) {
                    $(selector).each(function () {
                        var text = $(this).text(),
                            valid;
                        
                        if (text.length < minLength || text.length > maxLentgh || results.p.length >= resultLimit)
                            return;
                        
                        if (strictMode) {  
                            valid = true;
                            keywords.forEach(function(keyword) {
                                if (!keyword.test(text))
                                    valid = false;                                    
                            });                           
                        } else {
                            valid = false;
                            keywords.forEach(function(keyword) {
                                if (keyword.test(text))
                                    valid = true;
                            });
                        }
                        
                        if (valid)
                            results.p.push(text);
                    });
                });

                console.log('Connection to '+ url +': OK');               
                results.success = true;
                results.message = 'Found ' + results.p.length + ' result(s)';
                response.status(200).json(results);                        
            }).on('error', function(e) {
                console.log('Connection to '+ url +': '+ e.message);
                response.status(500).json({error: true, message: e.message });
            });
        });       
    }
};