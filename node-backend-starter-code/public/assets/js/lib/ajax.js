'use strict';

var MGR = (function(mgr) {
	var METHODS = {
		GET: 'get'
	};

	/*
	 * Perform XMLHttpRequest.
	 * @param {string} url
	 * @param {Object} opts
	 * @param {Function} cb
	 */
	var ajax = function(url, opts, cb) {
		var xhr = new XMLHttpRequest();
		// Listen to load event to perform callback later
		xhr.addEventListener('load', function(e) {
			cb(xhr);
		});
		// Initialize the XMLHttpRequest object
		xhr.open(
			opts.method || METHODS.GET,
			url,
			opts.async || true
		);
		// Send the request
		xhr.send(opts.data);
	};

	/*
	 * Perform GET XMLHttpRequest.
	 * @param {string} url
	 * @param {Object} opts
	 * @param {Function} cb
	 */
	var get = function(url, opts, cb) {
		opts = opts || {};
		opts.method = METHODS.GET;
		ajax(url, opts, cb);
	};

	/*
	 * Perform GET XMLHttpRequest and parse JSON.
	 * @param {string} url
	 * @param {Object} opts
	 * @param {Function} cb
	 */
	var getJSON = function(url, opts, cb) {
		get(url, opts, function(e) {
			if (e.status === 200) {
				// Parse JSON if OK response
				var data = JSON.parse(e.responseText);
				cb(data);
			} else {
				cb(e);
			}
		});
	};

	mgr.ajax = {
		ajax: ajax,
		get: get,
		getJSON: getJSON
	};

	return mgr;
})(MGR);
