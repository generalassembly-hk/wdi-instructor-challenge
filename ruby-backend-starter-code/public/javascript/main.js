window.OMDb = {};

OMDb.Templates = {
  movieRow: function(movie) {
    var row = '<tr>';
    row += `<td><img src=${movie.Poster} alt="Poster Unavailable" /></td>`;
    row += `<td><a href="#movies/${movie.imdbID}">${movie.Title}</a></td>`;
    row += `<td>${movie.Year}</td>`;
    row += '</tr>';
    return row;
  }
}

OMDb.EventListeners = {
  clickSearchButton: function() {
    document.getElementById('search').addEventListener('click', function(e) {
      e.preventDefault();
      OMDb.HTTPClient.searchForMovies().then(function(movies) {
        OMDb.TemplatesRenderer.renderMovies(movies);
      });
    });
  }
}

OMDb.TemplatesRenderer = {
  renderHome: function() {
    var appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
      <h1>Find Your Movies!</h1>
      <form class="form-inline">
        <input class="form-control" id="query" type='text' placeholder='How about Rocky?'></input>
        <button class="btn btn-primary" id="search">Search</button>
      </form>
      <table class="table" id="search-results">
        <thead>
          <tr>
            <th>Poster</th>
            <th>Title</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody id="search-results-body"></tbody>
      </table>
    `;

    OMDb.EventListeners.clickSearchButton();
  },

  renderMovie: function(imdbID) {
    OMDb.HTTPClient.getMovieByIMDbId(imdbID).then(function(movie) {
      var appContainer       = document.getElementById('app-container');
      appContainer.innerHTML = '<a href="/">Back</a>';

      appContainer.innerHTML += `<h1>${movie.Title} (${movie.Year})</h1>`;
      appContainer.innerHTML += `<img src=${movie.Poster} alt="Poster Unavailable" />`;
      // TODO: refactor
      appContainer.innerHTML += `<p>Rated: ${movie.Rated}</p>`;
      appContainer.innerHTML += `<p>Released: ${movie.Released}</p>`;
      appContainer.innerHTML += `<p>Runtime: ${movie.Runtime}</p>`;
      appContainer.innerHTML += `<p>Genre: ${movie.Genre}</p>`;
      appContainer.innerHTML += `<p>Director: ${movie.Director}</p>`;
      appContainer.innerHTML += `<p>Writer: ${movie.Writer}</p>`;
      appContainer.innerHTML += `<p>Actors: ${movie.Actors}</p>`;
      appContainer.innerHTML += `<p>Plot: ${movie.Plot}</p>`;
      appContainer.innerHTML += `<p>Language: ${movie.Language}</p>`;
      appContainer.innerHTML += `<p>Country: ${movie.Country}</p>`;
      appContainer.innerHTML += `<p>Awards: ${movie.Awards}</p>`;
      appContainer.innerHTML += `<p>Metascore: ${movie.Metascore}</p>`;
      appContainer.innerHTML += `<p>imdbRating: ${movie.imdbRating}</p>`;
      appContainer.innerHTML += `<p>imdbVotes: ${movie.imdbVotes}</p>`;
    });
  },

  renderMovies: function(movies) {
    var tableBody = document.getElementById('search-results-body');
    tableBody.innerHTML = '';

    movies.forEach(function(movie) {
      tableBody.innerHTML += OMDb.Templates.movieRow(movie);
    });
  }
}

OMDb.HTTPClient = {
  getMovieByIMDbId: function(imdbID) {
    // NOTE: A Promise represents an operation that hasn't completed yet,
    // but is expected in the future.
    return new Promise(function(resolve, reject) {
      var queryRequest = new XMLHttpRequest();
      var url = `http://www.omdbapi.com/?i=${imdbID}`;

      queryRequest.onreadystatechange = function() {
        if (queryRequest.readyState == 4 && queryRequest.status == 200) {
          var movie = JSON.parse(queryRequest.responseText);
          resolve(movie);
        }
        // TODO: we need to reject this promise if it doesn't return 200
      }

      queryRequest.open('GET', url, true);
      queryRequest.send();
    });
  },

  searchForMovies: function() {
    var query = document.getElementById('query').value;
    return new Promise(function(resolve, reject) {
      if (query.length > 0) {
        // NOTE: XMLHttpRequest is an API that allows
        // transferring data between a client and a server
        // without disrupting what the user is doing.
        // It is used in AJAX programming.
        var queryRequest = new XMLHttpRequest();
        var url = `http://www.omdbapi.com/?s=${query}`;

        queryRequest.onreadystatechange = function() {
          if (queryRequest.readyState == 4 && queryRequest.status == 200) {
            var responseJson = JSON.parse(queryRequest.responseText);
            resolve(responseJson.Search);
          }
        }
        queryRequest.open('GET', url, true);
        queryRequest.send();
      } else {
        reject('Query string cannot be empty');
      }
    });
  }
}

OMDb.router = {
  route: function() {
    var hashValue = window.location.hash;
    if (hashValue == '') {
      OMDb.TemplatesRenderer.renderHome();
    } else if (hashValue.match(/movies\/tt\d+/) != null) {
      var imdbID = window.location.hash.match(/tt\d+/)[0];
      OMDb.TemplatesRenderer.renderMovie(imdbID);
    }
  }
}

// NOTE: this event is fired when the initial HTML document has been
// completely loaded and parsed
document.addEventListener('DOMContentLoaded', function() {
  OMDb.router.route();
  window.addEventListener('hashchange', OMDb.router.route, false);
});
