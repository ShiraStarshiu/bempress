var VM = require('vm'),
    vow = require('vow'),
    VowFs = require('vow-fs');

function make(options, data) {
    var path = options.path;

    if ('development' == options.env) {
        return rebuild(path)
            .then(function() {
                return compileCtx(path);
            })
            .then(function(templates) {
                return apply(templates.BEMTREE, templates.BEMHTML).call(null, data);
            });
    } else {
        return compileCtx(path)
            .then(function(templates) {
                return apply(templates.BEMTREE, templates.BEMHTML).call(null, data);
            });
    }
}

function compileCtx(path) {
    var targets = [
            '.bemtree.js',
            '.bemhtml.js'
        ],
        ctx = { Vow: vow };

    return vow.all(targets.map(function(target) {
            return VowFs.read(path + target, 'utf-8');
        }))
        .then(function(targetSources) {
            targetSources.forEach(function(targetSource) {
                VM.runInNewContext(targetSource, ctx);
            });

            return ctx;
        });
}

function rebuild(path) {
    var enbBuilder = require('enb/lib/server/server-middleware').createBuilder();

    return vow.all([
        '.bemtree.js',
        '.bemhtml.js',
        '.css',
        '.js'
    ].map(function(target) {
        return enbBuilder(path + target);
    }));
}

function apply(BEMTREE, BEMHTML) {
    return function(data) {
        return BEMTREE.apply({
            block: 'root',
            data: data
        }).then(BEMHTML.apply);
    };
}

exports.render = function(options, data, fn) {
    make(options, data)
        .then(function(html) {
            fn(null, html);
        })
        .fail(function(err) {
            fn(err);
        });
};
