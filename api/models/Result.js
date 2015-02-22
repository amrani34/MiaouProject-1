/**
 * Result.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        keywords: {
            type: 'array'
        },
        linkList: {
            type: 'array'
        },
        resultsIn: {
            type: 'array'
        },
        resultsOut: {
            type: 'array'
        },
        emailData: {
            type: 'json'
        },
        site: {
            model: 'site'
        }
    }
};

