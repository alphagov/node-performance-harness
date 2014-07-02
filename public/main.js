(function() {

  function elems(selector) {
    return Array.prototype.slice.call(
      document.querySelectorAll(selector));
  }

  function toggle(elem, cls) {
    if (elem.classList.contains(cls)) {
      elem.classList.remove(cls);
    } else {
      elem.classList.add(cls);
    }
  }

  elems('.prof tr').forEach(function(row) {
    row.addEventListener('click', function() {
      var id = row.getAttribute('data-node');
      toggle(row, 'opened');
      elems('.prof tr.node-' + id).forEach(function(child_row) {
        toggle(child_row, 'hidden');
      });
    });
  });

  window.NP = {
    gc_graph: function(gc_data, metrics, selector) {
      var element = document.querySelector(selector),
          margin = {top: 20, right: 20, bottom: 30, left: 70},
          width = element.offsetWidth - margin.left - margin.right,
          height = element.offsetHeight - margin.top - margin.bottom;

      var x = d3.time.scale()
        .range([0, width]);

      var y = d3.scale.linear()
        .range([height, 0]);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

      var lines = metrics.map(function(m) {
            return d3.svg.line()
              .x(function(d) { return x(d.timestamp); })
              .y(function(d) { return y(d[m]); });
          });

      var svg = d3.select(selector).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(d3.extent(gc_data, function(d) { return d.timestamp; }));

      var y_extent = metrics.map(function(m) { 
            return d3.extent(gc_data, function(d) { return d[m]; });
          }).reduce(function(out, extent) {
            if (out[0] > extent[0]) out[0] = extent[0];
            if (out[1] < extent[1]) out[1] = extent[1];
            return out;
          }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);

      y.domain(y_extent);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

      lines.forEach(function(line, i) {
        svg.append("path")
          .datum(gc_data)
          .attr("class", "line line-" + i)
          .attr("d", line);
      });
    }
  };

})();
