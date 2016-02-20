var PlayState = new GameState({
  init: function(engine) {
    PlayState.cameraPos = new Vector2(engine.view.canvas.width / -2, 300);
    PlayState.prevDragPos = undefined;
    PlayState.selectedMinions = [];
    PlayState.collisionTree =
      new CollisionTree(new Vector2(0, 0), engine.world.dim, 5, 50);
  },

  start: function() {
  },

  end: function() {
  },

  handleKeyboardInput: function() {},

  update: function(engine, dt) {
    PlayState.updateWorld(engine.world, dt);
  },

  updateWorld: function(world, dt) {
    world.minions.forEach(function(minion) {
      world.removeEntityFromGrid(minion);
    });
    PlayState.moveMinions(world, dt);
    PlayState.updateCollisionTree(world);
    PlayState.respondToCollisions(world);
    world.minions.forEach(function(minion) {
      world.addEntityToGrid(minion);
    });
  },

  render: function(engine) {
    var xMin = PlayState.getGridPos(new Vector2(0, 0)).x;
    var xMax = PlayState.getGridPos(new Vector2(engine.view.dim)).x + 1;
    var yMin = PlayState.getGridPos(new Vector2(engine.view.dim.x, 0)).y;
    var yMax = PlayState.getGridPos(new Vector2(0, engine.view.dim.y)).y + 1;

    var gridBounds = [
      new Vector2(Math.max(0, xMin), Math.max(0, yMin)),
      new Vector2(Math.min(engine.world.dim.x - 1, xMax), Math.min(engine.world.dim.y - 1, yMax))
    ];

    PlayState.renderWorld(engine.world, engine.view, gridBounds);
    PlayState.renderEntities(engine.world, engine.view, gridBounds);
    PlayState.renderOverlay(engine.view);
  },

  updateCollisionTree: function(world) {
    var tree = PlayState.collisionTree;
    tree.reset();
    world.minions.forEach(function(minion) {
      tree.addObject(minion);
    });
    for (var i = 0; i < world.grid.length; i++) {
      for (var j = 0; j < world.grid[0].length; j++) {
        world.grid[i][j].entities.forEach(function(entity) {
          tree.addObject(entity);
        });
      }
    }
  },

  moveMinions: function(world, dt) {
    world.minions.forEach(function(minion) {
      if (minion.curTask < minion.tasks.length) {
        var taskPath = minion.tasks[minion.curTask].dest.minus(minion.pos);
        var taskDistance = taskPath.magnitude();
        var minionPath = taskPath.normalize().times(minion.velocity * dt);
        minion.pos.add(minionPath);
        if (taskDistance <= minion.range) {
          minion.curTask += 1;
        }
      }
    });
  },

  respondToCollisions: function(world) {
    world.minions.forEach(function(minion) {
      var collidableObjects = PlayState.collisionTree.getObjects(minion);
      var correction = new Vector2(0, 0);
      var collisions = 0;
      collidableObjects.forEach(function(object) {
        if (object === minion) return;
        var diff = minion.pos.minus(object.pos);
        var dist = diff.magnitude();
        var min = minion.radius + object.radius;
        if (dist < min) {
          correction.add(diff.normalize().times(min - dist));
          collisions += 1;
        }
      });

      if (collisions) {
        correction = correction.times(1 / collisions);
        minion.pos.add(correction);
      }
    });
  },

  renderWorld: function(world, view, gridBounds) {
    for (var j = gridBounds[0].y; j < gridBounds[1].y; j++) {
      for (var i = gridBounds[0].x; i < gridBounds[1].x; i++) {
        AssetFactory.loadSprite('images/plains_tiles.png', function(sprite) {
          var gridPos = new Vector2(i, j);
          view.renderSprite(sprite, PlayState.getViewOffset(gridPos),
              Constants.TILE_DIM, world.grid[i][j].version);
        });
      }
    }
  },

  renderEntities: function(world, view, gridBounds) {
    for (var j = gridBounds[0].y; j < gridBounds[1].y; j++) {
      for (var i = gridBounds[0].x; i < gridBounds[1].x; i++) {
        world.grid[i][j].entities.forEach(function(entity) {
          switch (entity.type) {
            case Constants.EntityTypes.TREE:
              AssetFactory.loadSprite('images/tree_devs.png', function(sprite) {
                view.renderSprite(sprite, PlayState.getViewOffset(entity.pos).plus(new Vector2(0, -25)),
                    new Vector2(32, 32), entity.version);
              });
              break;
            case Constants.EntityTypes.ACTOR:
              AssetFactory.loadSprite('images/minion.png', function(sprite) {
                view.renderSprite(sprite, PlayState.getViewOffset(entity.pos));
              });
              break;
            default:
          }
        });
      }
    }
  },

  renderOverlay: function(view) {
    if (PlayState.boundingRect.mousePos) {
      var start = PlayState.boundingRect.startPos;
      var dim = PlayState.boundingRect.mousePos.minus(start);
      var path = [
        start,
        start.plus(new Vector2(dim.x, 0)),
        start.plus(dim),
        start.plus(new Vector2(0, dim.y)),
        start
      ];
      view.renderPath(path, '#ffffff');
    }
  },

  onMouseDown: function(engine, message) {
    switch (message.button) {
      case 0:
        // set start point for unit select rectangle
        PlayState.boundingRect.init(message.offset);
        break;
      case 1:
        // start dragging camera
        PlayState.prevDragPos = new Vector2(message.offset);
        break;
      case 2:
        // add task to selected minions
        PlayState.addTask(engine.world, PlayState.getGridPos(message.offset, true));
        break;
      default:
    }
  },

  onMouseUp: function(engine, message) {
    switch (message.button) {
      case 0:
        // select units
        PlayState.selectUnitsInBoundingRect(engine.world);
        break;
      case 1:
        // stop dragging camera
        PlayState.prevDragPos = undefined;
        break;
      default:
    }
  },

  onMouseMove: function(engine, message) {
    switch(message.button) {
      case 0:
        if (PlayState.boundingRect.startPos) {
          PlayState.boundingRect.mousePos = message.offset;
        }
        break;
      case 1:
        if (PlayState.prevDragPos) {
          PlayState.cameraPos.subtract(message.offset.minus(PlayState.prevDragPos));
          PlayState.prevDragPos = message.offset;
        }
        break;
      default:
    }
  },

  addTask: function(world, dest) {
    PlayState.selectedMinions.forEach(function(minion) {
      if (InputObserver.keyDown(16)) {
        minion.tasks.push(new Task(dest));
      } else {
        minion.tasks = [new Task(dest)];
        minion.curTask = 0;
      }
    });
  },

  boundingRect: {
    init: function(pos) {
      PlayState.boundingRect.startPos = pos;
      PlayState.boundingRect.mousePos = pos;
    },
    destroy: function() {
      delete PlayState.boundingRect.startPos;
      delete PlayState.boundingRect.mousePos;
    }
  },

  selectUnitsInBoundingRect: function(world) {
    var start = new Vector2(Math.min(PlayState.boundingRect.startPos.x, PlayState.boundingRect.mousePos.x),
      Math.min(PlayState.boundingRect.startPos.y, PlayState.boundingRect.mousePos.y));
    var end = new Vector2(Math.max(PlayState.boundingRect.startPos.x, PlayState.boundingRect.mousePos.x),
      Math.max(PlayState.boundingRect.startPos.y, PlayState.boundingRect.mousePos.y));

    PlayState.selectedMinions = [];
    world.minions.forEach(function(minion) {
      var viewPos = PlayState.getViewOffset(minion.pos);
      if (start.x <= viewPos.x && viewPos.x <= end.x
        && start.y <= viewPos.y && viewPos.y <= end.y) {
        PlayState.selectedMinions.push(minion);
      }
    });
    PlayState.boundingRect.destroy();
  },

  getGridPos: function(offset, cont) {
    offset = offset.plus(PlayState.cameraPos);
    var gridPos = new Vector2();
    gridPos.x = offset.x / Constants.TILE_DIM.x + offset.y / Constants.TILE_DIM.y;
    gridPos.y = offset.y / Constants.TILE_DIM.y - offset.x / Constants.TILE_DIM.x;
    if (!cont) {
      gridPos.x = Math.floor(gridPos.x);
      gridPos.y = Math.floor(gridPos.y);
    }
    return gridPos;
  },

  getViewOffset: function(gridPos) {
    var viewOffset = new Vector2();
    viewOffset.x = (gridPos.x - gridPos.y) * (Constants.TILE_DIM.x / 2);
    viewOffset.y = (gridPos.x + gridPos.y) * (Constants.TILE_DIM.y / 2);
    return viewOffset.minus(PlayState.cameraPos);
  }
});
