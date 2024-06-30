// Generated from https://pokeapi.co/api/v2/type?limit=100 at Sat Jun 29 2024 15:25:10 GMT-0400 (Eastern Daylight Time)
export const POKEMON_TYPE = [
  'normal',
  'fighting',
  'flying',
  'poison',
  'ground',
  'rock',
  'bug',
  'ghost',
  'steel',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
  'stellar',
  'unknown',
  'shadow'
] as const;

export type PokemonType = (typeof POKEMON_TYPE)[number];