A harness for starting a node app and recording performance.

# Installation

```
$ npm install -g performance-harness
```

# Running

```
$ node-perf run [--out=<path>] <script>
```

This will run the given script but wrap it in memwatch and a profiler. You can cause a heap dump to be taken by signalling SIGALRM. The internal node process running your code can be exitted by signalling SIGUSR2.

Providing --out will dump the report into the given path rather than ./out.json

The script provided should be the usual entry point into your application that you would run with `node <script>`.


```
$ node-perf view <json>
```

This will start a webserver on port 3000 and expose an html interface to view the results stored in the report json.


