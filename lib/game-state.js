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
