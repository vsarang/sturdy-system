function Minion(spawnLocation) {
  this.type = Constants.EntityTypes.ACTOR;
  this.cooldown = 1;
  this.curTask = 0;
  this.health = 100;
  this.lastUsed = Date.now();
  this.pos = spawnLocation;
  this.dim = new Vector2(0.1, 0.1);
  this.radius = 0.05;
  this.range = 1;
  this.tasks = [];
  this.velocity = 1;
}
