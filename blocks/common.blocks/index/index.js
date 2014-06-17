modules.define('button', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    provide(BEMDOM.decl('index', {

        onSetMod : {
            'js' : {
                'inited' : function() {
                    console.log($('.index'));
                }
            }
        }

    }, {

    }));

});
