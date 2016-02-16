requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.mozRequestAnimationFrame;

var Engine = {
  lastTick: undefined,

  init: function(world) {
    Engine.world = world;

    Engine.world.init();
    View.init(window.innerWidth, window.innerHeight);
    AssetFactory.init();
    InputObserver.init(window, Engine.callbacks);
  },

  start: function() {
    Engine.changeState(States.PlayState);
    Engine.main();
  },

  main: function() {
    var tick = Date.now();
    var dt = Engine.lastTick ? (tick - Engine.lastTick) / 1000 : 0;
    Engine.lastTick = tick;

    Engine.handleKeyboardInput();
    Engine.update(dt);
    Engine.render();

    requestAnimationFrame(Engine.main);
  },

  update: function(dt) {
    Engine.state.update(Engine, dt);
  },

  render: function() {
    View.resizeCanvas(window.innerWidth, window.innerHeight);
    View.clear();
    Engine.state.render(Engine);
  },

  handleKeyboardInput: function() {
    Engine.state.handleKeyboardInput(Engine);
  },

  changeState: function(newState) {
    if (Engine.state) {
      Engine.state.end();
    }

    newState.init();
    newState.start();
    Engine.state = newState;
  },

  callbacks: {
    mouseDown: function(message) {
      Engine.state.onMouseDown(Engine, message);
    },

    mouseUp: function(message) {
      Engine.state.onMouseUp(Engine, message);
    },

    mouseMove: function(message) {
      Engine.state.onMouseMove(Engine, message)
    },
  }
};
