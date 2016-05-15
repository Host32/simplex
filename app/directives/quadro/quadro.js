(function () {
    'use strict';

    angular.module('app')
        .directive('quadro', [function () {
            return {
                scope: {
                    table: '=',
                    base: '='
                },
                templateUrl: 'app/directives/quadro/quadro.tpl.html'
            };
        }]);

}());
