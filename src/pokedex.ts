import axios from 'axios';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

import { getPokemonSpecies } from './getPokemonSpecies';
import { getPokemonUrlImages } from './getPokemonUrlImages';
import { getPokemonWeakeanes } from './getPokemonWeakeanes';
import { Pokemon, PokemonArray, PokemonNamesArray, PokemonStatus, PokemonTypeSlot } from './interfaces/Pokemon';

export async function getPokemon(pokemonName: string | number) {
  let data;
  try {
    try {
      data = JSON.parse(
        readFileSync("./node_modules/pkmonjs/data/pokedex.json", "utf-8")
      );
    } catch (error) {
      data = JSON.parse(readFileSync("./data/pokedex.json", "utf-8"));
    }
    let dataFind: Pokemon = data.find(
      (pokeany: Pokemon) =>
        pokeany.idPokedex === pokemonName || pokeany.name === pokemonName
    );

    return dataFind;
  } catch (error) {
    const pokeGet = await axios.get(
      "https://pokeapi.co/api/v2/pokemon/" + pokemonName
    );
    data = pokeGet.data;
    const pokemonTypes: Array<PokemonTypeSlot> = data.types;
    let weak = await getPokemonWeakeanes(pokemonTypes);

    if (weak) {
      const stats = data.stats;

      const pokemonStatus: PokemonStatus = {
        hp: stats[0].base_stat,
        attack: stats[1].base_stat,
        defense: stats[2].base_stat,
        specialAttack: stats[3].base_stat,
        specialDefense: stats[4].base_stat,
        speed: stats[5].base_stat,
        height: data.height,
        weight: data.weight,
        types: weak,
      };

      const pokemonImages = getPokemonUrlImages(data);
      const specie = await getPokemonSpecies(data.species.url);
      const url = `https://www.pokemon.com/br/pokedex/${data.id}`;
      const response = await axios.get(url);
      const dom: any = new JSDOM(response.data);
      let curiosity = dom.window.document.querySelector("p").textContent.trim();
      const pokemon: Pokemon = {
        idPokedex: data.id,
        name: data.name,
        description: curiosity,
        sexMalePorcentage: specie.genderRate?.male,
        sexFemalePorcentage: specie.genderRate?.female,
        undefinedPorcentage: specie.genderRate?.undefined,
        stats: pokemonStatus,
        image: pokemonImages,
        color: specie.color,
        habitat: specie.habitat,
        generation: specie.generation,
      };

      return pokemon;
    }
  }
}
export async function getAllPokemonNames() {
  let poke;

  try {
    poke = JSON.parse(
      readFileSync("./node_modules/pkmonjs/data/pokedexNames.json", "utf-8")
    );
  } catch (error) {
    poke = JSON.parse(readFileSync("./data/pokedexNames.json", "utf-8"));
  }
  const pokes: PokemonNamesArray = poke;
  return pokes;
}
export async function getAllPokemon() {
  let data;
  try {
    data = JSON.parse(
      readFileSync("./node_modules/pkmonjs/data/pokedex.json", "utf-8")
    );
  } catch (error) {
    data = JSON.parse(readFileSync("./data/pokedex.json", "utf-8"));
  }
  const pokes: PokemonArray = data;
  return pokes;
}
