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
        var mailTitle,
            mailContent,
            emailjs,
            mailServer,
            emailAddress,
            emailPasswd;
        
        emailAddress = 'La bonne adresse';
        emailPasswd = 'La bonne adresse';

        mailTitle = request.body.title;
        mailContent = request.body.content;
        if (!mailTitle || !mailContent)
            return response.badRequest({error: true, message: 'Missing parameters'});
        emailjs = require("emailjs");
        mailServer = emailjs.server.connect({
            user: emailAddress,
            password: emailPasswd,
            host: "host",
            ssl: true
        });

        //send Mail
        mailServer.send({
            text: mailContent,
            from: emailAddress,
            to: "bonne adresse",
            subject: mailTitle
        }, function (err, message) {
            if (err)
                return response.serverError(err);
            response.send({send: true, message: message});
        });
    }
};