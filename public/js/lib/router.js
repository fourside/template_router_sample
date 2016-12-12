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
  this.viewElement.innerHTML = content;
};

Router.prototype.run = function() {

  this.viewElement = document.getElementById(this.viewId);

  var _self = this;
  window.onhashchange = function() {
    _self.loadTemplate();
  };
  Object.keys(this.config).sort().forEach(function(e) {
    this.routes[e] = new RegExp("^" + e.replace(/:[^/]+/g, "(.+)") + "$");
    this.routeKeys.push(e);
  }, this);

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
  if (typeof callback  === "function") {
    var promise = callback.call(config, config.bindings, pathParams);
    if (promise !== undefined && typeof promise.then === "function") {
      promise.then(function(data) {
        var obj = _self.merge(config.bindings, data);
        _self.ajaxTemplate(templateName, obj, config);
      });
      return;
    };
  }
  this.ajaxTemplate(templateName, config.bindings, config);
};

Router.prototype.merge = function(bindings, data) {
  var params = [true, {}, bindings];
  if (Array.isArray(data)) {
    params = params.concat(data);
  } else {
    params.push(data);
  }
  var obj;
  if (typeof Object.assign  === 'function') {
    obj = Object.assign.apply(Object, params);
  } else {
    // when IE11
    obj = $.extend.apply($, params);
  }
  return obj;
};

Router.prototype.ajaxTemplate = function(templateName, data, config) {
  var _self = this;
  $.ajax(this.templateDir + "/" + templateName, {
    method: "get",
    dataType: "html",
    cache: false,
    success: function(template) {
      var output = Mustache.render(template, data);
      _self.setView(output);
      _self.afterCallback(config);
    },
    error: function() {
      console.log("error: cant find template: " + templateName);
    }
  });
};

Router.prototype.afterCallback = function(config) {
  var afterCallback = config.after;
  if (typeof afterCallback  === "function") {
    afterCallback.call(config);
  }
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
  var params = {};
  keys.forEach(function(key, index) {
    params[key] = values[index];
  });
  return params;
};

