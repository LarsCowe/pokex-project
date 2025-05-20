# Pokex Project

Een dynamische, interactieve single-page webapplicatie waarmee gebruikers Pokémon kunnen verkennen, filteren, sorteren en opslaan in hun persoonlijke collectie.

## Projectbeschrijving

Pokex is een Pokémon-verkenner gebouwd met vanilla JavaScript, gebruikmakend van de publieke [PokéAPI](https://pokeapi.co/). De applicatie stelt gebruikers in staat om:

- Door Pokémon te bladeren met gedetailleerde informatie
- Specifieke Pokémon te zoeken op naam
- Pokémon te filteren op type
- Pokémon te sorteren op verschillende eigenschappen (naam, hoogte, gewicht)
- Favoriete Pokémon op te slaan in een persoonlijke collectie
- Gedetailleerde informatie over elke Pokémon te bekijken in een modal

## Functionaliteiten

### Dataverzameling & -weergave

- Haalt data op van de PokéAPI om Pokémon-informatie weer te geven
- Toont Pokémon in visueel aantrekkelijke kaarten met essentiële details
- Toont uitgebreide informatie in een modal-dialoog wanneer een Pokémon wordt geselecteerd

### Interactiviteit

- Filterfunctionaliteit op Pokémon-type
- Zoekfunctie om Pokémon op naam te vinden
- Sorteeropties (op naam, gewicht, hoogte, oplopend en aflopend)

### Personalisatie

- Sla favoriete Pokémon op met een eenvoudige knop
- Gegevens worden tussen sessies opgeslagen met localStorage
- Schakel tussen alle Pokémon en alleen favorieten

### Gebruikerservaring

- Responsive design voor alle schermformaten
- Visuele feedback bij interactie met de applicatie
- Vloeiende animaties met behulp van de Observer API

## Technische Implementatie

### DOM Manipulatie

- Elementen selecteren: Door de hele code heen, bijv., `document.getElementById('pokemon-list')` in `displayPokemonDetails()` (regel 89)
- Elementen manipuleren: DOM-elementen gemaakt en gewijzigd in `displayPokemonDetails()` (regel 89-111)
- Events koppelen: Event listeners toegevoegd op meerdere plaatsen, bijv., `setupCardClickHandlers()` (regel 117-131)

### Modern JavaScript

- Constanten: Gebruikt door de hele code, bijv., `const container = document.getElementById('pokemon-list')` (regel 26)
- Template literals: Gebruikt voor HTML-creatie, bijv., in `createBasicPokemonInfo()` (regel 163-219)
- Array iteratie: Gebruikt map, filter, etc. door de hele code, bijv., `pokemon.types.map((type) => type.type.name).join(', ')` (regel 102)
- Arrow functions: Uitgebreid gebruikt, bijv., `allPokemon.sort((a, b) => a.id - b.id)` (regel 17)
- Ternary operator: Gebruikt voor conditionele weergave, bijv., `${isFavorite ? '❤️' : '🤍'}` (regel 106)
- Callback functions: Gebruikt door de hele code, vooral bij event handlers
- Promises: Gebruikt met fetch API, bijv., in `fetchPokemon()` (regel 7-32)
- Async & Await: Gebruikt voor asynchrone operaties, bijv., in `fetchPokemon()` (regel 7-32)
- Observer API: Geïmplementeerd voor kaartanimaties in `setupCardObserver()` (regel 415-438)

### Data & API

- Fetch API: Gebruikt om data op te halen van PokéAPI in `fetchPokemon()` (regel 7-32)
- JSON manipulatie: Verwerking van API-responses, bijv., `const data = await response.json()` (regel 10)

### Opslag & Validatie

- Formulier validatie: Invoervalidatie voor zoeken
- LocalStorage: Gebruikt om favoriete Pokémon op te slaan in `toggleFavorite()` (regel 61) en op te halen in `getFavorites()` (regel 51-59)

### Styling & Layout

- Layout: Flexibele kaartgebaseerde layout voor Pokémon-weergave
- Gebruiksvriendelijke elementen: Harticoontjes voor favorieten, gedetailleerde modal voor meer informatie

### Tooling & Structuur

- Project setup: Opgezet met Vite
- Folderstructuur: Goede organisatie met src folder die main.js en style.css bevat

## Gebruikte API

[PokéAPI](https://pokeapi.co/) - Een RESTful API voor Pokémon-gegevens

## Installatiehandleiding

1. Kloon de repository:

   ```
   git clone https://github.com/LarsCowe/pokex-project.git
   cd pokex-project
   ```

2. Installeer dependencies:

   ```
   npm install
   ```

3. Start de ontwikkelingsserver:

   ```
   npm run dev
   ```

4. Open je browser en navigeer naar de URL die in de terminal wordt weergegeven

## Screenshots

![image](https://github.com/user-attachments/assets/240b01de-3377-4557-bb55-0de37f421395)
![image](https://github.com/user-attachments/assets/9d607084-b4ed-4284-a427-bec7fa92781d)



## Gebruikte Bronnen

- [PokéAPI Documentatie](https://pokeapi.co/docs/v2)
- [MDN Web Docs - JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [MDN Web Docs - Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [W3Schools - Modals](https://www.w3schools.com/howto/howto_css_modals.asp )
- [W3Schools - LocalStorage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)

### AI Gebruik

- https://chatgpt.com/share/6829d22e-c4b8-8001-9844-7723aab6de18 - Observer API
- https://chatgpt.com/share/6829d35f-0e5c-8001-a66d-ae973d4de6ae - Filteren en sorteren

Bij problemen tijdens het coderen heb ik gebruik gemaakt van Github Copilot.

## Auteur

Lars Cowé
