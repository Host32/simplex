(function () {
    'use strict';

    angular.module('app')
        .directive('funcaoObjetivo', [function () {
            return {
                scope: {
                    objective: '=',
                    decisionVars: '='
                },
                templateUrl: 'app/directives/funcao-objetivo/funcao-objetivo.tpl.html'
            };
        }]);

}());
