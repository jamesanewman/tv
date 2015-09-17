angular.module( 'TV.controllers', [] )

.controller( 'SettingsController' , [ '$scope','SettingsService', function($scope,SettingsService){

    var apikey = 'apikey';
    var SC = $scope;

    SC.apiKey = SettingsService.get( apikey );

    SC.keyUpdate = function(newKey){
        console.log("New Key: " , newKey );
        SettingsService.set( apikey, newKey );
    }

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

.controller( 'FavouritesController', [ '$scope','MovieDB', 'Movies', 
function( $scope,MovieDB,Movies ){
    var FC = $scope;

}])

.controller( 'ViewerController', [ '$scope','MovieDB', 'Movies', 
function( $scope,MovieDB,Movies ){
    var FC = $scope;

    //1415
    MovieDB.tv( { id: 1415 } ).then( function( data ){
        console.log("TV Data -> ", data );
        FC.summary = Movies.seriesSummary( data );
        //w154
        FC.poster = Movies.makeImagePath( R.prop('poster_path',data),'w154' );
    })



}])
;
