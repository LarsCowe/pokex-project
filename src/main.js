'use strict';

// ===== DATA & API FUNCTIES =====

// Globale variabele om alle Pokémon bij te houden
let allPokemon = [];

// Een lijst met Pokémon ophalen
async function fetchPokemon() {
  try {
    // Ophalen van eerste 20 Pokémon
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
    const data = await response.json();

    // Voor elke Pokémon de details ophalen en wachten tot alles binnen is
    const pokemonPromises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );

    allPokemon = await Promise.all(pokemonPromises);

    // UI updaten met de opgehaalde gegevens
    displayPokemonDetails(allPokemon);
    setupSearch();
    setupSorting();
  } catch (error) {
    console.error('Fout bij het ophalen van Pokémon:', error);
    const container = document.getElementById('pokemon-list');
    if (container) {
      container.innerHTML =
        '<p>Er is een fout opgetreden bij het laden van Pokémon.</p>';
    }
  }
}

// Extra Pokémon gegevens ophalen (soort informatie)
async function fetchSpeciesData(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.log('Species informatie kon niet worden geladen');
    return null;
  }
}

// ===== FAVORIETEN FUNCTIES =====
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
  event.stopPropagation();

  const id = parseInt(event.currentTarget.dataset.id);
  let favorites = getFavorites();
  const index = favorites.indexOf(id);

  if (index !== -1) {
    // Verwijderen uit favorieten
    favorites.splice(index, 1);
    event.currentTarget.textContent = '🤍';
  } else {
    // Toevoegen aan favorieten
    favorites.push(id);
    event.currentTarget.textContent = '❤️';
  }

  localStorage.setItem('pokex_favorites', JSON.stringify(favorites));
}

// Event listeners voor favoriet knoppen instellen
function setupFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach((button) => {
    button.addEventListener('click', toggleFavorite);
  });
}

// ===== UI WEERGAVE FUNCTIES =====
function displayPokemonDetails(pokemonList) {
  const container = document.getElementById('pokemon-list');
  container.innerHTML = '';

  pokemonList.forEach((pokemon) => {
    // Kaart maken en eigenschappen instellen
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.dataset.id = pokemon.id;

    // Favoriet status bepalen
    const isFavorite = checkFavorite(pokemon.id);

    // HTML voor de kaart genereren
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

    container.appendChild(card);
  });

  // Event listeners instellen
  setupFavoriteButtons();
  setupCardClickHandlers();
}

// Event listeners instellen voor klikken op Pokemon kaarten
function setupCardClickHandlers() {
  document.querySelectorAll('.pokemon-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      // Negeer klikken op de favoriet knop
      if (
        event.target.classList.contains('favorite-btn') ||
        event.target.closest('.favorite-btn')
      ) {
        return;
      }

      const pokemonId = parseInt(card.dataset.id);
      showPokemonDetail(pokemonId);
    });
  });
}

// Toon gedetailleerde Pokemon informatie in een modal
async function showPokemonDetail(pokemonId) {
  const pokemon = allPokemon.find((p) => p.id === pokemonId);
  if (!pokemon) {
    console.error('Pokemon niet gevonden:', pokemonId);
    return;
  }

  // Modal voorbereiden
  const modal = document.getElementById('detail-modal');
  const modalContent = document.getElementById('pokemon-detail');
  modal.style.display = 'block';

  try {
    // Opbouw van alle detail secties
    let detailHTML = createBasicPokemonInfo(pokemon);

    // Species data ophalen en toevoegen
    try {
      const speciesData = await fetchSpeciesData(pokemon.species.url);
      if (speciesData) {
        detailHTML += createSpeciesInfo(speciesData);
      }
    } catch (error) {
      console.log('Extra species informatie kon niet worden geladen');
    }

    // HTML afsluiten en tonen
    detailHTML += `</div></div>`;
    modalContent.innerHTML = detailHTML;
  } catch (error) {
    // Fallback bij fouten
    showErrorInfo(modalContent, pokemon);
  }
}

