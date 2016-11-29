"use strict"

var app = {
  config: {},
  routes: {},
  templateDir: "templates",
  viewId: "view"
};

app.set = function(key, conf) {
  app.config[key] = conf;
  return app;
};

app.setTemplateDir = function(dir) {
  app.templateDir = dir;
  return app;
};

app.setViewId = function(id) {
  app.viewId = id;
  return app;
};

app.setView = function(content) {
  $("#" + app.viewId).html(content);
};

app.run = function() {
  window.onhashchange = app.loadTemplate;

  Object.keys(app.config).forEach(function(e) {
    app.routes[e] = new RegExp("^" + e.replace(/:[^/]+/g, "(.+)") + "$");
  });

  // call once at loading first.
  app.loadTemplate();
};

app.getRouteKey = function(hash) {
  var routeKeys = Object.keys(app.routes).filter(function(e) {
      return app.routes[e].test(hash);
  });
  if (routeKeys.length > 0) {
    return routeKeys[0];
  }
};

app.loadTemplate = function () {

  var hash = location.hash.substring(1);
  var key = app.getRouteKey(hash);
  var config = app.config[key];
  if (config === undefined) {
    console.log("error: no such route: " + hash);
    app.setView("");
    return;
  }

  var templateName = config.template;
  if (templateName === undefined) {
    console.log("error: not set template: " + key);
    app.setView("");
    return;
  }

  if (config.bindings === undefined) {
    config.bindings = {};
  }

  var pathParams = app.parseHashParams(key, hash);

  var callback = config.callback;
  if (typeof(callback) === "function") {
    var ret = callback.call(config, config.bindings, pathParams);
    if (ret !== undefined) {
      config.bindings = ret;
    }
  }
  $.ajax(app.templateDir + "/" + templateName, {
    method: "get",
    dataType: "html",
    cache: false,
    success: function(template) {
      var output = Mustache.render(template, config.bindings);
      app.setView(output);
    },
    error: function() {
      console.log("error: cant find template: " + templateName);
    }
  });
};

app.parseHashParams = function(route, hash) {
  var keys = route.split("/").filter(function(e) {
    return e.charAt(0) === ":";
  }).map(function(e) {
    return e.substring(1);
  });
  if (keys.length === 0) {
    return;
  }
  var values = app.routes[route].exec(hash);
  if (values === null) {
    return;
  }
  values.shift();
  var result = {};
  for (var i=0; keys.length > i; i++) {
    result[keys[i]] = values[i];
  }
  return result;
};

