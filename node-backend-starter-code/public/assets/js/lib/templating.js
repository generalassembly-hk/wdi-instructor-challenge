'use strict';

var MGR = (function(mgr) {
	/*
	 * Translates HTML template into an Element object. Template must contain
	 * one wrapper element.
	 * @param {Object} values An Object of name/value pairs to pass into the
	 * template.
	 * @returns {Element} The resulting Element object.
	 */
	var tplToElement = function(id, values) {
		// Get element by ID, then make Element object to contain HTML
		var el = document.getElementById(id);
		var destEl = document.createElement('div');

		// Trim excess whitespace, replace placeholders, and return child
		var newHTML = el.innerHTML.trim();
		destEl.innerHTML = replacePlaceholders(newHTML, values);

		// For simplicity's sake, restrict templates to have a single wrapper
		// element
		if (1 < destEl.childNodes.length) {
			console.error('Template must be wrapped in container element');
			return null;
		}

		return destEl.firstChild;
	};

	/*
	 * Replace variable placeholders in templates with values.
	 * @param {string} html The HTML to modify.
	 * @param {Object} values An Object of name/value pairs to pass into the
	 * template.
	 */
	var replacePlaceholders = function(html, values) {
		var newHTML = html;
		// Iterate all values and perform string replace on HTML
		for (var k in values) {
			var needle = '{' + k + '}',
				value = escapeHTML(values[k]);
			newHTML = newHTML.replace(needle, value);
		}
		return newHTML;
	};

	/*
	 * Escape raw value.
	 * @param {string} text The text to escape.
	 * @returns {string} Escaped string.
	 */
	var escapeHTML = function(text) {
		// Initialize DIV, create a text node inside with text, append that to
		// the DIV, then get the innerHTML for escaped text
		var d = document.createElement('div');
		var t = document.createTextNode(text);
		d.appendChild(t);
		return d.innerHTML;
	};

	mgr.templating = {
		tplToElement: tplToElement
	};

	return mgr;
})(MGR);
