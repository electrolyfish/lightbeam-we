// eslint-disable-next-line no-unused-vars
const viz = {
  radius: 5,
  textLabelGutter: 5,

  init(nodes, links) {
    const { width, height } = this.getDimensions('visualization');
    const { context } = this.createCanvas(width, height);

    this.width = width;
    this.height = height;
    this.context = context;
   // this.custom = custom;
    this.circles = {};
    this.labels = {};
    this.lines = {};
/*
    this.circles = custom.selectAll('custom.circle');
    this.labels = custom.selectAll('custom.label');
    this.lines = custom.selectAll('custom.line');
*/

    this.draw(nodes, links);
  },

  simulate(nodes, links) {
    this.simulation = this.simulateForce(nodes, links);
    //this.updatePositions();
    this.simulation.tick();
  },

  simulateForce(nodes, links) {
    const linkForce = d3.forceLink(links);
    let simulation;

    if (!this.simulation) {
      simulation = d3.forceSimulation(nodes);
    } else {
      simulation = this.simulation;
      this.simulation.stop();
      simulation.nodes(nodes);
    }

    linkForce.id((d) => d.hostname);
    linkForce.distance(100);
    simulation.force('charge', d3.forceManyBody());
    simulation.force('link', linkForce);
    simulation.force('center', d3.forceCenter(this.width/2, this.height/2));
    simulation.force('collide', d3.forceCollide(5));
    simulation.alphaTarget(1);

    return simulation;
  },

  createCanvas(width, height) {
    const base = d3.select('#visualization');
    const canvas = base.append('canvas');
    canvas.attr('width', width);
    canvas.attr('height', height);
    const context = canvas.node().getContext('2d');
    //const custom = base.append('custom');

    return {
      context,
      //ncustom
    };
  },

  getDimensions(id) {
    const element = document.getElementById(id);
    const { width, height } = element.getBoundingClientRect();

    return {
      width,
      height
    };
  },

  updatePositions() {
    for (let d of this.circles) {
      d.x = d.x + this.radius + this.textLabelGutter;
      d.y = d.y + this.radius + this.textLabelGutter;
    }
    for (let d of this.lines) {
      d.x1 = d.source.x;
      d.y1 = d.source.y;
      d.x2 = d.target.x;
      d.y2 = d.target.y;
    }
  },

  drawOnCanvas() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.save();
    this.drawNodes();
    this.drawLabels();
    this.drawLinks();
    this.context.restore();
  },

  drawNodes() {
    for (let d of this.circles) {
      this.context.beginPath();
      this.context.moveTo(d.x, d.y);
      this.context.arc(d.x, d.y, 4.5, 0, 2 * Math.PI);
      if (d.firstParty) {
        this.context.fillStyle = 'red';
      } else {
        this.context.fillStyle = 'blue';
      }
      this.context.closePath();
      this.context.fill();
    }
  },

  drawLabels() {
    this.context.fillStyle = 'white';
    this.context.beginPath();
    for (let d of this.labels) {
      this.context.fillText(d.hostname, d.x, d.y);
    }
    this.context.closePath();
    this.context.fill();
  },

  showLabel(index) {
    const label = d3.select(`text.textLabel.text${index}`);
    label.attr('class', `textLabel text${index} visible`);
  },

  hideLabel(index) {
    const label = d3.select(`text.textLabel.text${index}`);
    label.attr('class', `textLabel text${index} invisible`);
  },

  drawLinks() {
    this.context.beginPath();
    for (let d of this.lines) {
      this.context.moveTo(d.source.x, d.source.y);
      this.context.lineTo(d.target.x, d.target.y);
    }
    this.context.closePath();
    this.context.strokeStyle = '#ccc';
    this.context.stroke();
  },

  virtualDom(type, elements) {
     this[type] = elements;
   // this[type] = this[type].data(elements, (d) => d);

   // this[type].exit().remove();
/*
    let newNodes = this[type].enter();
    newNodes = newNodes.append('custom');
    newNodes.classed(type, true);

    this[type] = newNodes.merge(this[type]);
*/
  },

  createVirtualDom(nodes, links) {
    this.virtualDom('labels', nodes);
    this.virtualDom('lines', links);
    this.virtualDom('circles', nodes);
  },

  draw(nodes, links) {
    this.simulate(nodes, links);
    this.createVirtualDom(nodes, links);
    this.drawOnCanvas();
    this.simulate(nodes, links);
  }
};
