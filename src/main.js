'use strict';

// Een lijst met Pokémon ophalen
async function fetchPokemon() {
  try {
    // Ophalen van eerste 20 Pokémon
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`API fout: ${response.status}`);
    }

    console.log('Pokémon lijst:', data);

    // De resultaten tonen op de pagina
    displayPokemon(data.results);
  } catch (error) {
    console.error('Fout bij het ophalen van Pokémon:', error);
  }
}

// Pokémon weergeven in de DOM
function displayPokemon(pokemonList) {
  const container = document.getElementById('pokemon-list');

  // Voor elke Pokémon
  pokemonList.forEach((pokemon) => {
    // ID uit URL halen (laatste nummer in URL)
    const id = pokemon.url
      .split('/')
      .filter((part) => part !== '')
      .pop();

    // Een kaart maken voor de Pokémon
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    // HTML voor de kaart
    card.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${pokemon.name}">
      <h3>${pokemon.name}</h3>
    `;

    // Toevoegen aan de container
    container.appendChild(card);
  });
}

// De app starten wanneer de pagina is geladen
document.addEventListener('DOMContentLoaded', fetchPokemon);
