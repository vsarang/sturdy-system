function Minion(spawnLocation) {
  this.cooldown = 1;
  this.curTask = 0;
  this.health = 100;
  this.lastUsed = Date.now();
  this.pos = spawnLocation;
  this.radius = 4;
  this.range = 16;
  this.selected = false;
  this.tasks = [];
  this.velocity = 100;
}

function Task(dest) {
  this.dest = dest;
}

function Tile(type, version) {
  this.type = type;
  this.version = version;
}

function Vector2() {
  if (arguments.length === 1) {
    var other = arguments[0];
    this.x = other.x;
    this.y = other.y;
  } else {
    this.x = arguments[0];
    this.y = arguments[1];
  }
}

Vector2.prototype.add = function(other) {
  this.x += other.x;
  this.y += other.y;
}

Vector2.prototype.subtract = function(other) {
  this.x -= other.x;
  this.y -= other.y;
}

Vector2.prototype.plus = function(other) {
  return new Vector2(this.x + other.x, this.y + other.y);
}

Vector2.prototype.minus = function(other) {
  return new Vector2(this.x - other.x, this.y - other.y);
}

Vector2.prototype.times = function(s) {
  return new Vector2(this.x * s, this.y * s);
}

Vector2.prototype.dividedBy = function(s) {
  if (s !== 0) {
    return new Vector2(this.x / s, this.y / s);
  } else {
    throw "Divide by zero";
  }
}

Vector2.prototype.magSquare = function() {
  return (this.x * this.x) + (this.y * this.y);
}

Vector2.prototype.magnitude = function() {
  return Math.sqrt(this.magSquare());
}

Vector2.prototype.normalize = function() {
  var mag = this.magnitude();
  return this.dividedBy(mag);
}
