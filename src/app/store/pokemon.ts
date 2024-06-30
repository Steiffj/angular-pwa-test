type Abillity = {
  name: string;
  url: string;
  is_hidden: boolean;
  slot: number;
};

type Form = {
  name: string;
  url: string;
};

type GameIndex = {
  game_index: number;
  version: {
    name: string;
    url: string;
  };
};

type Move = {
  name: string;
  url: string;
};

export type Pokemon = {
  id: number;
  name: string;
  url: string;
  // abilities: Abillity[];
  // base_experience: number;
  // cries: {
  //   latest: string;
  //   legacy: string;
  // };
  // forms: Form[];
  // game_indices: GameIndex[];
  // height: number;
  // held_items: unknown[];
  // is_default: boolean;
  // location_area_encounters: string;
  // moves: {
  // move: Move;
  // version_group_details[]
  // }[];
  // order: number;
  // types: {
  //   slot: number;
  //   type: {
  //     name: string;
  //     url: string;
  //   };
  // }[];
  // weight: number;
};
