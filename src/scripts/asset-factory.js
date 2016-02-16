var AssetFactory = {
  init: function() {
    AssetFactory.assets = {
      sprites: {}
    };
  },
  
  loadSprite: function(path, callback) {
    if (AssetFactory.assets.sprites[path]) {
      callback(AssetFactory.assets.sprites[path]);
    } else {
      var sprite = new Image();
      sprite.onload = function() {
        AssetFactory.assets.sprites[path] = sprite;
        callback(sprite);
      }
      sprite.src = path;
    }
  }
};
