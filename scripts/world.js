var World = {
  buildings: [],
  dim: new Vector2(40, 40),
  minions: [],
  tasks: [],
  grid: [],

  init: function() {
    World.regenWorld();
    World.populate();
  },

  populate: function() {
    for (var i = 0; i < 300; i++) {
      World.minions.push(new Minion(new Vector2(3 + i * 0.1, 3)));
    }
    for (var i = 0; i < 300; i++) {
      World.minions.push(new Minion(new Vector2(3 + i * 0.1, 3)));
    }
    for (var i = 0; i < 300; i++) {
      World.minions.push(new Minion(new Vector2(3 + i * 0.1, 3)));
    }
    for (var i = 0; i < 300; i++) {
      World.minions.push(new Minion(new Vector2(3 + i * 0.1, 3)));
    }
    for (var i = 0; i < 300; i++) {
      World.minions.push(new Minion(new Vector2(3 + i * 0.1, 3)));
    }
  },

  regenWorld: function() {
    World.grid = [];
    for (var i = 0; i < World.dim.x; i++) {
      World.grid.push([]);
      for (var j = 0; j < World.dim.y; j++) {
        World.grid[i].push(new Tile(Constants.TileTypes.GRASS));
      }
    }

    World.genForest(new Vector2(20, 20));
  },

  genForest: function(start) {
    var offset = start;
    var grow = true;
    while (grow) {
      offset = offset.plus(new Vector2(3 * (0.5 - Math.random()), 3 * (0.5 - Math.random())));
      var dev = new Development(Constants.EntityTypes.TREE, offset, 0.125);
      World.addEntityToGrid(dev);
      grow = Math.random() > 0.01;
    }
  },

  addEntityToGrid: function(entity) {
    if (World.inWorld(entity.pos, entity.dim)) {
      var gridX = Math.floor(entity.pos.x);
      var gridY = Math.floor(entity.pos.y);
      World.grid[gridX][gridY].addEntity(entity);
    }
  },

  removeEntityFromGrid: function(entity) {
    if (World.inWorld(entity.pos, entity.dim)) {
      var gridX = Math.floor(entity.pos.x);
      var gridY = Math.floor(entity.pos.y);
      World.grid[gridX][gridY].removeEntity(entity);
    }
  },

  inWorld: function(pos, dim) {
    return pos.x > 0 && pos.y > 0 && (pos.x + dim.x) < World.dim.x && (pos.y + dim.y) < World.dim.y;
  },
};
