/**
 * LinkController
 *
 * @description :: Server-side logic for managing links
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
        /** Check if request id valid **/
        var requiredFields = {
            keywords: 'object',
            searchType: 'string',
            engine: 'string'
        };
        
        for (var param in requiredFields)
            if (typeof request.body[param] !== requiredFields[param])
                return response.badRequest({error: true, message: 'Invalid param ' + param });
        
        var keywords = request.body.keywords.join(' '),
            search = request.body.searchType === 'large' ? encodeURI(keywords) : encodeURI('"' + keywords + '"'),
            engine = request.body.engine.toLowerCase() || 'google',
            selector,
            protocol,
            hostname,
            path;
        
        switch (engine) {
            case 'google':
                protocol = https;
                hostname = 'www.google.fr';
                path = '/search?client=ubuntu&num=40&channel=fs&ie=utf-8&oe=utf-8&gfe_rd=cr&q=' + search;
                selector = 'h3.r > a';
                break;
                
            case 'bing':
                protocol = http;
                hostname = 'www.bing.com';
                path = '/search?q=' + search;
                selector = 'li.b_algo > h2 > a';
                break;
                
            default:
                hostname = false;
                break;
        }
        
        if (!hostname)
            return response.badRequest({error: true, message: 'Invalid Search Engine' });
        
        var req = protocol.request({hostname: hostname, path: path}, function(res) {
            var html;
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                html += chunk;
            }).on('end', function () {
                var $ = cheerio.load(html),
                    $links = $(selector),
                    urlArray = [],
                    url;
                $links.each(function(i, elem) {
                    url = $(this).attr('href');
                    
                    if (engine === 'google') // Google met de la merde dans ses urls
                        url = url.slice(7, url.indexOf('&sa'));
                    
                    urlArray.push(url);
                });
                
                sails.log.info('Connection to '+ engine +': OK, found ' + urlArray.length + ' result(s)');
                response.json({success: true, urls: urlArray });
            });
        });        
        req.on('error', function(errors) {
            return response.serverError(errors);
        });
        req.end();
    }
};