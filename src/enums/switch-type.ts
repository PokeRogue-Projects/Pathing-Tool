/**
 * Indicates the type of switch functionality that a {@linkcode SwitchPhase}
 * or {@linkcode SwitchSummonPhase} will carry out.
 */
// IMPORTANT: Fix all uses of the old 'mid turn switch', 'pre switch', etc.
export enum SwitchType {
  /** Switchout specifically for when combat starts and the player is prompted if they will switch Pokemon */
  INITIAL_SWITCH,
  /** Basic switchout where the Pokemon to switch in is selected */
  SWITCH,
  /** Transfers stat stages and other effects from the returning Pokemon to the switched in Pokemon */
  BATON_PASS,
  /** Transfers the returning Pokemon's Substitute to the switched in Pokemon */
  SHED_TAIL,
  /** Force switchout to a random party member */
  FORCE_SWITCH,
}
