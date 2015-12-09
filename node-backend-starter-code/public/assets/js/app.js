'use strict';

(function(mgr) {
	var apiURL = 'http://www.omdbapi.com';

	var createIndexView = function(view, data) {
		if (data.hasOwnProperty('Search')) {
			// Iterate each search result and generate the DOM Element, then
			// insert it into the DOM
			for (var i = 0; i < data.Search.length; i++) {
				var el = mgr.templating.tplToElement('entry-tpl', data.Search[i]);
				view.appendChild(el);
			}
		} else {
			// Display an error if received from API
			if (data.hasOwnProperty('Error')) {
				window.alert(data.Error);
			}
		}
	};

	var createMovieView = function(view, data) {
		var el = mgr.templating.tplToElement('movie-tpl', data);
		view.appendChild(el);
	};

	// TODO: refactor
	var initBindings = function() {
		var searchForm = document.getElementById('searchForm');
		if (searchForm instanceof Element) {
			var queryInput = document.getElementById('queryInput');
			searchForm.addEventListener('submit', function(e) {
				e.preventDefault();

				// Clean up view
				var view = document.getElementById('searchResults');
				view.innerHTML = '';

				// Get search results from remote
				var query = queryInput.value;
				mgr.ajax.getJSON(
					apiURL + '/?r=json&type=movie&s=' + encodeURIComponent(query),
					null,
					function(data) {
						createIndexView(view, data);
					}
				)
			});
		}
	};

	// Do something on route change
	mgr.routing.attachRouteChangeHandler(function(route) {
		switch (route.view) {
			case 'movie':
				// Clean up view first
				var view = document.getElementById(route.view);
				view.innerHTML = '';

				// Get the current movie details from remote
				var id = route.params[0];
				mgr.ajax.getJSON(
					apiURL + '/?r=json&i=' + encodeURIComponent(id),
					null,
					function(data) {
						// Show an error if error received, then go back
						if (data.hasOwnProperty('Error')) {
							window.alert(data.Error);
							window.history.go(-1);
						} else {
							createMovieView(view, data);
						}
					}
				)
				break;
		}
	});

	// Set up routing
	mgr.routing.configure({
		'/': 'index',
		'/movie/([0-9a-z]+)': 'movie',
		default: 'index'
	});
	mgr.routing.init();

	initBindings();
})(MGR);
