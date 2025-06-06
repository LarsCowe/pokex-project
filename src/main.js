'use strict';

/* ===== DATA & API FUNCTIES ===== */

let allPokemon = [];

// Haalt Pokémon data op van de API en initialiseert de applicatie
async function fetchPokemon() {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50');
    const data = await response.json();

    const pokemonPromises = data.results.map((pokemon) =>
      fetch(pokemon.url).then((res) => res.json())
    );
    allPokemon = await Promise.all(pokemonPromises);

    allPokemon.sort((a, b) => a.id - b.id);

    displayPokemonDetails(allPokemon);
    setupSearch();
    setupSorting();
    setupTypeFilter();
    setupFavoritesToggle();
  } catch (error) {
    console.error('Fout bij het ophalen van Pokémon:', error);
    const container = document.getElementById('pokemon-list');
    if (container) {
      container.innerHTML =
        '<p>Er is een fout opgetreden bij het laden van Pokémon.</p>';
    }
  }
}

// Haalt extra soorteninformatie op voor een Pokémon
async function fetchSpeciesData(url) {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.log('Species informatie kon niet worden geladen');
    return null;
  }
}

/* ===== FAVORIETEN FUNCTIONALITEIT ===== */

// Controleert of een Pokémon in favorieten staat
function checkFavorite(id) {
  const favorites = getFavorites();
  return favorites.includes(id);
}

