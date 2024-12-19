import { BattlePhase } from "./battle-phase";
import BattleScene from "#app/battle-scene.js";

export class NewBattlePhase extends BattlePhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start() {
    super.start();

    this.scene.newBattle();

    this.end();
  }
}
