function CollisionTree(pos, dim, maxLayer, maxObjects, parentNode) {
  this.children = undefined;
  this.dim = dim;
  this.lastLayer = true;
  this.maxLayer = maxLayer;
  this.maxObjects = maxObjects;
  this.objects = [];
  this.pos = pos;
  if (parentNode) {
    this.layer = parentNode.layer + 1;
    this.parentNode = parentNode;
  } else {
    this.layer = 0;
  }
}

CollisionTree.prototype.addObject = function(object) {
  var centerPos = this.pos.plus(this.dim.times(1 / 2));
  if (this.layer === this.maxLayer ||
      this.lastLayer && this.objects.length < this.maxObjects ||
      (object.pos.x < centerPos.x && centerPos.x < (object.pos.x + object.dim.x)) ||
      (object.pos.y < centerPos.y && centerPos.y < (object.pos.y + object.dim.y))) {
    this.objects.push(object);
  } else {
    if (this.lastLayer) {
      this.addLayer();
    }
    this.getChild(object.pos).addObject(object);
  }
}

CollisionTree.prototype.getObjects = function(object) {
  if (this.lastLayer) {
    return this.objects;
  }

  return this.objects.concat(this.getChild(object.pos).getObjects(object));
}

CollisionTree.prototype.getChild = function(pos) {
  for (var i = 0; i < this.children.length; i++) {
    var child = this.children[i];
    if (child.pos.x <= pos.x
        && child.pos.y <= pos.y
        && pos.x < (child.pos.x + child.dim.x)
        && pos.y < (child.pos.y + child.dim.y)) {
      return child;
    }
  }
}

CollisionTree.prototype.addLayer = function() {
  var centerPos = this.pos.plus(this.dim.times(1 / 2));
  var childDim = this.dim.times(1/2);
  this.children = [
    new CollisionTree(this.pos, childDim, this.maxLayer, this.maxObjects, this),
    new CollisionTree(new Vector2(centerPos.x, this.pos.y), childDim, this.maxLayer, this.maxObjects, this),
    new CollisionTree(new Vector2(this.pos.x, centerPos.y), childDim, this.maxLayer, this.maxObjects, this),
    new CollisionTree(centerPos, childDim, this.maxLayer, this.maxObjects, this)
  ];
  this.lastLayer = false;

  var objects = this.objects;
  this.objects = [];
  for (var i = 0; i < objects.length; i++) {
    this.addObject(objects[i]);
  }
}

CollisionTree.prototype.removeLayer = function() {
  this.children = undefined;
  this.lastLayer = true;
}

CollisionTree.prototype.reset = function() {
  this.removeLayer();
  this.objects = [];
}
