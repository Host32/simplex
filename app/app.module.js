(function () {
    'use strict';

    var dependencies = [
        'ngMaterial',
        'templates',
        'app.home'
    ];

    angular.module('app', dependencies)
        .config(['$urlRouterProvider', '$mdThemingProvider', function ($urlRouterProvider, $mdThemingProvider) {
            $urlRouterProvider.otherwise('/');

            $mdThemingProvider.theme('default')
                .primaryPalette('teal')
                .accentPalette('green');
        }])
        .run(['$rootScope', '$state', '$stateParams', function run($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }]);

}());
