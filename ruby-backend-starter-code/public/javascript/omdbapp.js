angular.module('omdbApp', [])
  .controller('OmdbController', ['$scope','$http', function($scope, $http) {
    var omdb          = this;
    omdb.searchResult = [];
    omdb.selectedRes  = {};
    omdb.searchQuery  = '';
    omdb.favorites    = [];

    /*
     * API Request to OMDBAPI, with the value provided into the search box
     * When successful, load searchResult, otherwise put an empty list
     */
    omdb.search = function() {
      $http({
        method: 'GET',
        url:    encodeURI('http://www.omdbapi.com/?S=' + omdb.searchQuery + '&y=&plot=short&r=json')
      }).then(function successCallback(response) {
          if (response.data.Search === undefined) {
            omdb.searchResult = []
          } else {
            omdb.searchResult = response.data.Search
          }
        }, function errorCallback(response) {
          omdb.searchResult = []
        });
    };

    /*
     * Action called to display the detail of a movie.
     * It can be called from the search and the favorite
     */
    omdb.detail = function(id) {
      $http({
        method: 'GET',
        url:    encodeURI('http://www.omdbapi.com/?i=' + id + '&y=&plot=long&r=json')
      }).then(function successCallback(response) {
          if (response.data === undefined) {
            omdb.selectedRes = {}
          } else {
            omdb.selectedRes = response.data
          }
        }, function errorCallback(response) {
          omdb.selectedRes = {}
        });
    };

    /*
     * add a movie to the favorite
     */
    omdb.addToFavorite = function(movie) {
      $http({
        method: 'POST',
        data:   { oid: movie.imdbID, name: movie.Title },
        url:    encodeURI('/favorites')
      }).then(function successCallback(response) {
          if (response.data === undefined) {
            omdb.favorites = []
          } else {
            omdb.favorites = response.data
          }
        }, function errorCallback(response) {
          omdb.favorites = []
        });
    };

    /*
     * Refresh the favorites list and display it.
     */
    omdb.displayFavorites = function() {
      document.getElementById('favorites').className = "table-responsive show"

      $http({
        method: 'GET',
        url:    encodeURI('/favorites')
      }).then(function successCallback(response) {
          if (response.data === undefined) {
            omdb.favorites = []
          } else {
            omdb.favorites = response.data
          }
        }, function errorCallback(response) {
          omdb.favorites = []
        });
    }
  }]);