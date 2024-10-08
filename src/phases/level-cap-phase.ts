import BattleScene from "#app/battle-scene";
import { Mode } from "#app/ui/ui";
import i18next from "i18next";
import { FieldPhase } from "./field-phase";
import * as LoggerTools from "../logger";

export class LevelCapPhase extends FieldPhase {
  constructor(scene: BattleScene) {
    super(scene);
  }

  start(): void {
    super.start();

    this.scene.ui.setMode(Mode.MESSAGE).then(() => {
      // Sound loaded into game as is
      this.scene.playSound("level_up_fanfare");
      this.scene.ui.showText(i18next.t("battle:levelCapUp", { levelCap: this.scene.getMaxExpLevel() }), null, () => this.end(), null, true);
      this.executeForAll(pokemon => pokemon.updateInfo(true));
    });
  }
}
