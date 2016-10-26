# lunr-depth

This plugin provides a backend for the [contextual-search](https://github.com/jrwells/gitbook-plugin-contextual-search) plugin.

This plugin replaces the default [lunr](https://github.com/GitbookIO/plugin-lunr) plugin, providing a number of additonal depth information.

### Usuage

The default [lunr](https://github.com/GitbookIO/plugin-lunr) must be disabled using a `book.json` configuration and this plugin must be added:

```js
{
    "plugins": ["-lunr", "lunr-depth"]
}
```

### Additional configuration

Two additional configuration variables are available (defaults shown below).

`others` defines the name for the universal depth (similar to the `title` of the book).

`floor` defines at what that universal depth is.

```js
{
    "pluginsConfig": {
        "lunr-depth": {
            "others": "Others",
            "floor": "1"
        }
    }
}
```

## lunr

This is a drop in replacement for the [lunr](https://github.com/GitbookIO/plugin-lunr) default plugin, all of the original functionality is still present.

### Limitations

Lunr can't index a huge book, by default the index size is limited at ~100ko.

You can change this limit by settings the configuration `maxIndexSize`:

```js
{
    "pluginsConfig": {
        "lunr-depth": {
            "maxIndexSize": 200000
        }
    }
}
```

### Adding keywords to a page

You can specify explicit keywords for any page. When searching for these keywords, the page will rank higher in the results.

```md
---
search:
    keywords: ['keyword1', 'keyword2', 'etc.']

---

## My Page

This page will rank better if we search for 'keyword1'.
```

### Disabling indexing of a page

You can disable the indexing of a specific page by adding a YAML header to the page:

```md
---
search: false
---

## My Page

This page is not indexed in Lunr.
```

### Ignoring special characters

By default, special characters will be taken into account, to allow special searches like "C++" or "#word". You can disable this if your text is essentially English prose with the `ignoreSpecialCharacters` option:


```js
{
    "pluginsConfig": {
        "lunr-depth": {
            "ignoreSpecialCharacters": true
        }
    }
}
```
