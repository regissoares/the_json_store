require.config({
  paths: {
    jquery: 'lib/jquery',
    underscore: 'lib/underscore',
    backbone: 'lib/backbone',
    text: 'lib/text',
    localstorage: 'lib/backbone.localStorage',
    app: 'json_store'
  },
  shim: {
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  }
});

require(['app'], function (app) {
  app.init();
});
