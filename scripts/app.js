'use strict';


angular.module('TV', [
    'ui.router','ngResource','TV.controllers','TV.services'
])

.config( [ '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/search');
    $stateProvider
        .state('search', {
            url: '/search',
            templateUrl: 'templates/search.html'
        })
        .state('favourites', {
            url: '/favourites',
            templateUrl: 'templates/favourites.html'
        })
        .state('viewer', {
            url: '/viewer',
            templateUrl: 'templates/viewer.html'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'templates/settings.html'
        });

}])

.run( [ function( ){
    console.log('TV App Running...');
}]);
 