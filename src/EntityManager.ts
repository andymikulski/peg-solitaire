export default class EntityManager {
  active: any[] = [];

  add(ent: any) {
    this.active.push(ent);
  }

  getEntitiesAtCoord(x: number, y: number) {
    return this.active.filter(ent => ent.position[0] === x && ent.position[1] === y);
  }
}