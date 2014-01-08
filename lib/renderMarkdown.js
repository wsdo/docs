var marked = require("marked");
var titleToLink = require("./titleToLink");
var hljs = require("./highlight.js");

function unescape(html) {
	return html
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<')
		.replace(/&amp;/g, '&');
}

function escape(html) {
	return html
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

module.exports = function renderMarkdown(md, noRefs) {
	md = md.replace(/\[\[([a-z0-9 \-_\.]+)\]\]/gi, function(intraLink) {
		var match = /\[\[(.+)\]\]/gi.exec(intraLink);
		var link = titleToLink(match[1]);
		return "[" + match[1] + "](" + link + ".html)";
	});
	var renderer = new marked.Renderer();
	renderer.code = function(code, lang) {
		var html = false;
		if(lang === "html") lang = "xml";
		try {
			if(lang) html = hljs.highlight(lang, code).value;
			else html = hljs.highlightAuto(code).value;
		} catch(e) {
			html = escape(code);
		}
		return "<pre><code>" + html + "</code></pre>";
	};
	renderer.codespan = function(code) {
		code = unescape(code);
		var html = hljs.highlight("javascript", code).value;
		return "<code>" + html + "</code>";
	};
	renderer.heading = function(text, level, raw, options) {
		if(noRefs) {
			return '<h'
				+ level
				+ '>'
				+ text
				+ '</h'
				+ level
				+ '>\n';
		} else {
			return '<h'
				+ level
				+ '><a class="anchor" href="#'
				+ raw.toLowerCase().trim().replace(/[^\w]+/g, '-')
				+ '" id="'
				+ raw.toLowerCase().trim().replace(/[^\w]+/g, '-')
				+ '"><i class="glyphicon glyphicon-link"></i></a>'
				+ text
				+ '</h'
				+ level
				+ '>\n';
		}
	};
	return marked(md, {
		renderer: renderer,
		gfm: true,
		tables: true,
		breaks: false,
		smartLists: true,
		smartypants: true
	});
}