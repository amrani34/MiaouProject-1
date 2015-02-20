/**
 * Mail.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        user: {
            type: 'email',
            required: true,
            unique: true
        },
        password: {
            type: 'string',
            required: true
        },
        host: {
            type: 'string',
            required: true
        },
        ssl: 'boolean',
        sites: {
            collection: 'site',
            via: 'mailFrom'
        }
    }
};