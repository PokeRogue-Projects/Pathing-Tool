import BattleScene from "#app/battle-scene";
import { BattleStyle } from "#app/enums/battle-style";
import { BattlerTagType } from "#app/enums/battler-tag-type";
import { getPokemonNameWithAffix } from "#app/messages";
import { Mode } from "#app/ui/ui";
import i18next from "i18next";
import { BattlePhase } from "./battle-phase";
import { PostSummonPhase } from "./post-summon-phase";
import { SummonMissingPhase } from "./summon-missing-phase";
import { SwitchPhase } from "./switch-phase";
import { getNatureName } from "#app/data/nature";
import * as LoggerTools from "../logger";
import { SwitchType } from "#enums/switch-type";

export class CheckSwitchPhase extends BattlePhase {
  protected fieldIndex: integer;
  protected useName: boolean;

  constructor(scene: BattleScene, fieldIndex: integer, useName: boolean) {
    super(scene);

    this.fieldIndex = fieldIndex;
    this.useName = useName;
  }

  start() {
    super.start();

    const pokemon = this.scene.getPlayerField()[this.fieldIndex];

    // End this phase early...

    // ...if the user is playing in Set Mode
    if (this.scene.battleStyle === BattleStyle.SET) {
      return super.end();
    }

    // ...if the checked Pokemon is somehow not on the field
    if (this.scene.field.getAll().indexOf(pokemon) === -1) {
      this.scene.unshiftPhase(new SummonMissingPhase(this.scene, this.fieldIndex));
      return super.end();
    }

    // ...if there are no other allowed Pokemon in the player's party to switch with
    if (!this.scene.getPlayerParty().slice(1).filter(p => p.isActive()).length) {
      return super.end();
    }

    // ...or if any player Pokemon has an effect that prevents the checked Pokemon from switching
    if (pokemon.getTag(BattlerTagType.FRENZY)
        || pokemon.isTrapped()
        || this.scene.getPlayerField().some(p => p.getTag(BattlerTagType.COMMANDED))) {
      return super.end();
    }

    for (var i = 0; i < this.scene.getEnemyField().length; i++) {
      var pk = this.scene.getEnemyField()[i]
      var maxIVs: string[] = []
      var ivnames = ["HP", "Atk", "Def", "Sp.Atk", "Sp.Def", "Speed"]
      pk.ivs.forEach((iv, j) => {
if (iv == 31) maxIVs.push(ivnames[j])
})
      var ivDesc = maxIVs.join(",")
      if (ivDesc == "") {
        ivDesc = "No Max IVs"
      } else {
        ivDesc = "31iv: " + ivDesc
      }
      pk.getBattleInfo().flyoutMenu.toggleFlyout(true)
      pk.getBattleInfo().flyoutMenu.flyoutText[0].text = getNatureName(pk.nature)
      pk.getBattleInfo().flyoutMenu.flyoutText[1].text = ivDesc
      pk.getBattleInfo().flyoutMenu.flyoutText[2].text = pk.getAbility().name
      pk.getBattleInfo().flyoutMenu.flyoutText[3].text = pk.getPassiveAbility().name
      if (pk.abilityIndex == 2) { // Hidden Ability
        pk.getBattleInfo().flyoutMenu.flyoutText[2].setColor("#e8e8a8")
        pk.getBattleInfo().flyoutMenu.flyoutText[2].text += " (HA)"
      }
    }

    this.scene.ui.showText(i18next.t("battle:switchQuestion", { pokemonName: this.useName ? getPokemonNameWithAffix(pokemon) : i18next.t("battle:pokemon") }), null, () => {
      this.scene.ui.setMode(Mode.CONFIRM, () => {
        // Yes, I want to Pre-Switch
        this.scene.ui.setMode(Mode.MESSAGE);
        this.scene.tryRemovePhase(p => p instanceof PostSummonPhase && p.player && p.fieldIndex === this.fieldIndex);
        this.scene.unshiftPhase(new SwitchPhase(this.scene, SwitchType.INITIAL_SWITCH, this.fieldIndex, false, true));
        for (var i = 0; i < this.scene.getEnemyField().length; i++) {
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.toggleFlyout(false)
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[0].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[1].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[2].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[3].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[2].setColor("#f8f8f8")
          this.scene.getEnemyField()[i].flyout.setText()
        }
        //this.scene.pokemonInfoContainer.hide()
        this.end();
      }, () => {
        // No, I want to leave my Pokémon as is
        this.scene.ui.setMode(Mode.MESSAGE);
        for (var i = 0; i < this.scene.getEnemyField().length; i++) {
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.toggleFlyout(false)
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[0].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[1].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[2].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[3].text = "???"
          this.scene.getEnemyField()[i].getBattleInfo().flyoutMenu.flyoutText[2].setColor("#f8f8f8")
        }
        //this.scene.pokemonInfoContainer.hide()
        this.end();
      });
    });
  }
}
