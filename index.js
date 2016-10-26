var lunr = require('lunr');
var Entities = require('html-entities').AllHtmlEntities;

var Html = new Entities();

var searchIndex;
// Called with the `this` context provided by Gitbook
function getSearchIndex(context) {
    if (!searchIndex) {
        // Create search index
        var ignoreSpecialCharacters = context.config.get('pluginsConfig.lunr-depth.ignoreSpecialCharacters') || context.config.get('lunr-depth.ignoreSpecialCharacters');
        searchIndex = lunr(function () {
            this.ref('url');

            this.field('title', { boost: 10 });
            this.field('keywords', { boost: 15 });
            this.field('body');

            if (!ignoreSpecialCharacters) {
                // Don't trim non words characters (to allow search such as "C++")
                this.pipeline.remove(lunr.trimmer);
            }
        });
    }
    return searchIndex;
}

// Map of Lunr ref to document
var documentsStore = {};

// Map of levels to titles
var levelToTitle = {};

var searchIndexEnabled = true;
var indexSize = 0;

module.exports = {
    book: {
        assets: './assets',
        js: [
            'lunr.min.js', 'search-lunr.js'
        ]
    },

    hooks: {
        // Index each page
        'page': function(page) {
            if (this.output.name != 'website' || !searchIndexEnabled || page.search === false) {
                return page;
            }

            var text, maxIndexSize;
            maxIndexSize = this.config.get('pluginsConfig.lunr-depth.maxIndexSize') || this.config.get('lunr-depth.maxIndexSize');

            this.log.debug.ln('index page', page.path);

            text = page.content;
            // Decode HTML
            text = Html.decode(text);
            // Strip HTML tags
            text = text.replace(/(<([^>]+)>)/ig, ' ');

            indexSize = indexSize + text.length;
            if (indexSize > maxIndexSize) {
                this.log.warn.ln('search index is too big, indexing is now disabled');
                searchIndexEnabled = false;
                return page;
            }

            var keywords = [];
            if (page.search) {
                keywords = page.search.keywords || [];
            }

            // Map a page's level to its title
            levelToTitle[page.level] = page.title;

            // Add to index
            var doc = {
                url: this.output.toURL(page.path),
                title: page.title,
                level: page.level,
                depth: page.depth,
                summary: page.description,
                keywords: keywords.join(' '),
                body: text.trim()
            };

            documentsStore[doc.url] = doc;
            getSearchIndex(this).add(doc);

            return page;
        },

        // Write index to disk
        'finish': function() {
            if (this.output.name != 'website') return;

            // This will be used for the lowest depth title, default to 'Other'
            var other = this.config.get('pluginsConfig.lunr-depth.others') || 
                        this.config.get('title') || 'Other';
            // Lowest depth, default to 1
            var floor = this.config.get('pluginsConfig.lunr-depth.floor') ||
                        '1';
            levelToTitle[floor] = other;

            this.log.debug.ln('write search index');
            return this.output.writeFile('search_index.json', JSON.stringify({
                index: getSearchIndex(this),
                store: documentsStore,
                levels: levelToTitle
            }));
        }
    }
};

