const API = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_asc&per_page=50&page=1";
const STORAGE_KEY = "newProjectsData";
const UPDATE_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours

async function loadProjects() {
  let useCache = false;
  try {
    const lastUpdate = localStorage.getItem("projectsLastUpdate");
    if (lastUpdate && Date.now() - lastUpdate < UPDATE_INTERVAL) {
      useCache = true;
    }

    let data;
    if (useCache) {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      console.log("Loaded projects from localStorage (cached)");
    } else {
      const res = await fetch(API);
      data = await res.json();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem("projectsLastUpdate", Date.now());
      console.log("Loaded projects from API and saved to localStorage");
    }

    // Randomize the data
    shuffleArray(data);

    displayProjects(data);
  } catch (err) {
    console.log("API fetch failed, loading from cache if available");
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      shuffleArray(data);
      displayProjects(data);
    } else {
      console.log("No cached data available");
    }
  }
}

// Fisher-Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function displayProjects(list) {
  const container = document.getElementById("projectContainer");
  container.innerHTML = "";

  list.forEach(coin => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="logo" src="${coin.image}">
      <h3>${coin.name}</h3>
      <p>Symbol: ${coin.symbol.toUpperCase()}</p>
      <p>Price: $${coin.current_price.toLocaleString()}</p>
      <p>Market Cap Rank: ${coin.market_cap_rank || 'N/A'}</p>
      <a href="https://www.coingecko.com/en/coins/${coin.id}" target="_blank">
        <button>View Project</button>
      </a>
    `;
    container.appendChild(card);
  });
}

loadProjects();