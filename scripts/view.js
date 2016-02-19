var View = {
  init: function(width, height) {
    View.canvas = document.createElement('canvas');
    View.canvas.width = width;
    View.canvas.height = height;
    View.context = View.canvas.getContext('2d');
    View.dim = new Vector2(width, height);

    document.body.appendChild(View.canvas);
  },

  clear: function() {
    View.context.fillStyle = 'black';
    View.context.fillRect(0, 0, View.canvas.width, View.canvas.height);
  },

  renderSprite: function(sprite, offset, dim, version) {
    if (!dim) {
      View.context.drawImage(sprite, offset.x, offset.y);
    } else {
      View.context.drawImage(sprite,
          version * dim.x, 0, dim.x, dim.y,
          offset.x - dim.x / 2, offset.y, dim.x, dim.y);
    }
  },

  renderRectangle(offset, dim, color) {
    View.context.strokeStyle = color;
    View.context.beginPath();
    View.context.rect(offset.x, offset.y, dim.x, dim.y);
    View.context.stroke();
  },

  renderCircle(offset, radius, color) {
    View.context.strokeStyle = color;
    View.context.beginPath();
    View.context.arc(offset.x, offset.y, radius, 0, 2 * Math.PI);
    View.context.stroke();
  },

  renderPath(path, color) {
    View.context.strokeStyle = color;
    View.context.beginPath();

    View.context.moveTo(path[0].x, path[0].y);
    for (var i = 1; i < path.length; i++) {
      View.context.lineTo(path[i].x, path[i].y);
    }

    View.context.stroke();
  },

  resizeCanvas: function(width, height) {
    View.canvas.width = width;
    View.canvas.height = height;
    View.dim = new Vector2(width, height);
  }
};
