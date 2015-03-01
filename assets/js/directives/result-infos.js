angular.module('miaou').directive('resultInfos', function() {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: 'templates/directives/result-infos.html',
        link: function(scope, element) {
            $('[data-toggle="tab"]').click(function(e) {
                e.preventDefault();
                $(this).tab('show');
            });
        }
    };
});