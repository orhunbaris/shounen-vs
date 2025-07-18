export interface Character {
  id: number;
  name: string;
  anime: string;
  image: string;
}

export interface Vote {
  character: Character;
  votes: number;
}

// Jikan API response types
export interface JikanCharacter {
  character: {
    mal_id: number;
    name: string;
    images: {
      jpg: {
        image_url: string;
      };
    };
  };
  role: string;
  voice_actors: unknown[]; 
}

export interface JikanResponse {
  data: JikanCharacter[];
}

export interface AnimeInfo {
  id: number;
  name: string;
  apiUrl: string;
}
