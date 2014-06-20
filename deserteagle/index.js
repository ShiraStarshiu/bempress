var VM = require('vm'),
    vow = require('vow'),
    VowFs = require('vow-fs'),
    path = require('path'),
    settings = {};

function make(bundlePath, settings) {
    if ('development' == settings.settings.env) {
        return rebuild(bundlePath)
            .then(function() {
                return compileCtx(bundlePath);
            })
            .then(function(templates) {
                return apply(templates.BEMTREE, templates.BEMHTML).call(null, settings.data);
            });
    } else {
        return compileCtx(bundlePath)
            .then(function(templates) {
                return apply(templates.BEMTREE, templates.BEMHTML).call(null, settings.data);
            });
    }
}

function compileCtx(bundlePath) {
    var targets = [
            '.bemtree.js',
            '.bemhtml.js'
        ],
        ctx = { Vow: vow };

    return vow.all(targets.map(function(target) {
            return VowFs.read(bundlePath + target, 'utf-8');
        }))
        .then(function(targetSources) {
            targetSources.forEach(function(targetSource) {
                VM.runInNewContext(targetSource, ctx);
            });

            return ctx;
        });
}

function rebuild(bundlePath) {
    var enbBuilder = require('enb/lib/server/server-middleware').createBuilder();

    return vow.all([
        '.bemtree.js',
        '.bemhtml.js',
        '.css',
        '.js'
    ].map(function(target) {
        return enbBuilder(bundlePath + target);
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

function getSettings(name) {
    return name ?
        settings[name] :
        settings;
}

function render(fullPath, settings, fn) {
    var bundleName = path.basename(fullPath, '.bemdecl.js'),
        views = path.basename(settings.settings.views),
        bundlePath = path.join(views, bundleName, bundleName);

    make(bundlePath, settings)
        .then(function(html) {
            fn(null, html);
        })
        .fail(function(err) {
            'development' == settings.settings.env ?
                fn(err) :
                fn('404 O_o');
        });
}

function middleware(req, res, next) {
    var render = res.render;

    res.render = function(bundle, view, data) {
        if (!data) {
            data = view || {};
            view = bundle;
            bundle = getSettings('default');
        }

        data.view = view;

        render.call(this, bundle, { data: data });
    };

    next();
}

module.exports = {
    init: function(app, params) {
        settings = params;

        app.set('views', path.join(__dirname, '..', settings.path));
        app.set('view engine', settings.file);
        app.engine(settings.file, render);
        app.use(middleware);
    }
};
