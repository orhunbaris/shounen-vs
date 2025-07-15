export interface Character {
  id: number;
  name: string;
  anime: string;
  image: string;
}

export interface Vote {
  characterId: number;
  votes: number;
}
