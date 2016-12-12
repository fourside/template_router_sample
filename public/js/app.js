"use strict"

$(document).ready(function() {

  var router = new Router();
  router.set("list", {
    template: "list.html",
    callback: function(bindings) {
      bindings.title = "list is below:";
      bindings.selected = function() {
        return function(title, render) {
          return this.title === render(title) ? "selected" : "";
        };
      };
      return Promise.all([
          getList(),
          getCategory()
      ]);
    },
    after: function() {
      $("#reload").click(function() {
          router.loadTemplate();
      });
    }
  })
  .set("register", {
    template: "register.html",
    callback: function(bindings) {
      bindings.title = "hogepiyo";
    }
  })
  .set("search/keyword/:keyword/category/:category", {
    template: "search.html",
    callback: function(bindings, params) {
      bindings.keyword = params.keyword;
      bindings.category = params.category;
    }
  })
  .set("update/:id", {
    template: "update.html",
    callback: function(bindings, params) {
      bindings.title = "hogepiyo";
      bindings.id = params.id;
    }
  })
  .setTemplateDir("templates")
  .run();

  function reload() {
    router.loadTemplate();
  }
});

function getList() {
  return $.ajax("/api/list", {
    method: "get",
    dataType: "json",
    success: function(xhr) {
      console.log("in success at getList")
    },
    error: function(error) {
      console.log(error);
    }
  });
}

function getCategory() {
  return $.ajax("/api/category", {
    method: "get",
    dataType: "json",
    success: function(xhr) {
      console.log("in success at getCategory")
    },
  });
}
