'use strict';


angular.module('TV', ['ui.router','ngResource'])

.service( 'Util', [ function( ){

    var Util = this;

    // DSL.search = R.reduce( addPropExtractor, search, searchProps );
    Util.addProperties = R.reduce(function(o,name){
        o[ name ] = R.prop( name );
        return o;
    });


}])

.service( 'SettingsService', [ function( ){

    var SS = this,
        root = 'tv-config';

    SS.get = function( name ){
        return R.prop( name,SS.getAll() );
    }

    SS.set = function( name,value ){
        var data = SS.getAll()
        data[name] = value;
        SS.setAll( data );
    }

    SS.getAll = function(  ){
        return JSON.parse( localStorage.getItem(root) );
    }

    SS.setAll = function( data ){
        localStorage.setItem( root , JSON.stringify(data) );
    }

    if( !localStorage.hasOwnProperty( root ) ){
        SS.setAll( {} );
    }

}])

.controller( 'SettingsController' , [ '$scope','SettingsService', function($scope,SettingsService){

    var apikey = 'apikey';
    var SC = $scope;

    SC.apiKey = SettingsService.get( apikey );

    SC.keyUpdate = function(newKey){
        console.log("New Key: " , newKey );
        SettingsService.set( apikey, newKey );
    }

}])

.service( 'MovieDB', [ '$resource', 'SettingsService', function( $resource ,SettingsService ){

    var APIKEY = SettingsService.get( 'apikey' ),
        _search = $resource( 'https://api.themoviedb.org/3/search/tv', {
            api_key: APIKEY,
            search_type: 'phrase',
            query: ''
        }),
        _config = $resource( 'https://api.themoviedb.org/3/configuration', {
            api_key : APIKEY
        }), 
        resources = this;

    var extractResults = R.prop( 'results' );

    resources.search = function( query ){
        return _search.get(query).$promise.then( extractResults );
    };
    resources.config = function(){
        return _config.get().$promise;
    };

}])

.service( 'Movies', [ 'MovieDB', function( MovieDB ){

    var DSL = this,
        config = {};

    MovieDB.config().then( function( configuration){
        console.log("Config = " , configuration );
        config = R.pick( [ 'images' ] , configuration );
    });

    var search = {},
        searchProps = [ 'id','name','overview','original_name' ];

    function addPropExtractor( o , name ){
        o[ name ] = R.prop( name );
        return o;
    }

    DSL.search = R.reduce( addPropExtractor, search, searchProps );
    DSL.searchSummary = function(data){
        var o = R.pick( [ 'id','name','overview','poster_path' ],data );
        if( o['poster_path'] !== null ) {
            o[ 'poster_path' ] = [
                config.images.base_url,
                config.images.poster_sizes[0],
                o[ 'poster_path' ]
            ].join(''); 
        }
        return o;
    }

    DSL.search.posterPath = function( data ){ 
        return MovieDBConfig.images.base_url + MovieDBConfig.images.poster_sizes[0] + '/' + R.prop('poster_path',data); 
    };

}])

.controller( 'SearchController', [ '$scope','MovieDB', 'Movies', 
function( $scope,MovieDB,Movies ){

    console.log('MovieDB -> ', MovieDB);
    var SC = $scope;

    SC.searchText = 'elementary';
    SC.search = function(){
        if( SC.searchText === '' ) return;

        MovieDB.search( { query: SC.searchText })
            .then( function(data){
                console.log('data: ',data);
                console.log('data[0]: ',data);

                SC.results = R.map( Movies.searchSummary,data );
            });

    };
}])

.config( [ '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){
    $urlRouterProvider.otherwise('/search');
    $stateProvider
        .state('search', {
            url: '/search',
            templateUrl: 'templates/search.html'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'templates/settings.html'
        });

}])

.run( [ function( ){
    console.log('TV App Running...');
}]);
 