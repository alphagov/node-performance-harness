
var fs = require('fs'),
    path = require('path'),
    Mustache = require('mustache');

module.exports = {

  load: function(templates) {
    return Object.keys(templates)
      .reduce(function(linked, name) {
        var template = fs.readFileSync(
          path.resolve(__dirname, templates[name])).toString('utf8');
        linked[name] = Mustache.render.bind(Mustache, template);
        return linked;
      }, {});
  }

};
