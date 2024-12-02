import BattleScene from "#app/battle-scene";
import { BattlerIndex } from "#app/battle";
import { Command } from "#app/ui/command-ui-handler";
import { Mode } from "#app/ui/ui";
import { CommandPhase } from "./command-phase";
import { PokemonPhase } from "./pokemon-phase";
import * as LoggerTools from "../logger";
import i18next from "#app/plugins/i18n";
import { allMoves } from "#app/data/move";

export class SelectTargetPhase extends PokemonPhase {
  constructor(scene: BattleScene, fieldIndex: integer) {
    super(scene, fieldIndex);
  }

  start() {
    super.start();

    const turnCommand = this.scene.currentBattle.turnCommands[this.fieldIndex];
    const move = turnCommand?.move?.move;
    this.scene.ui.setMode(Mode.TARGET_SELECT, this.fieldIndex, move, (targets: BattlerIndex[]) => {
      this.scene.ui.setMode(Mode.MESSAGE);
      const fieldSide = this.scene.getField();
      const user = fieldSide[this.fieldIndex];
      const moveObject = allMoves[move!];
      // Reject player's target selection
      if (moveObject && user.isMoveTargetRestricted(moveObject.id, user, fieldSide[targets[0]])) {
        const errorMessage = user.getRestrictingTag(move!, user, fieldSide[targets[0]])!.selectionDeniedText(user, moveObject.id);
        user.scene.queueMessage(i18next.t(errorMessage, { moveName: moveObject.name }), 0, true);
        targets = [];
      }
      // Cancel this action
      if (targets.length < 1) {
        this.scene.currentBattle.turnCommands[this.fieldIndex] = null;
        LoggerTools.Actions[this.fieldIndex] = "";
        this.scene.unshiftPhase(new CommandPhase(this.scene, this.fieldIndex));
      } else {
        turnCommand!.targets = targets; //TODO: is the bang correct here?
        if (targets.length == 1) {
          switch (targets[0]) {
            case 0:
            case 1:
              // Specify clearly that you target your own pokemon
              LoggerTools.Actions[this.fieldIndex] += ` ${fieldSide[this.fieldIndex]}`;
              break;
            case 2:
              // Just specify L or R
              LoggerTools.Actions[this.fieldIndex] += ` L`;
              break;
            case 3:
              // Just specify L or R
              LoggerTools.Actions[this.fieldIndex] += ` R`;
              break;
          }
        }
      }
      if (turnCommand?.command === Command.BALL && this.fieldIndex) {
        this.scene.currentBattle.turnCommands[this.fieldIndex - 1]!.skip = true; //TODO: is the bang correct here?
      }
      this.end();
    });
  }
}
