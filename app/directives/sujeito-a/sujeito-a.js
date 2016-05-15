(function () {
    'use strict';

    angular.module('app')
        .directive('sujeitoA', [function () {
            return {
                scope: {
                    restrictions: '='
                },
                templateUrl: 'app/directives/sujeito-a/sujeito-a.tpl.html'
            };
        }]);

}());
