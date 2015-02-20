(function () {
    'use strict';
    var app = angular.module('miaouServices', ['ngResource']),
        models = ['Site', 'Mail'];
        
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
})();