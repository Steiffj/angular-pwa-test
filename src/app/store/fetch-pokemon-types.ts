import { PokemonType } from '__typegen/types';

export async function fetchPokemonTypes(apiUrl: string) {
  const url = new URL('type', apiUrl);
  url.searchParams.set('limit', '100');

  console.log(`Loading types from ${url}`);
  const res = await fetch(url);
  const data: {
    count: number;
    next: unknown;
    previous: unknown;
    results: { name: PokemonType; url: string }[];
  } = await res.json();

  console.log(`Loaded ${data.results.length} types`);
  if (data.next || data.previous) {
    console.warn('Not all types were loaded. Increase the "limit" query param');
  }

  return data.results;
}
