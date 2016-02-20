function Development(type, pos, radius) {
  var diameter = radius * 2;
  this.type = type;
  this.pos = pos;
  this.dim = new Vector2(diameter, diameter);
  this.radius = radius;
  this.version = Math.floor(Math.random() * 2);
}
