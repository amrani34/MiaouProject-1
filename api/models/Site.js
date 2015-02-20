/**
 * Site.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        name: 'string',
        url: {
            type: 'string',
            unique: true
        },
        mailFrom: {
            model: 'mail'
        },
        mailTo: {
            type: 'email',
            required: true
        }
    }
};

