(function () {
    'use strict';

    angular.module('app.home', ['ui.router', 'app.services'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('home', {
                url: '/',
                views: {
                    'main': {
                        controller: 'HomeCtrl',
                        controllerAs: 'homeCtrl',
                        templateUrl: 'app/home/home.tpl.html'
                    }
                },
                data: {
                    pageTitle: 'Home',
                    viewClass: 'home'
                }
            });
        }]);

}());
