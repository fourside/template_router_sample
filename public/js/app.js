"use strict"

$(document).ready(function() {
    app.run();
});

app.set("list", {
  template: "list.html",
  callback: function(bindings) {
    return {
      name: "foobar"
    };
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
.setTemplateDir("templates");
;

