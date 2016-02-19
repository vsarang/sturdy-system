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

Vector2.prototype.dot = function() {
  return (this.x * this.x) + (this.y * this.y);
}

Vector2.prototype.magnitude = function() {
  return Math.sqrt(this.dot());
}

Vector2.prototype.normalize = function() {
  var mag = this.magnitude();
  return mag ? this.times(1 / mag) : new Vector2(0, 0);
}

Vector2.prototype.proj = function(other) {
  return other.times(this.dot(other) / other.dot(other));
}
