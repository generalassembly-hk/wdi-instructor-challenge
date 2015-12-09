'use strict';

var MGR = (function(mgr) {
	var routeCfg = null;
	var routeChangeHandler = null;
	var historySupported = typeof window.history === 'object';

	/*
	 * Prepares the DOM for routing.
	 */
	var init = function() {
		var route = getCurrentRoute();
		displayView(route.view);
		routeChangeHandler(route);
	};

	/*
	 * Set up routing configuration.
	 * @param {Object} An Object with the route as the key and the destination
	 * view as the value.
	 */
	var configure = function(routes) {
		routeCfg = routes;
	};

	var attachRouteChangeHandler = function(cb) {
		routeChangeHandler = cb;
		if (historySupported) {
			window.addEventListener('popstate', function() {
				var route = getCurrentRoute();
				displayView(route.view);
				cb(route);
			}, false);
		} else {
			window.addEventListener('hashchange', function(newURL) {
				var route = getCurrentRoute();
				displayView(route.view);
				cb(route);
			}, false);
		}
	};

	/*
	 * Get the current route information.
	 * @returns {Object|null} The matched route (with view and params) or null
	 * if none found.
	 */
	var getCurrentRoute = function() {
		var path = window.location.hash.substr(1);
		return matchRoute(path);
	};

	/*
	 * Go to a configured path.
	 */
	var go = function(path) {
		var normalizedPath = normalizePath(path);
		var fullPath = '#' + normalizedPath;
		var route = matchRoute(normalizedPath);
		if (route) {
			displayView(route.view);
			if (historySupported) {
				window.location.hash = fullPath;
			} else {
				window.history.pushState({}, null, fullPath);
			}
		}
	};

	/*
	 * Manipulate DOM to display a particular view.
	 * @param {string|null} view The ID of the view. Null value will hide all
	 * views or fallback to the configured default view.
	 */
	var displayView = function(view) {
		// Fallback to default route if null
		if (!view && routeCfg.hasOwnProperty('default')) {
			view = routeCfg.default;
		}

		// Iterate all elements to set display style
		var elems = document.querySelectorAll('view');
		for (var i = 0; i < elems.length; i++) {
			var el = elems[i];
			// If view value matches the element ID, then display it
			el.style.display = el.id === view ? 'block' : 'none';
		}
	};

	/*
	 * Match a path to a configured route.
	 * @param {string} The path to match.
	 * @returns {Object|null} The matched route (with view and params) or null
	 * if none found.
	 */
	var matchRoute = function(path) {
		if (!path || path === '') {
			path = '/';
		}

		// Perform hash lookup first
		if (routeCfg.hasOwnProperty(path)) {
			return {
				view: routeCfg[path],
				params: []
			};
		}

		// Iterate through all routes for regex match
		for (var route in routeCfg) {
			var re = new RegExp('^' + route + '$');
			var match = re.exec(path);
			if (match && 1 < match.length) {
				return {
					view: routeCfg[route],
					params: match.slice(1) // return matched params
				}
			}
		}

		return null;
	};

	var normalizePath = function(url) {
		var newURL = '';
		// Prepend first forward slash
		if (url.indexOf('/') !== 0 || url === '/') {
			newURL += '/';
		}

		// Trim last forward slash
		if (url.lastIndexOf('/') === url.length - 1) {
			url = url.substr(0, url.length - 1);
		}
		newURL += url;
		return newURL;
	};

	mgr.routing = {
		init: init,
		configure: configure,
		attachRouteChangeHandler: attachRouteChangeHandler,
		getCurrentRoute: getCurrentRoute,
		go: go
	};

	return mgr;
})(MGR);