// Basis Pokémon info HTML genereren
function createBasicPokemonInfo(pokemon) {
  return `
    <div class="detail-header">
      <h2>${pokemon.name} <span class="pokemon-id">#${pokemon.id
    .toString()
    .padStart(3, '0')}</span></h2>
    </div>
    <div class="detail-images">
      <img src="${pokemon.sprites.front_default}" alt="${
    pokemon.name
  } voorkant">
      ${
        pokemon.sprites.back_default
          ? `<img src="${pokemon.sprites.back_default}" alt="${pokemon.name} achterkant">`
          : ''
      }
    </div>
    
    <div class="detail-types">
      ${pokemon.types
        .map(
          (type) =>
            `<span class="type-badge ${type.type.name}">${type.type.name}</span>`
        )
        .join('')}
    </div>
    
    <div class="detail-info">
      <div class="detail-stats">
        <h3>Statistieken</h3>
        ${pokemon.stats
          .map(
            (stat) => `
          <div class="stat">
            <span class="stat-name">${stat.stat.name.replace('-', ' ')}:</span>
            <span class="stat-value">${stat.base_stat}</span>
          </div>
        `
          )
          .join('')}
        
        <div class="pokemon-dimensions">
          <p><strong>Hoogte:</strong> ${pokemon.height / 10} m</p>
          <p><strong>Gewicht:</strong> ${pokemon.weight / 10} kg</p>
        </div>
      </div>
      <div class="detail-abilities">
        <h3>Vaardigheden</h3>
        <ul>
          ${pokemon.abilities
            .map(
              (ability) => `<li>${ability.ability.name.replace('-', ' ')}</li>`
            )
            .join('')}
        </ul>
  `;
}

// Extra soort informatie toevoegen
function createSpeciesInfo(speciesData) {
  let html = '';

  // Beschrijving toevoegen indien beschikbaar
  const description = speciesData.flavor_text_entries
    ? speciesData.flavor_text_entries
        .find((entry) => entry.language.name === 'en')
        ?.flavor_text.replace(/\f/g, ' ') || 'Geen beschrijving beschikbaar.'
    : 'Geen beschrijving beschikbaar.';

  if (description) {
    html += `
      <h3>Beschrijving</h3>
      <p>${description}</p>
    `;
  }

  // Habitat en generatie toevoegen indien beschikbaar
  if (speciesData.habitat) {
    html += `<p><strong>Habitat:</strong> ${speciesData.habitat.name}</p>`;
  }
  if (speciesData.generation) {
    html += `<p><strong>Generatie:</strong> ${speciesData.generation.name.replace(
      '-',
      ' '
    )}</p>`;
  }

  return html;
}

// Foutinfo tonen wanneer iets misgaat
function showErrorInfo(container, pokemon) {
  container.innerHTML = `
    <h2>${pokemon.name}</h2>
    <p>Er is een fout opgetreden bij het laden van extra informatie.</p>
    <div class="detail-info">
      <p><strong>Type:</strong> ${pokemon.types
        .map((type) => type.type.name)
        .join(', ')}</p>
      <p><strong>Hoogte:</strong> ${pokemon.height / 10} m</p>
      <p><strong>Gewicht:</strong> ${pokemon.weight / 10} kg</p>
    </div>  `;
}

// Functie om de modal te sluiten
function closeModal() {
  const modal = document.getElementById('detail-modal');
  modal.style.display = 'none';
}

// Setup modal close events
function setupModalCloseEvents() {
  // Sluit knop
  const closeButton = document.querySelector('.close-btn');
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  // Klik buiten de modal content
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  // Escape toets
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

// ===== SORTEERFUNCTIE =====
function setupSorting() {
  const sortSelect = document.getElementById('sort-select');

  sortSelect.addEventListener('change', () => {
    const sortOption = sortSelect.value;
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.toLowerCase();

    // Filter eerst op zoekopdracht als die er is
    let pokemonToDisplay = allPokemon;
    if (searchTerm) {
      pokemonToDisplay = allPokemon.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm)
      );
    }

    // Dan sorteren op basis van geselecteerde optie
    switch (sortOption) {
      case 'name-asc':
        pokemonToDisplay.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        pokemonToDisplay.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'weight-asc':
        pokemonToDisplay.sort((a, b) => a.weight - b.weight);
        break;
      case 'weight-desc':
        pokemonToDisplay.sort((a, b) => b.weight - a.weight);
        break;
      case 'height-asc':
        pokemonToDisplay.sort((a, b) => a.height - b.height);
        break;
      case 'height-desc':
        pokemonToDisplay.sort((a, b) => b.height - a.height);
        break;
      default:
        // Standaard sortering (ID volgorde)
        pokemonToDisplay.sort((a, b) => a.id - b.id);
    }

    // Toon de gesorteerde Pokémon
    displayPokemonDetails(pokemonToDisplay);
  });
}

// ===== ZOEKFUNCTIE =====
function setupSearch() {
  const searchInput = document.getElementById('search-input');

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter Pokémon op naam
    const filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );

    // Pas huidige sortering toe op de gefilterde resultaten
    const sortSelect = document.getElementById('sort-select');
    const sortOption = sortSelect.value;

    if (sortOption !== 'default') {
      // Trigger de sorteerfunctie met huidige waarde
      sortSelect.dispatchEvent(new Event('change'));
      return;
    }

    // Toon de gefilterde Pokémon als er geen sortering is
    displayPokemonDetails(filteredPokemon);
  });
}

// ===== APPLICATIE STARTEN =====
document.addEventListener('DOMContentLoaded', () => {
  fetchPokemon();
  setupModalCloseEvents();
  setupSorting();
});
