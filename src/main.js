'use strict';

// Globale variabele om alle Pokémon bij te houden
let allPokemon = [];

// Een lijst met Pokémon ophalen
async function fetchPokemon() {
  try {
    // Ophalen van eerste 20 Pokémon
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
    const data = await response.json();

    // Voor elke Pokémon de details ophalen
    const pokemonDetailsPromises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    // Wachten tot alle details zijn opgehaald
    allPokemon = await Promise.all(pokemonDetailsPromises);

    // De gedetailleerde resultaten tonen
    displayPokemonDetails(allPokemon);

    // Zoekfunctie instellen
    setupSearch();
  } catch (error) {
    console.error('Fout bij het ophalen van Pokémon:', error);
  }
}

// Controleren of een Pokémon een favoriet is
function checkFavorite(id) {
  const favorites = getFavorites();
  return favorites.includes(id);
}

// Alle favorieten ophalen uit localStorage
function getFavorites() {
  try {
    const favoritesJson = localStorage.getItem('pokex_favorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error('Fout bij toegang tot localStorage:', error);
    return [];
  }
}

// Favoriet status omschakelen
function toggleFavorite(event) {
  // Voorkom dat de klik doorgaat naar de kaart
  event.stopPropagation();

  // Haal het Pokémon ID uit de knop
  const id = parseInt(event.currentTarget.dataset.id);

  // Haal huidige favorieten op
  let favorites = getFavorites();

  // Check of deze Pokémon al een favoriet is
  const index = favorites.indexOf(id);

  if (index !== -1) {
    // Verwijderen uit favorieten als het al een favoriet is
    favorites.splice(index, 1);
    event.currentTarget.textContent = '🤍';
    console.log(`Pokémon ${id} verwijderd uit favorieten`);
  } else {
    // Toevoegen aan favorieten als het nog geen favoriet is
    favorites.push(id);
    event.currentTarget.textContent = '❤️';
    console.log(`Pokémon ${id} toegevoegd aan favorieten`);
  }

  // Opslaan in localStorage
  localStorage.setItem('pokex_favorites', JSON.stringify(favorites));
}

// Event listeners voor favoriet knoppen instellen
function setupFavoriteButtons() {
  // Selecteer alle favoriete knoppen
  const favoriteButtons = document.querySelectorAll('.favorite-btn');

  // Voor elke knop een event listener toevoegen
  favoriteButtons.forEach((button) => {
    button.addEventListener('click', toggleFavorite);
  });
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

    // Check of deze Pokémon een favoriet is
    const isFavorite = checkFavorite(pokemon.id);

    // HTML voor de kaart met meer details
    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <h3>${pokemon.name}</h3>
      <p>Type: ${pokemon.types.map((type) => type.type.name).join(', ')}</p>
      <p>Gewicht: ${pokemon.weight / 10} kg</p>
      <p>Hoogte: ${pokemon.height / 10} m</p>
      <button class="favorite-btn" data-id="${pokemon.id}">
        ${isFavorite ? '❤️' : '🤍'}
      </button>
    `;

    // Toevoegen aan de container
    container.appendChild(card);
  });

  // Event listeners voor favoriet knoppen toevoegen
  setupFavoriteButtons();
}

// Zoekfunctie instellen
function setupSearch() {
  const searchInput = document.getElementById('search-input');

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    // Filteren van Pokémon op naam
    const filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );

    // Gefilterde resultaten tonen
    displayPokemonDetails(filteredPokemon);
  });
}

// De app starten wanneer de pagina is geladen
document.addEventListener('DOMContentLoaded', fetchPokemon);
