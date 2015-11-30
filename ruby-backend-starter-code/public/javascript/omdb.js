/****** Event Listeners *****/
document.getElementById('searchBtn').addEventListener('click', searchBtn, false); // Search Button
document.getElementById('refreshFavorites').addEventListener('click', refreshFavorites, false);  // Refresh Favorites Button

/*
 * API Request to OMDBAPI, with the value provided into the search box
 */
function searchBtn() {
  var xhr = new XMLHttpRequest();
  var uri = encodeURI('http://www.omdbapi.com/?S='+ document.getElementById('searchValue').value + '&y=&plot=short&r=json')

  xhr.open('GET', uri, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var jsonRes = JSON.parse(xhr.response)
      searchBtnSuccess(jsonRes)
    }
  }

  xhr.send(null);
}

/*
 * Function called when the search call is completed successfuly.
 */
function searchBtnSuccess(jsonRes) {
  htmlRes = document.getElementById('searchRes').getElementsByTagName('tbody')[0]
  /* OMDBAPI can retunr an invalid result. When it is the case, Search field is undefined, and an error message is stored*/
  if (jsonRes.Search === undefined) {
    htmlRes.innerHTML = '<td colspan="4" class="text-center">No Result : ' + jsonRes.Error + '</td>'
    return ;
  } else {
    htmlRes.innerHTML = ''
  }

  /* We build the table that include all results of the search */
  for (i = 0; i < jsonRes.Search.length; i++) {
    htmlRes.innerHTML += '<tr>' +
      '<td>' + jsonRes.Search[i].Type + '</td>' +
      '<td>' + jsonRes.Search[i].Year + '</td>' +
      '<td><a class="detail" href="#", data-imdbid="' + jsonRes.Search[i].imdbID + '">' + jsonRes.Search[i].Title + '</a></td>' +
      '<td><span class="glyphicon glyphicon-star favorite" data-name="' + jsonRes.Search[i].Title +
        '" data-oid="' + jsonRes.Search[i].imdbID + '" aria-hidden="true"></span></td>' +
    '</tr>'
  }

  // When building the table, we added 2 actions :
  // one to have the detail of the link
  for (var i = 0, newDetailLinks = document.getElementsByClassName('detail'); i < newDetailLinks.length; i++) {
    newDetailLinks[i].addEventListener('click', clickDetail, false);
  }

  // the other one to add in favorite
  for (var i = 0, newDetailLinks = document.getElementsByClassName('favorite'); i < newDetailLinks.length; i++) {
    newDetailLinks[i].addEventListener('click', clickFavorite, false);
  }
}

/*
 * Action called to display the detail of a movie. It can be called from the search and the favorite
 */
function clickDetail() {
  var xhr = new XMLHttpRequest();
  var uri = encodeURI('http://www.omdbapi.com/?i='+ this.attributes['data-imdbid'].value + '&y=&plot=long&r=json')

  xhr.open('GET', uri, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      clickSearchDetailSuccess(JSON.parse(xhr.response))
    }
  }

  xhr.send(null);
}

/*
 * Successful action after receiving the detail of a movie
 */
function clickSearchDetailSuccess(jsonRes) {
  // First we display the panel section
  document.getElementsByClassName('panel')[0].className = "panel panel-default show"

  // Then we create with Panel, and add some detail
  document.getElementsByClassName('panel-heading')[0].innerHTML = jsonRes.Title
  document.getElementsByClassName('panel-body')[0].innerHTML    = '<ul class="list-group">' +
      '<li class="list-group-item"><strong>Released:</strong>' + jsonRes.Released + '</li>' +
      '<li class="list-group-item"><strong>Genre:</strong>' + jsonRes.Genre + '</li>' +
      '<li class="list-group-item"><strong>Plot:</strong> ' + jsonRes.Plot + '</li>' +
      '<li class="list-group-item"><strong>Actors:</strong>' + jsonRes.Actors + '</li>' +
    '</ul>'
}

/*
 * add a movie to the favorite
 */
function clickFavorite() {
  var xhr = new XMLHttpRequest();
  var uri = encodeURI('/favorites')

  // Here we need to post the information
  xhr.open('POST', uri, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var jsonRes = JSON.parse(xhr.response)
      refreshFavoritesSuccess(jsonRes)
    }
  }

  xhr.send(JSON.stringify({
    name: this.attributes['data-name'].value,
    oid: this.attributes['data-oid'].value
  }));
}

/*
 * Refresh the favorites list
 */
function refreshFavorites() {
  var xhr = new XMLHttpRequest();
  var uri = encodeURI('/favorites')

  xhr.open('GET', uri, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      refreshFavoritesSuccess(JSON.parse(xhr.response))
    }
  }
  xhr.send(null);
}

/*
 * After receiving the favorite list, displaying it into a table
 */
function refreshFavoritesSuccess(jsonRes) {
  htmlRes = document.getElementById('favorites').getElementsByTagName('tbody')[0]
  if (jsonRes === undefined || jsonRes.length == 0) {
    // In case the list is empty, we just display a message
    htmlRes.innerHTML = '<tr><td colspan="2" class="text-center">No Favorites</td></tr>'
  } else {
    // Building the table
    for (i = 0, htmlRes.innerHTML = ''; i < jsonRes.length; i++) {
      htmlRes.innerHTML += '<tr>' +
        '<td><a class="detail" href="#", data-imdbid="' + jsonRes[i].oid + '">' + jsonRes[i].name + '</a></td>' +
        '<td></td>'
      '</tr>'
    }
  }

  // We can show the favorites list in case it is not already the case
  document.getElementById('favorites').className = "table-responsive show"

  // We need to add a listener to the list, since we may want to see the detail of the favorite
  for (var i = 0, newDetailLinks = document.getElementsByClassName('detail'); i < newDetailLinks.length; i++) {
    newDetailLinks[i].addEventListener('click', clickDetail, false);
  }
}