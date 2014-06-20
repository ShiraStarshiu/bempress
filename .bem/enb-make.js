module.exports = function(config) {
    config.node('bundles/index', function(nodeConfig) {
        nodeConfig.addTechs([
            [ require('enb/techs/levels'), { levels: getLevels(config) } ],
            [ require('enb/techs/file-provider'), { target: '?.bemdecl.js' } ],
            require('enb/techs/deps'),
            require('enb/techs/files'),
            require('enb/techs/css'),
            [ require('enb-diverse-js/techs/browser-js'), { target: '?.pre.js' } ],
            [ require('enb-modules/techs/prepend-modules'), { target: '?.js', source: '?.pre.js' } ],
            [ require('enb-bemxjst/techs/bemtree'), { devMode: false } ],
            [ require('enb-bemxjst/techs/bemhtml'), { devMode: false } ]
        ]);

        nodeConfig.mode('development', function(nodeConfig) {
            nodeConfig.addTechs([
                [ require('enb/techs/file-copy'), { sourceTarget: '?.js', destTarget: '_?.js' } ],
//                [ require('enb/techs/file-copy'), { sourceTarget: '?.css', destTarget: '_?.css' } ],
                [ require('enb-borschik/techs/borschik'), { freeze: true, minify: true, sourceTarget: '?.css', destTarget: '_?.css' } ],
                [ require("enb/techs/file-copy"), { sourceTarget: "?.bemhtml.js", destTarget: "_?.bemhtml.js" } ],
                [ require("enb/techs/file-copy"), { sourceTarget: "?.bemtree.js", destTarget: "_?.bemtree.js" } ]
            ]);
        });

        nodeConfig.mode('production', function(nodeConfig) {
            nodeConfig.addTechs([
                [ require('enb/techs/borschik'), { sourceTarget: '?.js', destTarget: '_?.js', minify: true } ],
                [ require('enb/techs/borschik'), { sourceTarget: '?.css', destTarget: '_?.css', minify: true } ]
            ]);
        });

        nodeConfig.addTargets(['_?.js', '_?.css', '_?.bemtree.js', '_?.bemhtml.js']);
    });
};

function getLevels(config) {
    return [
        { "path": "libs/bem-core/common.blocks", "check": false },
        { "path": "libs/bem-core/desktop.blocks", "check": false },
        { "path": "libs/bem-components/common.blocks", "check": false },
        { "path": "libs/bem-components/desktop.blocks", "check": false },
        'blocks/common.blocks'
    ].map(function(levelPath) { return config.resolvePath(levelPath); });
}
