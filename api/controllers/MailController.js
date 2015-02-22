/**
 * MailController
 *
 * @description :: Server-side logic for managing mails
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

module.exports = {
    /**
     * `MailController.send()`
     */

    send: function (request, response) {
        var emailjs,
            mailServer,
            requiredFields;
        
        requiredFields = {
            title: 'string',
            content : 'string',
            site: 'string'
        };
        
        for (var prop in requiredFields)
            if (!request.body.hasOwnProperty(prop) || (typeof request.body[prop] !== requiredFields[prop])) return response.badRequest('Missing parameter ' + prop);
        
        Site.findOne({id: request.body.site}).populate('mailFrom').exec(function(err, site){
            if (err) return response.serverError(err);
            sails.log.info(site);
            emailjs = require("emailjs");
            
            // If no website assoicated
            if (!site.hasOwnProperty('mailFrom')) return response.notFound(request.__('No mail associated with this website, please update configuration'));
            
            mailServer = emailjs.server.connect(site.mailFrom);

            //send Mail
            mailServer.send({
                text: request.body.content,
                from: site.mailFrom.user,
                to: site.mailTo,
                subject: request.body.title
            }, function (err, message) {
                if (err)
                    return response.serverError(err);
                response.send({send: true, message: message});
            });            
        });
    }
};