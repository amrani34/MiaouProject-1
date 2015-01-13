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
        validUrl = /^(https?:\/\/)/,
        nbComplete = 0,
        strictMode = request.query.strict || false,
        toAvoid = ['<!--', '-->', 'function', ' > ', ' var ', ']]>', '»'],
        minLength = 62 - keywords.length,
        maxLentgh = 150,
        resultLimit = request.query.max_results || 2,
        html = '',
        $,
        data,
        valid,
        protocol;
    
    if (validUrl.test(url)) {
        protocol = (url.slice(0, 5) === 'https') ? https : http;        
        protocol.get(url, function (res) {
            res.setEncoding('utf8');
            
            res.on('data', function(chunk) {
                html += chunk;
            }).on('end', function() {
                $ = cheerio.load(html);
                data = $('body').text().split(/[!().:;?\r\n]/);
                
                data.forEach(function (text) {
                    // Check if string match valid condition
                    if (text.length < minLength || text.length > maxLentgh || results.p.length >= resultLimit)
                        return;
                    
                    // Check if string contain an invalid word
                    for (var i = 0, l = toAvoid.length; i < l; i++)
                        if (text.indexOf(toAvoid[i]) != -1)
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
                
                console.log('Connection to '+ url +': OK');
                results.success = true;
                results.message = 'Found ' + results.p.length + ' result(s)';
                response.json(results);
            }).on('error', function(e) {
                console.log('Connection to '+ url +': '+ e.message);
                response.json({error: true, message: e.message });
            });
        });
    } else {
        response.json({error: true, message: 'Bad url'});
    }
};