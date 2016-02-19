function Minion(spawnLocation) {
  this.cooldown = 1;
  this.curTask = 0;
  this.health = 100;
  this.lastUsed = Date.now();
  this.pos = spawnLocation;
  this.dim = new Vector2(0.25, 0.25);
  this.radius = 0.05;
  this.range = 1;
  this.tasks = [];
  this.velocity = 1;
}