// Haalt favoriete Pokémon op uit localStorage
function getFavorites() {
  try {
    const favoritesJson = localStorage.getItem('pokex_favorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error('Fout bij toegang tot localStorage:', error);
    return [];
  }
}

// Voegt Pokémon toe aan favorieten of verwijdert deze
function toggleFavorite(event) {
  event.stopPropagation();

  const id = parseInt(event.currentTarget.dataset.id);
  let favorites = getFavorites();
  const index = favorites.indexOf(id);
  if (index !== -1) {
    favorites.splice(index, 1);
    event.currentTarget.textContent = '🤍';
  } else {
    favorites.push(id);
    event.currentTarget.textContent = '❤️';
  }
  localStorage.setItem('pokex_favorites', JSON.stringify(favorites));

  applyFilters();
}

// Initialiseert klikgedrag voor alle favorieten knoppen
function setupFavoriteButtons() {
  document.querySelectorAll('.favorite-btn').forEach((button) => {
    button.addEventListener('click', toggleFavorite);
  });
}

/* ===== UI WEERGAVE FUNCTIES ===== */

// Toont Pokémon kaarten in het overzicht
function displayPokemonDetails(pokemonList) {
  const container = document.getElementById('pokemon-list');
  container.innerHTML = '';

  pokemonList.forEach((pokemon) => {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.dataset.id = pokemon.id;

    const isFavorite = checkFavorite(pokemon.id);
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

  setupFavoriteButtons();
  setupCardClickHandlers();
}

// Voegt klikfunctionaliteit toe aan Pokémon kaarten
function setupCardClickHandlers() {
  document.querySelectorAll('.pokemon-card').forEach((card) => {
    card.addEventListener('click', (event) => {
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

// Toont gedetailleerde informatie van een Pokémon in een modal
async function showPokemonDetail(pokemonId) {
  const pokemon = allPokemon.find((p) => p.id === pokemonId);
  if (!pokemon) {
    console.error('Pokemon niet gevonden:', pokemonId);
    return;
  }
  const modal = document.getElementById('detail-modal');
  const modalContent = document.getElementById('pokemon-detail');
  modal.style.display = 'block';

  try {
    let detailHTML = createBasicPokemonInfo(pokemon);

    try {
      const speciesData = await fetchSpeciesData(pokemon.species.url);
      if (speciesData) {
        detailHTML += createSpeciesInfo(speciesData);
      }
    } catch (error) {
      console.log('Extra species informatie kon niet worden geladen');
    }

    detailHTML += `</div></div>`;
    modalContent.innerHTML = detailHTML;
  } catch (error) {
    showErrorInfo(modalContent, pokemon);
  }
}

// Genereert HTML voor basis informatie van een Pokémon
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

// Genereert HTML voor aanvullende soortinformatie van een Pokémon
function createSpeciesInfo(speciesData) {
  let html = '';

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

// Toont basis informatie wanneer gedetailleerde data niet beschikbaar is
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

// Sluit de detail modal
function closeModal() {
  const modal = document.getElementById('detail-modal');
  modal.style.display = 'none';
}

// Stelt verschillende manieren in om de modal te sluiten
function setupModalCloseEvents() {
  const closeButton = document.querySelector('.close-btn');
  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }
  const modal = document.getElementById('detail-modal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

/* ===== FILTER & SORTEER FUNCTIES ===== */

// Initialiseert de sorteerfunctionaliteit
function setupSorting() {
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', applyFilters);
}

// Initialiseert de zoekfunctionaliteit
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', applyFilters);
}

// Initialiseert type filter met alle beschikbare Pokémon types
function setupTypeFilter() {
  const typeFilter = document.getElementById('type-filter');
  const uniqueTypes = getUniqueTypes();

  uniqueTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    typeFilter.appendChild(option);
  });

  typeFilter.addEventListener('change', applyFilters);
}

// Verzamelt unieke Pokémon types uit de dataset
function getUniqueTypes() {
  const allTypes = [];

  allPokemon.forEach((pokemon) => {
    pokemon.types.forEach((typeInfo) => {
      if (!allTypes.includes(typeInfo.type.name)) {
        allTypes.push(typeInfo.type.name);
      }
    });
  });

  return allTypes.sort();
}

// Past alle filters en sortering toe op de Pokémon lijst
function applyFilters() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value.toLowerCase();
  const typeFilter = document.getElementById('type-filter');
  const selectedType = typeFilter.value;
  const favoritesButton = document.getElementById('favorites-toggle');

  let filteredPokemon = allPokemon;
  if (searchTerm) {
    filteredPokemon = filteredPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchTerm)
    );
  }

  // Filter op Pokémon type
  if (selectedType !== 'all') {
    filteredPokemon = filteredPokemon.filter((pokemon) =>
      pokemon.types.some((typeInfo) => typeInfo.type.name === selectedType)
    );
  }

  // Filter op favorieten status
  if (favoritesButton.classList.contains('active')) {
    filteredPokemon = filteredPokemon.filter((pokemon) =>
      checkFavorite(pokemon.id)
    );
  }

  const sortSelect = document.getElementById('sort-select');
  const sortOption = sortSelect.value;

  // Sorteer volgens gekozen sorteeroptie
  switch (sortOption) {
    case 'name-asc':
      filteredPokemon.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filteredPokemon.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'weight-asc':
      filteredPokemon.sort((a, b) => a.weight - b.weight);
      break;
    case 'weight-desc':
      filteredPokemon.sort((a, b) => b.weight - a.weight);
      break;
    case 'height-asc':
      filteredPokemon.sort((a, b) => a.height - b.height);
      break;
    case 'height-desc':
      filteredPokemon.sort((a, b) => b.height - a.height);
      break;
    default:
      filteredPokemon.sort((a, b) => a.id - b.id);
  }

  displayPokemonDetails(filteredPokemon);
}

/* ===== APPLICATIE INITIALISATIE ===== */

document.addEventListener('DOMContentLoaded', () => {
  fetchPokemon();
  setupModalCloseEvents();
  setupFavoritesToggle();
  setupThemeToggle();
});

/* ===== FAVORIETEN FILTER FUNCTIONALITEIT ===== */

// Initialiseert de favorieten filter knop
function setupFavoritesToggle() {
  const favoritesButton = document.getElementById('favorites-toggle');
  favoritesButton.addEventListener('click', toggleFavoritesFilter);
}

// Schakelt tussen tonen van alle Pokémon of alleen favorieten
function toggleFavoritesFilter() {
  const favoritesButton = document.getElementById('favorites-toggle');
  favoritesButton.classList.toggle('active');

  if (favoritesButton.classList.contains('active')) {
    favoritesButton.textContent = 'Toon alle';
  } else {
    favoritesButton.textContent = 'Toon favorieten';
  }

  applyFilters();
}

/* ===== OBSERVER API FUNCTIONALITEIT ===== */

// Voegt animatie toe aan Pokémon kaarten wanneer ze in beeld komen
function setupCardObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll('.pokemon-card').forEach((card) => {
    observer.observe(card);
  });
}

// Breidt displayPokemonDetails functie uit met animatie
const originalDisplayFunction = displayPokemonDetails;
displayPokemonDetails = function (pokemonList) {
  originalDisplayFunction(pokemonList);

  setupCardObserver();
};

/* ===== DARK THEME FUNCTIONALITEIT ===== */

function setupThemeToggle() {
  // Initialiseert de thema schakelaar (light/dark mode)
  const themeToggle = document.getElementById('theme-toggle');

  if (localStorage.getItem('pokex_theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.textContent = '☀️';
  }

  themeToggle.addEventListener('click', toggleTheme);
}

// Wisselt tussen licht en donker thema
function toggleTheme() {
  const themeToggle = document.getElementById('theme-toggle');

  if (document.body.classList.contains('dark-theme')) {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('pokex_theme', 'light');
    themeToggle.textContent = '🌙';
  } else {
    document.body.classList.add('dark-theme');
    localStorage.setItem('pokex_theme', 'dark');
    themeToggle.textContent = '☀️';
  }
}
