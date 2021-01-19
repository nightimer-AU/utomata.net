



function Analyzer(_parent){


  var parentDiv = _parent;

  let sketch = function(p) {
    var img;
    var r = new Array(256);
    var g = new Array(256);
    var b = new Array(256);
    var p5Canvas;

    p.setup = function() {
      p5Canvas = p.createCanvas(276, 84);
      p5Canvas.parent(parentDiv);

      // p.blendMode(p.ADD);
      p.background(32);
    };

    // p.draw = function() {
    //   p.background(64);
    //   p.noLoop();
    // };

    p.calcHisto = function(img_url){
        p.blendMode(p.BLEND);
        p.background(32);
        p.blendMode(p.ADD);
        p.noFill();

        var img;
        var raw = new Image();
        raw.src=img_url; // base64 data here
        raw.onload = function() {
          img = p.createImage(raw.width, raw.height);
          img.drawingContext.drawImage(raw, 0, 0);

          var h = p.height-20;

          for(var i = 0 ; i < 256; i++){
            r[i] = 0;
            g[i] = 0;
            b[i] = 0;
          }

          img.loadPixels();
          for(var i = 0 ; i < img.pixels.length; i+=4){
            r[img.pixels[i]]++;
            g[img.pixels[i + 1]]++;
            b[img.pixels[i + 2]]++;
          }
          img.updatePixels();

          var maxi = 0;
          // get maximun value
          for(var i = 0; i < 256; i++){
            if(r[i] > maxi) maxi = r[i];
            if(g[i] > maxi) maxi = g[i];
            if(b[i] > maxi) maxi = b[i];
          }

          // get avg
          var avgR = 0;
          var avgG = 0;
          var avgB = 0;
          for(var i = 0; i < img.pixels.length; i+=4){
            avgR += img.pixels[i];
            avgG += img.pixels[i+1];
            avgB += img.pixels[i+2];
          }
          avgR /= (img.pixels.length/4);
          avgG /= (img.pixels.length/4);
          avgB /= (img.pixels.length/4);

          // draw the histogram
          var dv = maxi/h;
          p.push();
          p.translate(10,10);
          p.stroke(255,0,0);
          p.beginShape();
          for(var i = 0; i < 256; i++){
            p.vertex(i, h- r[i]/dv);
          }
          p.endShape();
          p.line(avgR, h+4, avgR, h+8, );

          p.stroke(0,255,0);
          p.beginShape();
          for(var i = 0; i < 256; i++){
            p.vertex(i, h- g[i]/dv);
          }
          p.endShape();
          p.line(avgG, h+4, avgG, h+8, );

          p.stroke(0,0,255);
          p.beginShape();
          for(var i = 0; i < 256; i++){
            p.vertex(i, h- b[i]/dv);
          }
          p.endShape();
          p.line(avgB, h+4, avgB, h+8, );
          p.pop();

          // noramalize values for printing
          avgR = decimal(avgR/256, 5);
          avgG = decimal(avgG/256, 5);
          avgB = decimal(avgB/256, 5);

          // add info
          $("#analysisInfo").text("");
          $("#analysisInfo").append("<p>Maixmal: " +maxi + "</p>");
          $("#analysisInfo").append("<p>Avg R: " +avgR + "</p>");
          $("#analysisInfo").append("<p>Avg G: " +avgG + "</p>");
          $("#analysisInfo").append("<p>Avg B: " +avgB + "</p>");
        }
      }

      function decimal(n, d){
          var a = Math.pow(10,d);
          return Math.round(n * a) / a;
      }

  };

  let myp5 = new p5(sketch);

  this.calcHistogram = function(img_url){
    myp5.calcHisto(img_url);
  }


  this.VisualizePgm = function(treeData, containerId){

    var treemap, svg, root;

    // TODO: get depth

    var _wid = 256;
    var _hei = 256;
    var _dep = 16;

    // Set the dimensions and margins of the diagram
    var margin = {top: 16, right: 16, bottom: 16, left: 16},
        width = _wid - margin.left - margin.right,
        height = _hei - margin.top - margin.bottom;

    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin

    var i = 0,
        duration = 0;

    // declares a tree layout and assigns the size
    treemap = d3.tree().size([height, width]);

    // Assigns parent, children, height, depth
    root = d3.hierarchy(treeData, function(d) {
      return d.children;
    });
    root.x0 = height / 2;
    root.y0 = 0;

    // clear the container
    var elem = document.getElementById(containerId);

    while (elem.firstChild) {
      elem.removeChild(elem.firstChild);
    }

    svg = d3.select("#"+containerId).append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate("
              + margin.left + "," + margin.top + ")");

    update(root);

    // console.log(d3);


    function update(source) {

      // Assigns the x and y position for the nodes
      var treeData = treemap(root);

      // Compute the new tree layout.
      var nodes = treeData.descendants(),
          links = treeData.descendants().slice(1);

      // Normalize for fixed-depth.
      nodes.forEach(
        function(d){
            d.y = d.depth * _dep;
         }
      );

      // ****************** Nodes section ***************************

      // Update the nodes...
      var node = svg.selectAll('g.node')
          .data(nodes, function(d) {return d.id || (d.id = ++i); });

      // Enter any new modes at the parent's previous position.
      var nodeEnter = node.enter().append('g')
          .attr('class', 'node')
          .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        // .on('click', click);

      // Add Circle for the nodes
      nodeEnter.append('circle')
          .attr('class', 'node')
          .attr('r', 1e-6);

      // Add labels for the nodes
      nodeEnter.append('text')
          .attr("dy", function(d) {
              return d.children || d._children ? "0.35em" : "0.35em";
          })
          .attr("x", function(d) {
              return d.children || d._children ? 5 : 5;
          })
          .attr("text-anchor", function(d) {
              return d.children || d._children ? "end" : "start";
          })
          .attr('class', 'strokeBg')
          .text(function(d) { return d.data.name; });

      nodeEnter.append('text')
          .attr("dy", function(d) {
              return d.children || d._children ? "0.35em" : "0.35em";
          })
          .attr("x", function(d) {
              return d.children || d._children ? 5 : 5;
          })
          .attr("text-anchor", function(d) {
              return d.children || d._children ? "end" : "start";
          })
          .text(function(d) { return d.data.name; });



      // UPDATE
      var nodeUpdate = nodeEnter.merge(node);

      // Transition to the proper position for the node
      nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + d.y + "," + d.x + ")";
         });

      // Update the node attributes and style
      nodeUpdate.select('circle.node')
        .attr('r', 1.2)
        .style("fill", function(d) {
            return d.children ? "#fff" : "#000";
        })
        .attr('cursor', 'pointer');


      // Remove any exiting nodes
      var nodeExit = node.exit().transition()
          .duration(duration)
          .attr("transform", function(d) {
              return "translate(" + source.y + "," + source.x + ")";
          })
          .remove();

      // On exit reduce the node circles size to 0
      nodeExit.select('circle')
        .attr('r', 1e-6);

      // On exit reduce the opacity of text labels
      nodeExit.select('text')
        .style('fill-opacity', 1e-6);

      // ****************** links section ***************************

      // Update the links...
      var link = svg.selectAll('path.link')
          .data(links, function(d) { return d.id; });

      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert('path', "g")
          .attr("class", "link")
          .attr('d', function(d){
            var o = {x: source.x0, y: source.y0}
            return diagonal(o, o)
          });


      // UPDATE
      var linkUpdate = linkEnter.merge(link);

      // Transition back to the parent element position
      linkUpdate.transition()
          .duration(duration)
          .attr('d', function(d){ return diagonal(d, d.parent) });

      // Remove any exiting links
      var linkExit = link.exit().transition()
          .duration(duration)
          .attr('d', function(d) {
            var o = {x: source.x, y: source.y}
            return diagonal(o, o)
          })
          .remove();

      // Store the old positions for transition.
      nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
      });

      // Creates a curved (diagonal) path from parent to the child nodes
      function diagonal(s, d) {

        path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`

        path = `M ${s.y} ${s.x}
                L ${(s.y + d.y) / 2} ${s.x},
                  ${d.y} ${d.x}`

        return path
      }


      // Toggle children on click.
      function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
          } else {
            d.children = d._children;
            d._children = null;
          }
        update(d);
      }
    }
  }



} // analyzer
