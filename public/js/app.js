"use strict"

$(document).ready(function() {

  (new Router()).set("list", {
    template: "list.html",
    callback: function(bindings) {
      bindings.title = "list is below:";
      return Promise.all([
          getList(),
          getCategory()
      ]);
    }
  })
  .set("register", {
    template: "register.html",
    callback: function(bindings) {
      bindings.title = "hogepiyo";
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
