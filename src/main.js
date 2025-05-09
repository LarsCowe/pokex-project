'use strict';

// Een lijst met Pokémon ophalen
async function fetchPokemon() {
  try {
    // Ophalen van eerste 10 Pokémon (minder om te beginnen)
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');

    if (!response.ok) {
      throw new Error(`API fout: ${response.status}`);
    }

    const data = await response.json();

    // Voor elke Pokémon de details ophalen
    const pokemonDetailsPromises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    // Wachten tot alle details zijn opgehaald
    const pokemonDetails = await Promise.all(pokemonDetailsPromises);

    // De gedetailleerde resultaten tonen
    displayPokemonDetails(pokemonDetails);
  } catch (error) {
    console.error('Fout bij het ophalen van Pokémon:', error);
  }
}

// Gedetailleerde Pokémon info weergeven
function displayPokemonDetails(pokemonList) {
  const container = document.getElementById('pokemon-list');
  container.innerHTML = ''; // Container leegmaken

  // Voor elke Pokémon
  pokemonList.forEach((pokemon) => {
    // Een kaart maken
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    // HTML voor de kaart met meer details
    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <h3>${pokemon.name}</h3>
      <p>Type: ${pokemon.types.map((type) => type.type.name).join(', ')}</p>
      <p>Gewicht: ${pokemon.weight / 10} kg</p>
      <p>Hoogte: ${pokemon.height / 10} m</p>
    `;

    // Toevoegen aan de container
    container.appendChild(card);
  });
}

// De app starten wanneer de pagina is geladen
document.addEventListener('DOMContentLoaded', fetchPokemon);
