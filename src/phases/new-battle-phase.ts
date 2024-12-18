import { BattlePhase } from "./battle-phase";
import * as LoggerTools from "../logger";
import { Biome } from "#enums/biome";
import { biomeLinks } from "#app/data/balance/biomes";
import * as Utils from "#app/utils";
import { Gender } from "#app/data/gender.js";
import { Nature } from "#app/enums/nature.js";
import { getPokemonNameWithAffix } from "#app/messages.js";
import { SelectModifierPhase } from "./select-modifier-phase";
import { deleteBind } from "#app/configs/inputs/configHandler.js";
import { getDailyRunStarters } from "#app/data/daily-run.js";
import { Species } from "#app/enums/species.js";
import { TimeOfDay } from "#app/enums/time-of-day.js";

export class NewBattlePhase extends BattlePhase {
	private encounterList: string[] = [];

  start() {
    var scouting = false;

    if (!scouting) {
      super.start();

      this.scene.newBattle();

      this.end();
    } else {
      this.Scouting();
    }
  }

  Scouting() {
    var startingBiome = this.scene.arena.biomeType

    // Run this up to 5 times, can always cancel by pressing F5
    for (var i = 0; i < 5; i++) {
      // Remove any lures or charms
      this.scene.RemoveModifiers()

      // Add 0 to 4 charms, depending on the loop
      if (i > 0) this.scene.InsertAbilityCharm(i);

      // Keep track of encounters, Generate Biomes and encounters
      this.encounterList = [];
      this.GenerateBiomes(startingBiome, 0);
      console.log(this.encounterList);
      debugger; // pause to copy 0 lures & i charms

      this.encounterList = [];
      this.scene.InsertLure();
      this.GenerateBiomes(startingBiome, 0);
      console.log(this.encounterList);
      debugger; // pause to copy 1 lure & i charms

      this.encounterList = [];
      this.scene.InsertSuperLure();
      this.GenerateBiomes(startingBiome, 0);
      console.log(this.encounterList);
      debugger; // pause to copy 2 lures & i charms

      this.encounterList = [];
      this.scene.InsertMaxLure();
      this.GenerateBiomes(startingBiome, 0);
      console.log(this.encounterList);
      debugger; // pause to copy 3 lures & i charms
    }
  }

  GenerateBattle(nolog = false) {
    var battle = this.scene.newBattle()
    this.scene.shiftPhase()
    while (this.scene.currentPhase?.constructor.name !== "NextEncounterPhase" && this.scene.currentPhase?.constructor.name !== "NewBiomeEncounterPhase") {
      this.scene.shiftPhase();
    }

    if (!nolog) {
      console.log(TimeOfDay[this.scene.arena.getTimeOfDay()]);
      if (battle?.trainer != null) {
        this.encounterList.push(`Wave: ${this.scene.currentBattle.waveIndex} Biome: ${Biome[this.scene.arena.biomeType]} Trainer: ${battle.trainer.config.name}`);
      }
      battle?.enemyParty?.forEach((e, i) => {
        // Regional pokemon have the same name, instead get their atlas path.
        if (e.species.speciesId > 1025) {
          // Using nicknames here because i want the getPokemonNameWithAffix so i have Wild/Foe information
          // Nicknames are stored in base 64? so convert btoa here
          e.nickname = btoa(Species[e.getSpeciesForm().getSpriteAtlasPath(false, e.formIndex)])
        }

        // Store encounters in a list, basically CSV (uses regex in sheets), but readable as well
        this.encounterList.push(`Wave: ${this.scene.currentBattle.waveIndex} Biome: ${Biome[this.scene.arena.biomeType]} Pokemon: ${getPokemonNameWithAffix(e)} ` +
        `Form: ${e.species.forms[e.formIndex]?.formName} Species ID: ${e.species.speciesId} Stats: ${e.stats} IVs: ${e.ivs} Ability: ${e.getAbility().name} ` +
        `Passive Ability: ${e.getPassiveAbility().name} Nature: ${Nature[e.nature]} Gender: ${Gender[e.gender]} Rarity: ${LoggerTools.rarities[i]} AbilityIndex: ${e.abilityIndex} ID: ${e.id}`)
      })
    }
  }

  GenerateBiomes(biome: Biome, waveIndex: integer) {
    this.scene.newArena(biome);
    this.scene.currentBattle.waveIndex = waveIndex;
    this.scene.arena.updatePoolsForTimeOfDay()

    // Finish biome
    for (var i = 1; i <= 10; i++) {
      this.GenerateBattle()
    }

    // Victory
    if (this.scene.currentBattle.waveIndex >= 50) {
      return;
    }

    // Get next biomes by offsetting the seed to the x1 wave and then rolling for the biome selections.
    var biomeChoices: Biome[] = [];
    this.scene.executeWithSeedOffset(() => {
      biomeChoices = (!Array.isArray(biomeLinks[biome])
      ? [ biomeLinks[biome] as Biome ]
      : biomeLinks[biome] as (Biome | [Biome, integer])[])
      .filter((b, i) => !Array.isArray(b) || !Utils.randSeedInt(b[1], undefined, "Choosing next biome for map"))
      .map(b => Array.isArray(b) ? b[0] : b);
    }, waveIndex + 11);
    console.log(biomeChoices);

    // Recursively generate next biomes
    for (var b of biomeChoices) {
      // If waveindex is not the same anymore, that means a different path ended and we continue with a new branch
      if (this.scene.currentBattle.waveIndex != waveIndex) {
        // Back to x9 wave to generate the x0 wave again, that sets the correct rng
        this.scene.newArena(biome);
        this.scene.currentBattle.waveIndex = waveIndex + 9;
        this.GenerateBattle(true);
      }

      this.GenerateBiomes(b, waveIndex + 10);
    }
  }
}
