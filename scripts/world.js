var World = {
  buildings: [],
  dim: new Vector2(100, 100),
  minions: [],
  tasks: [],
  grid: [],

  init: function() {
    for (var i = 0; i < 100; i++) {
      World.minions.push(new Minion(new Vector2(i, i)));
    }

    for (var i = 0; i < World.dim.x; i++) {
      World.grid.push([]);
      for (var j = 0; j < World.dim.y; j++) {
        World.grid[i].push({
          type: Constants.GRASS_TILE,
          version: Math.floor(Math.random() * 4)
        });
      }
    }
  },
};
