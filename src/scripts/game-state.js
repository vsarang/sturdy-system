function GameState(attrs) {
  if (!attrs.hasOwnProperty('end')
      || !attrs.hasOwnProperty('handleKeyboardInput')
      || !attrs.hasOwnProperty('init')
      || !attrs.hasOwnProperty('start')
      || !attrs.hasOwnProperty('update')
      || !attrs.hasOwnProperty('render')
      || !attrs.hasOwnProperty('onMouseDown')
      || !attrs.hasOwnProperty('onMouseUp')
      || !attrs.hasOwnProperty('onMouseMove')) {
    throw "Missing attributes";
  }

  for (attr in attrs) {
    this[attr] = attrs[attr];
  }
}

var PlayState = new GameState({
  init: function(engine) {
    PlayState.cameraPos = new Vector2(0, 0);
    PlayState.prevDragPos = undefined;
    PlayState.selectedMinions = [];
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
      // move entity towards destination
      if (minion.curTask < minion.tasks.length) {
        var taskPath = minion.tasks[minion.curTask].dest.minus(minion.pos);
        var taskDistance = taskPath.magnitude();
        if (minion.range < taskDistance) {
          minion.pos.add(taskPath.dividedBy(taskDistance).times(minion.velocity).times(dt));
        } else {
          minion.curTask += 1;
        }
      }

      // correct path for collisions
      var pathCorrection = new Vector2(0, 0);
      var collisions = 0;
      world.minions.forEach(function(other) {
        if (minion === other) return;
        var difference = minion.pos.minus(other.pos);
        var magSquare = difference.magSquare();
        if (magSquare === 0) {
          difference = new Vector2(Math.random(), Math.random());
        }
        var minSeparation = (minion.radius + other.radius) * 2;
        if (magSquare < (minSeparation * minSeparation)) {
          pathCorrection.add(difference.normalize().times(minSeparation));
          collisions += 1;
        }
      });
      if (collisions) {
        minion.pos.add(pathCorrection.times(dt));
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
      View.renderCircle(minion.pos.minus(PlayState.cameraPos),
        minion.radius * 1.5, '#aaaaaa');
    });

    world.minions.forEach(function(minion) {
      AssetFactory.loadSprite('../images/minion.png', function(sprite) {
        View.renderSprite(sprite, minion.pos.minus(PlayState.cameraPos)
          .minus(new Vector2(minion.radius, minion.radius)));
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

var States = {
  PlayState: PlayState
};
