(function () {
    'use strict';
    var app = angular.module('miaouServices', ['ngResource']),
        models = ['Site', 'Mail', 'Result'];
        
    // Models
    models.forEach(function (model) {
        app.factory(model, ['$resource', function ($resource) {
                return $resource('/' + model.toLowerCase() + '/:id');
            }]);
    });

    // Alerts service
    app.factory('BootStrapAlert', ['$rootScope', function ($rootScope) {
            $rootScope.alerts = [];
            return {
                add: function(type, msg) {
                    var alert = {
                        type: type,
                        message: msg
                    }
                    $rootScope.alerts.push(alert);
                    return alert;
                },
                close: function (index) {
                    $rootScope.alerts.splice(index, 1);
                }
            };
        }]);
    
    // Mails
    app.factory('MailService',['$http', function ($http) {
        var requiredFields = ['title', 'content', 'site'],
        promise;
        
        return {
            send: function (data, successCallback, errorCallback) {
                for (var i = 0, l = requiredFields.length; i < l; i++)
                    if (!data.hasOwnProperty(requiredFields[i]))
                        return false;
                promise = $http.post('/mail/send', data);
                
                // Callbacks
                if (typeof successCallback === "function")
                    promise.success(successCallback);
                if (typeof errorCallback === "function")
                    promise.error(errorCallback);
            }
        }
    }]);
})();