"use strict"

function Router() {
  this.config = {};
  this.routes = {};
  this.templateDir = "templates";
  this.viewId = "view";
  this.viewElement;
  this.routeKeys = [];
}

Router.prototype.set = function(key, conf) {
  this.config[key] = conf;
  return this;
};

Router.prototype.setTemplateDir = function(dir) {
  this.templateDir = dir;
  return this;
};

Router.prototype.setViewId = function(id) {
  this.viewId = id;
  return this;
};

Router.prototype.setView = function(content) {
  this.viewElement.html(content);
};

Router.prototype.run = function() {
  window.onhashchange = this.loadTemplate;

  this.viewElement = $("#" + this.viewId);

  var _self = this;
  Object.keys(this.config).sort().forEach(function(e) {
    _self.routes[e] = new RegExp("^" + e.replace(/:[^/]+/g, "(.+)") + "$");
    _self.routeKeys.push(e);
  });

  // call once at loading first.
  this.loadTemplate();
};

Router.prototype.getRouteKey = function(hash) {
  for (var i=0; this.routeKeys.length > i; i++) {
    if (this.routes[this.routeKeys[i]].test(hash)) {
      return this.routeKeys[i];
    }
  }
};

Router.prototype.loadTemplate = function () {

  var hash = location.hash.substring(1);
  var key = this.getRouteKey(hash);
  var config = this.config[key];
  if (config === undefined) {
    console.log("error: no such route: " + hash);
    this.setView("");
    return;
  }

  var templateName = config.template;
  if (templateName === undefined) {
    console.log("error: not set template: " + key);
    this.setView("");
    return;
  }

  if (config.bindings === undefined) {
    config.bindings = {};
  }

  var pathParams = this.parseHashParams(key, hash);

  var callback = config.callback;
  var _self = this;
  if (typeof(callback) === "function") {
    var promise = callback.call(config, config.bindings, pathParams);
    if (promise !== undefined && typeof(promise.done === "function")) {
      promise.done(function(data) {
        var obj = _self.merge(config.bindings, data);
        _self.ajaxTemplate(templateName, obj);
      });
    });
    return;
  }
  this.ajaxTemplate(templateName, config.bindings);
};

Router.prototype.merge = function(obj1, obj2) {
  var obj;
  if (typeof(Object.assign) === 'function') {
    obj = Object.assign(true, {}, obj1, obj2);
  } else {
    // when IE11
    obj = $.extend(true, {}, obj1, obj2);
  }
  return obj;
};

Router.prototype.ajaxTemplate = function(templateName, bindings) {
  var _self = this;
  $.ajax(this.templateDir + "/" + templateName, {
    method: "get",
    dataType: "html",
    cache: false,
    success: function(template) {
      var output = Mustache.render(template, bindings);
      _self.setView(output);
    },
    error: function() {
      console.log("error: cant find template: " + templateName);
    }
  });
};

Router.prototype.parseHashParams = function(route, hash) {
  var keys = route.split("/").filter(function(e) {
    return e.charAt(0) === ":";
  }).map(function(e) {
    return e.substring(1);
  });
  if (keys.length === 0) {
    return;
  }
  var values = this.routes[route].exec(hash);
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

