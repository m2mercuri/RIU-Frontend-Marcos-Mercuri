export interface Superhero {
  id: string;
  name: string;
  realName: string;
  powers: string[];
  city: string;
  team?: string;
  description: string;
  isActive: boolean;
}

export interface SuperheroCreateRequest {
  name: string;
  realName: string;
  powers: string[];
  city: string;
  team?: string;
  description: string;
  isActive: boolean;
}

export interface SuperheroUpdateRequest extends SuperheroCreateRequest {
  id: string;
}

export interface SuperheroResponse {
  heroes: Superhero[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SuperheroFilter {
  name?: string;
  isActive?: boolean;
  page: number;
  pageSize: number;
}

export interface SuperheroNotFoundMessage {
  title: string;
  description: string;
}
