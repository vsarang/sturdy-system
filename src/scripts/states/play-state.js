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
    PlayState.updateCollisionTree(world);
    PlayState.moveMinions(world, dt);
    PlayState.respondToCollisions(world);
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
    PlayState.renderWorld(engine.world);
    PlayState.renderMinions(engine.world);
    PlayState.renderOverlay(engine.world);
  },

  renderWorld: function(world) {
    var gridBounds = [
      new Vector2(
        Math.max(0, Math.floor(PlayState.cameraPos.x / Constants.TILE_SIZE)),
        Math.max(0, Math.floor(PlayState.cameraPos.y / Constants.TILE_SIZE))),
      new Vector2(
        Math.min(world.dim.x,
          Math.ceil((PlayState.cameraPos.x + View.canvas.width) / Constants.TILE_SIZE)),
        Math.min(world.dim.y,
          Math.ceil((PlayState.cameraPos.y + View.canvas.height) / Constants.TILE_SIZE)))
    ];

    for (var i = gridBounds[0].x; i < gridBounds[1].x; i++) {
      for (var j = gridBounds[0].y; j < gridBounds[1].y; j++) {
        AssetFactory.loadSprite('../images/grass_tiles.png', function(tile) {
          var tileDim = new Vector2(Constants.TILE_SIZE, Constants.TILE_SIZE);
          var pos = new Vector2(tileDim.x * i, tileDim.y * j);
          View.renderSprite(tile, PlayState.getViewOffset(pos), tileDim, world.grid[i][j].version);
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
      AssetFactory.loadSprite('../images/minion.png', function(sprite) {
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
          PlayState.boundingRect.mousePos = PlayState.getWorldPos(message.offset);
        }
        break;
      case 1:
        if (PlayState.prevDragPos) {
          PlayState.moveCamera(engine.world, message.offset.minus(PlayState.prevDragPos));
          PlayState.prevDragPos = message.offset;
        }
        break;
      default:
    }
  },

  moveCamera: function(world, vector) {
    PlayState.cameraPos.subtract(vector);
    var worldDim = world.dim.times(Constants.TILE_SIZE);

    if (worldDim.x < (PlayState.cameraPos.x + View.canvas.width)) {
      PlayState.cameraPos.x = worldDim.x - View.canvas.width;
    }
    if (worldDim.y < (PlayState.cameraPos.y + View.canvas.height)) {
      PlayState.cameraPos.y = worldDim.y - View.canvas.height;
    }
    if (PlayState.cameraPos.x < 0) {
      PlayState.cameraPos.x = 0;
    }
    if (PlayState.cameraPos.y < 0) {
      PlayState.cameraPos.y = 0;
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

  getWorldPos: function(viewPos) {
    return viewPos.plus(PlayState.cameraPos);
  },

  getViewOffset: function(worldPos) {
    return worldPos.minus(PlayState.cameraPos);
  }
});
