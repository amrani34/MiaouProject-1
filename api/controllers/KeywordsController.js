/**
 * KeywordsController
 *
 * @description :: Server-side logic for managing keywords
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

var http = require('http');
var https = require('https');
var cheerio = require('cheerio');

module.exports = {
    
    /**
    * `LinkController.find()`
    */
    
    find: function (request, response) {
        if (typeof request.body.keywords !== 'object' || isNaN(request.body.maxResults))
            return response.badRequest({error: true, message: 'Invalid params'});
        
        /***********************
        * Variables definition *
        ***********************/
        var results = {
            success: false,
            message: 'No urls found',
            in: [],
            out: []
        },
            url = request.body.url.trim(),
            keywords = request.body.keywords.map(function (keyword) {
                return new RegExp(keyword, 'i');
            }),
            validUrl = /^(https?:\/\/)/,
            nbComplete = 0,
            strictMode = request.body.strict || false,
            toAvoid = ['<!--', '-->', 'function', '>', '<', '_', ' var ', ']]>', '»', '|'],
            minLength = 62 - keywords.length,
            maxLentgh = 150,
            resultLimit = request.body.maxResults || 2,
            html = '',
            $,
            data,
            valid,
            protocol;
        
        if (validUrl.test(url)) {
            protocol = (url.slice(0, 5) === 'https') ? https : http;
            protocol.request(url, function (res) {
                if (res.statusCode !== 200)
                {
                    sails.log.warn('Url ' + url + ' return code ' + res.statusCode);
                    return response.serverError({error: true, message: 'Code != 200'});
                }
                    
                res.setEncoding('utf8');
                
                res.on('data', function(chunk) {
                    html += chunk;
                }).on('error', function(errors) {
                    return response.serverError(errors);
                }).on('end', function() {
                    $ = cheerio.load(html, {normalizeWhitespace: true});
                    data = $('body').text().split(/[!().;?\r\n]/);
                    
                    data.forEach(function (text) {
                        // Check if string match valid condition
                        if (text.length < minLength || text.length > maxLentgh || results.in.length >= resultLimit)
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
                            results.in.push(text);
                        else
                            results.out.push(text);
                    });
                    
                    sails.log.info('Connection to '+ url +': OK');
                    results.success = true;
                    results.message = 'Found ' + results.in.length + ' result(s)';
                    response.json(results);
                });
            }).on('error', function(errors) {
                
                // Error while connecting
                sails.log.warn('Unable to connect to ' + url);
                return response.serverError(errors);
            }).end();
        } else {
            return response.badRequest({error: true, message: 'Bad url'});
        }
    }
};