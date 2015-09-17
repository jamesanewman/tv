angular.module( 'TV.services', [] )

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
        _tv = $resource( 'https://api.themoviedb.org/3/tv/:id', {
            api_key : APIKEY
        }),
        _seasons = $resource( 'https://api.themoviedb.org/3/tv/:id/season/:season', {
            api_key : APIKEY
        }),
        resources = this;

    var extractResults = R.prop( 'results' );

    resources.search = function( query ){
        return _search.get(query).$promise.then( extractResults );
    };

    resources.tv = function( query ){
        return _tv.get(query).$promise;
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

    DSL.seriesSummary = R.pick( [ 
    	'name','number_of_seasons','overview','first_air_date','last_air_date','id'
    ])

    DSL.makeImagePath = function( uri , size ){
    	var base = config.images.base_url,
    		imgsize = config.images.poster_sizes[0];
    
    	if( size !== undefined ){
    		imgsize = size;
    	}

    	return [ base,imgsize,uri ].join('');
    }

    DSL.search.posterPath = function( data ){ 
        return config.images.base_url + config.images.poster_sizes[0] + '/' + R.prop('poster_path',data); 
    };

}]);

