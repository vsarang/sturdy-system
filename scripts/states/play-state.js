var PlayState = new GameState({
  init: function(engine) {
    PlayState.cameraPos = new Vector2(0, 0);
    PlayState.prevDragPos = undefined;
    PlayState.selectedMinions = [];
    PlayState.collisionTree =
      new CollisionTree(new Vector2(0, 0), engine.world.dim.times(Constants.TILE_SIZE), 5, 50);
  },

  start: function() {
  },

  end: function() {
  },

  handleKeyboardInput: function() {},

  update: function(engine, dt) {
    PlayState.updateWorld(engine.world, dt);
  },

  updateCollisionTree: function(world) {
    var tree = PlayState.collisionTree;
    tree.removeLayer();
    world.minions.forEach(function(minion) {
      tree.addObject(minion);
    });
  },

  updateWorld: function(world, dt) {
    //PlayState.updateCollisionTree(world);
    //PlayState.moveMinions(world, dt);
    //PlayState.respondToCollisions(world);
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

  render: function(engine) {
    PlayState.renderWorld(engine);
    //PlayState.renderMinions(engine);
    //PlayState.renderOverlay(engine);
  },

  renderWorld: function(engine) {
    var xMin = PlayState.getGridPos(new Vector2(0, 0)).x;
    var xMax = PlayState.getGridPos(new Vector2(engine.view.dim)).x + 1;
    var yMin = PlayState.getGridPos(new Vector2(engine.view.dim.x, 0)).y;
    var yMax = PlayState.getGridPos(new Vector2(0, engine.view.dim.y)).y + 1;

    var worldDim = engine.world.dim;
    var gridBounds = [
      new Vector2(Math.max(0, xMin), Math.max(0, yMin)),
      new Vector2(Math.min(worldDim.x - 1, xMax), Math.min(worldDim.y - 1, yMax))
    ];

    for (var j = gridBounds[0].y; j < gridBounds[1].y; j++) {
      for (var i = gridBounds[0].x; i < gridBounds[1].x; i++) {
        AssetFactory.loadSprite('images/plains_tiles.png', function(tile) {
          var gridPos = new Vector2(i, j);
          engine.view.renderSprite(tile, PlayState.getViewOffset(gridPos),
              Constants.TILE_DIM, engine.world.grid[i][j].version);
        });
      }
    }
  },

  renderMinions: function(world) {
    PlayState.selectedMinions.forEach(function(minion) {
      View.renderCircle(minion.pos.plus(minion.dim.times(1/2)).minus(PlayState.cameraPos),
        Math.max(minion.dim.x, minion.dim.y) * 1.5, '#aaaaaa');
    });

    world.minions.forEach(function(minion) {
      AssetFactory.loadSprite('images/minion.png', function(sprite) {
        View.renderSprite(sprite, minion.pos.minus(PlayState.cameraPos));
      });
    });
  },

  renderOverlay: function() {
    if (PlayState.boundingRect.startPos) {
      View.renderRectangle(
        PlayState.getViewOffset(PlayState.boundingRect.startPos),
        PlayState.boundingRect.mousePos.minus(PlayState.boundingRect.startPos),
        '#ffffff');
    }
  },

  onMouseDown: function(engine, message) {
    switch (message.button) {
      case 0:
        // set start point for unit select rectangle
        PlayState.boundingRect.init(PlayState.getWorldPos(message.offset));
        break;
      case 1:
        // start dragging camera
        PlayState.prevDragPos = new Vector2(message.offset);
        break;
      case 2:
        // add task to selected minions
        PlayState.addTask(engine.world, PlayState.getWorldPos(message.offset));
        break;
      default:
    }
  },

  onMouseUp: function(engine, message) {
    switch (message.button) {
      case 0:
        // select units
        //PlayState.selectUnitsInBoundingRect(engine.world);
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
          PlayState.boundingRect.mousePos = PlayState.getWorldPos(message.offset);
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
      if (start.x <= minion.pos.x && minion.pos.x <= end.x
        && start.y <= minion.pos.y && minion.pos.y <= end.y) {
        PlayState.selectedMinions.push(minion);
      }
    });
    PlayState.boundingRect.destroy();
  },

  getGridPos: function(offset) {
    offset = offset.plus(PlayState.cameraPos);
    var gridPos = new Vector2();
    gridPos.x = Math.floor(offset.x / Constants.TILE_DIM.x + offset.y / Constants.TILE_DIM.y);
    gridPos.y = Math.floor(offset.y / Constants.TILE_DIM.y - offset.x / Constants.TILE_DIM.x);
    return gridPos;
  },

  getViewOffset: function(gridPos) {
    var viewOffset = new Vector2();
    viewOffset.x = (gridPos.x - gridPos.y - 1) * (Constants.TILE_DIM.x / 2);
    viewOffset.y = (gridPos.x + gridPos.y) * (Constants.TILE_DIM.y / 2);
    return viewOffset.minus(PlayState.cameraPos);
  }
});
