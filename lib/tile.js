function Tile(type) {
  this.type = type;
  this.version = Math.floor(Math.random() * 4);
  this.entities = [];
}

Tile.prototype.addEntity = function(entity) {
  var i;
  for (i = 0; i < this.entities.length; i++) {
    if ((entity.pos.x + entity.pos.y) < (this.entities[i].pos.x + this.entities[i].pos.y)) {
      break;
    }
  }
  this.entities.splice(i, 0, entity);
}

Tile.prototype.removeEntity = function(entity) {
  var i;
  for (i = 0; i < this.entities.length; i++) {
    if (entity === this.entities[i]) {
      break;
    }
  }
  this.entities.splice(i, 1);
}
