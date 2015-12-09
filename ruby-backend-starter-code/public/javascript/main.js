window.OMDb = {};

OMDb.Templates = {
  moviePoster: function(movie) {
    return `<img src=${movie.Poster} alt="Poster Unavailable" />`;
  },

  movieDetails: function(movie) {
    return `
      <p>Rated: ${movie.Rated}</p>
      <p>Released: ${movie.Released}</p>
      <p>Runtime: ${movie.Runtime}</p>
      <p>Genre: ${movie.Genre}</p>
      <p>Director: ${movie.Director}</p>
      <p>Writer: ${movie.Writer}</p>
      <p>Actors: ${movie.Actors}</p>
      <p>Plot: ${movie.Plot}</p>
      <p>Language: ${movie.Language}</p>
      <p>Country: ${movie.Country}</p>
      <p>Awards: ${movie.Awards}</p>
      <p>Metascore: ${movie.Metascore}</p>
      <p>imdbRating: ${movie.imdbRating}</p>
      <p>imdbVotes: ${movie.imdbVotes}</p>
    `;
  },

  movieRow: function(movie) {
    return `
      <tr>
        <td>${OMDb.Templates.moviePoster(movie)}</td>
        <td><a href="#movies/${movie.imdbID}">${movie.Title}</a></td>
        <td>${movie.Year}</td>
      </tr>
    `
  },

  moviesTable: function() {
    return `
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
  },

  searchForm: function() {
    return `
      ${OMDb.Templates.myFavorites()}
      <h1>Find Your Movies!</h1>
      <form class="form-inline">
        <input class="form-control" id="query" type='text' placeholder='How about Rocky?'></input>
        <button class="btn btn-primary" id="search">Search</button>
      </form>
      ${OMDb.Templates.moviesTable()}
    `;
  },

  myFavorites: function() {
    return '<a class="pull-right" href="#my-favorites">My Favorites</a>';
  },

  back: function() {
    return '<a href="/#home">Back</a>';
  },

  favoriteButton: function() {
    return `
      <button type="button" id="favorite" class="btn btn-primary btn-lg">
        <span class="glyphicon glyphicon-star" aria-hidden="true"></span> Favorite
      </button>
    `;
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
  },

  clickFavoriteButton: function(name, oid) {
    var favoriteButton = document.getElementById('favorite');
    favoriteButton.addEventListener('click', function() {
      OMDb.HTTPClient.likeMovie(name, oid).then(function() {
        favoriteButton.parentNode.removeChild(favoriteButton);
      });
    });
  }
}

OMDb.TemplatesRenderer = {
  _appContainer: function() {
    return document.getElementById('app-container');
  },

  renderMyFavorites: function() {
    var appContainer       = OMDb.TemplatesRenderer._appContainer();
    appContainer.innerHTML = `
      ${OMDb.Templates.back()}
      ${OMDb.Templates.moviesTable()}
    `

    OMDb.HTTPClient.getMyFavorites().then(function(movies) {
      OMDb.TemplatesRenderer.renderMovies(movies);
    });
  },

  renderHome: function() {
    var appContainer       = OMDb.TemplatesRenderer._appContainer();
    appContainer.innerHTML = OMDb.Templates.searchForm();
    OMDb.EventListeners.clickSearchButton();
  },

  renderMovie: function(imdbID) {
    OMDb.HTTPClient.getMovieByIMDbId(imdbID).then(function(movie) {
      OMDb.HTTPClient.getMyFavorites().then(function(favoriteMovies) {
        var appContainer = OMDb.TemplatesRenderer._appContainer();
        appContainer.innerHTML = `
          ${OMDb.Templates.back()}
          ${OMDb.Templates.myFavorites()}
          <h1>${movie.Title} (${movie.Year})</h1>
        `;

        var isFavorite = favoriteMovies.some(function(favoriteMovie) {
          return favoriteMovie.imdbID == movie.imdbID;
        });

        if (!isFavorite) {
          appContainer.innerHTML += `${OMDb.Templates.favoriteButton()}<br />`;
        }

        appContainer.innerHTML += `
          ${OMDb.Templates.moviePoster(movie)}
          ${OMDb.Templates.movieDetails(movie)}
        `;

        // TODO: I am not sure why it doesn't work when I put the event listener
        // function in the same if statement, maybe it is timing? This is what
        // works for now.
        if (!isFavorite) {
          OMDb.EventListeners.clickFavoriteButton(movie.Title, movie.imdbID);
        }
      });
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
  // NOTE: XMLHttpRequest is an API that allows
  // transferring data between a client and a server
  // without disrupting what the user is doing.
  // It is used in AJAX programming.
  getMyFavorites: function() {
    return new Promise(function(resolve, reject) {
      var queryRequest = new XMLHttpRequest();
      var url = '/favorites';

      queryRequest.onreadystatechange = function() {
        if (queryRequest.readyState == 4 && queryRequest.status == 200) {
          var movies = JSON.parse(queryRequest.responseText);
          var moviesPromise = movies.map(function(movie) {
            return OMDb.HTTPClient.getMovieByIMDbId(movie.oid);
          });
          Promise.all(moviesPromise).then(function(movies) {
            resolve(movies);
          });
        }
        // TODO: we need to reject this promise if it doesn't return 200
      }

      queryRequest.open('GET', url, true);
      queryRequest.send();
    });
  },

  likeMovie: function(name, oid) {
    return new Promise(function(resolve, reject) {
      var postRequest = new XMLHttpRequest();
      var url = '/favorites';

      postRequest.onreadystatechange = function() {
        if (postRequest.readyState == 4 && postRequest.status == 200) {
          var movie = JSON.parse(postRequest.responseText);
          resolve(movie);
        }
        // TODO: we need to reject this promise if it doesn't return 200
      }

      postRequest.open('POST', url, true);
      postRequest.setRequestHeader('Content-type', 'application/json');
      postRequest.send(JSON.stringify({ name: name, oid: oid }));
    });
  },

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
        var queryRequest = new XMLHttpRequest();
        var url = `http://www.omdbapi.com/?s=${query}`;

        queryRequest.onreadystatechange = function() {
          if (queryRequest.readyState == 4 && queryRequest.status == 200) {
            var responseJson = JSON.parse(queryRequest.responseText);
            // NOTE: the API also returns other things such as games
            var movies = responseJson.Search.filter(function(result) {
              return result.Type == 'movie';
            });
            resolve(movies);
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
      window.location.hash = 'home';
    } else if (hashValue.match(/home/) != null) {
      OMDb.TemplatesRenderer.renderHome();
    } else if (hashValue.match(/movies\/tt\d+/) != null) {
      var imdbID = window.location.hash.match(/tt\d+/)[0];
      OMDb.TemplatesRenderer.renderMovie(imdbID);
    } else if (hashValue.match(/my\-favorites/) != null) {
      OMDb.TemplatesRenderer.renderMyFavorites();
    }
  }
}

// NOTE: this event is fired when the initial HTML document has been
// completely loaded and parsed
document.addEventListener('DOMContentLoaded', function() {
  OMDb.router.route();
  window.addEventListener('hashchange', OMDb.router.route, false);
});
