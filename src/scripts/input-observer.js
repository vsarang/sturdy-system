var InputObserver = {
  init: function(target, callbacks) {
    InputObserver.state = {
      keysDown: {}
    };

    InputObserver.observers = {
      mouseDown: callbacks.mouseDown,
      mouseUp: callbacks.mouseUp,
      mouseMove: callbacks.mouseMove
    };

    target.addEventListener('keydown', InputObserver.callbacks.keyDownEvent);
    target.addEventListener('keyup', InputObserver.callbacks.keyUpEvent);

    target.addEventListener('mousedown', InputObserver.callbacks.mouseDownEvent);
    target.addEventListener('mouseup', InputObserver.callbacks.mouseUpEvent);
    target.addEventListener('mousemove', InputObserver.callbacks.mouseMoveEvent);
  },

  keyDown: function(keyCode) {
    return InputObserver.state.keysDown[keyCode];
  },

  notify: function(observer, message) {
    observer(message);
  },

  callbacks: {
    createMessage: function(mouseEvent) {
      return {
        button: mouseEvent.button,
        offset: new Vector2(mouseEvent.clientX, mouseEvent.clientY)
      };
    },

    keyDownEvent: function(keyEvent) {
      InputObserver.state.keysDown[keyEvent.keyCode] = true;
    },

    keyUpEvent: function(keyEvent) {
      InputObserver.state.keysDown[keyEvent.keyCode] = false;
    },

    mouseDownEvent: function(mouseEvent) {
      InputObserver.notify(InputObserver.observers.mouseDown,
          InputObserver.callbacks.createMessage(mouseEvent));
    },

    mouseUpEvent: function(mouseEvent) {
      InputObserver.notify(InputObserver.observers.mouseUp,
          InputObserver.callbacks.createMessage(mouseEvent));
    },

    mouseMoveEvent: function(mouseEvent) {
      InputObserver.notify(InputObserver.observers.mouseMove,
          InputObserver.callbacks.createMessage(mouseEvent));
    },
  }
};
