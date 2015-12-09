window.OMDb = {};

OMDb.TemplatesRenderer = {
  renderMovies: function(movies) {
    var tableBody = document.getElementById('search-results-body');
    tableBody.innerHTML = '';

    movies.forEach(function(movie) {
      var row = '<tr>';
      row += '<td><img src="' + movie.Poster + '" alt="Poster Unavailable" /></td>';
      row += '<td>' + movie.Title + '</td>';
      row += '<td>' + movie.Year + '</td>';

      tableBody.innerHTML += row;
    });
  }
}

OMDb.HTTPClient = {
  searchForMovies: function() {
    var query = document.getElementById('query').value;

    if (query.length > 0) {
      // NOTE: XMLHttpRequest is an API that allows
      // transferring data between a client and a server
      // without disrupting what the user is doing.
      // It is used in AJAX programming.
      var queryRequest = new XMLHttpRequest();
      var url = 'http://www.omdbapi.com/?s=' + query;

      queryRequest.onreadystatechange = function() {
        if (queryRequest.readyState == 4 && queryRequest.status == 200) {
          var responseJson = JSON.parse(queryRequest.responseText);
          OMDb.TemplatesRenderer.renderMovies(responseJson.Search);
        }
      }
      queryRequest.open('GET', url, true);
      queryRequest.send();
    }
  }
}

// NOTE: this event is fired when the initial HTML document has been
// completely loaded and parsed
document.addEventListener('DOMContentLoaded', function() {

  document.getElementById('search').addEventListener('click', function(e) {
    e.preventDefault();
    OMDb.HTTPClient.searchForMovies();
  });

});
