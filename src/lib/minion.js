function Minion(spawnLocation) {
  this.cooldown = 1;
  this.curTask = 0;
  this.health = 100;
  this.lastUsed = Date.now();
  this.pos = spawnLocation;
  this.dim = new Vector2(8, 8);
  this.radius = 4;
  this.range = 16;
  this.tasks = [];
  this.velocity = 100;
}
