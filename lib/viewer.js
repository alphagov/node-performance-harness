
var fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    express = require('express'),
    templates = require('./templates');

var linked_templates = templates.load({
      'page': 'page.mus',
      'prof_row': 'prof/row.mus',
      'prof_table': 'prof/table.mus'
    });

function hash(node) {
  return crypto.createHash('sha1')
    .update(new Buffer(node.scriptName))
    .update(new Buffer(node.lineNumber))
    .update(new Buffer(node.functionName))
    .digest('hex');
}

function percent(num, denom) {
  return (Math.floor((num / denom * 100) * 100) / 100).toFixed(2)
}

function build_prof_tree(node, total_time, parent_node, depth) {
  var children_html = '';

  if (depth === undefined) depth = 0;

  node.id = hash(node);

  if (node.children) {
    children_html = node.children.map(function(child) {
      return build_prof_tree(child, total_time ,node, depth + 1);
    }).join('');
  }
  return linked_templates.prof_row({
    node: node,
    totalPercent: percent(node.totalTime, total_time),
    selfPercent: percent(node.selfTime, total_time),
    parent_node: parent_node,
    offset: 5 + depth * 5
  }) + children_html;
}

function build_prof_table(node) {
  return linked_templates.prof_table({
    rows: build_prof_tree(node, node.totalTime)
  });
}

function build_html(json) {
  var sorted_diffs = json.diff.map(function(diff) {
    diff.change.details.sort(function(a, b) {
      if (a.size_bytes > b.size_bytes) return -1;
      else if (a.size_bytes < b.size_bytes) return 1;
      else return 0;
    });
    return diff;
  });
  return linked_templates.page({
    prof_table: json.prof ? build_prof_table(json.prof) : '',
    gc_data: JSON.stringify(json.stats),
    diff: json.diff,
    leaks: json.leaks
  });
}

module.exports = {

  start: function(json_path, port) {
    var app = express(),
        json = JSON.parse(require('fs').readFileSync(json_path)),
        html = build_html(json);

    app.get('/', function(req, res) {
      res.end(html);
    });

    app.use('/static', express.static(
      path.resolve(__dirname, '../public')));

    port = port || 3000;
    app.listen(port);

    console.log('Viewer started at http://localhost:' + port);
  }

};
