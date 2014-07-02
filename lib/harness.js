
var Mustache = require('mustache'),
    child_process = require('child_process'),
    path = require('path'),
    tmp = require('tmp'),
    fs = require('fs'),
    templates = require('./templates');

var wrapper_template = fs.readFileSync(
      path.resolve(__dirname, 'templates/wrapper.mus')).toString('utf8');

var linked_templates = templates.load({
      'wrapper': 'wrapper.mus'
    });

function wrap_script(script_path) {
  var script_content = fs.readFileSync(script_path).toString('utf8');

  return linked_templates.wrapper({
    perf_path: path.resolve(__dirname, '../'),
    script: script_content
  });
}

function create_script(script_path) {
  var wrapped_script = wrap_script(script_path),
      script_dir = path.dirname(script_path),
      out_path = path.resolve(script_dir, '.' + Date.now() + '.js');

  fs.writeFileSync(out_path, wrapped_script);

  return out_path;
}

function run_script(script_path, out_path) {
  var child = child_process.fork(script_path, [], {
        cwd: process.cwd(),
        env: {
          'NODE_PATH': process.cwd() + ',' + process.cwd() + '/node_modules'
        }
      }),
      stats = [], diff = [], leaks = [], prof, timespan;

  child.on('message', function(message) {
    if (message.stats) stats.push(message.stats);
    if (message.diff) diff.push(message.diff);
    if (message.leaks) leaks.push(message.leaks);
    if (message.prof) prof = message.prof;
    if (message.timespan) timespan = message.timespan;
  });

  child.on('exit', function() {
    fs.unlinkSync(script_path);

    console.log('\nWriting out data to ' + out_path);
    fs.writeFileSync(out_path, JSON.stringify({
      stats: stats,
      diff: diff,
      leaks: leaks,
      prof: prof,
      timespan: timespan
    }, null, ' ') + '\n');
  });

  process.on('SIGUSR2', function() {
    child.kill();
  });

  process.on('SIGALRM', function() {
    child.send('heap');
  });

  return child;
}

module.exports = {

  run: function(script, out) {
    var script_path = path.resolve(process.cwd(), script),
        out_path = path.resolve(process.cwd(), out);

    run_script(
      create_script(script_path),
      out_path
    );
  }

};
