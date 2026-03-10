const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=7d";

async function fetchWeeklyTop30() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("API failed");

    const data = await res.json();
    localStorage.setItem("weeklyTopData", JSON.stringify(data));
    console.log("Loaded data from API");
    displayTop30(data);

  } catch (error) {
    console.log("API failed, loading from localStorage");
    const cached = localStorage.getItem("weeklyTopData");
    if (cached) {
      const data = JSON.parse(cached);
      console.log("Loaded data from localStorage");
      displayTop30(data);
    } else {
      console.log("No cached data available");
    }
  }
}

function displayTop30(data) {
  const filtered = data.filter(c => c.price_change_percentage_7d_in_currency !== null);

  const sorted = filtered
    .sort((a,b) => b.price_change_percentage_7d_in_currency - a.price_change_percentage_7d_in_currency)
    .slice(0,30);

  const container = document.querySelector(".weekly-rank-container");
  container.innerHTML = "";

  const maxPositive = Math.max(...sorted.map(c => Math.max(c.price_change_percentage_7d_in_currency, 0)));
  const maxNegative = Math.min(...sorted.map(c => Math.min(c.price_change_percentage_7d_in_currency, 0)));

  sorted.forEach((coin, index) => {
    const row = document.createElement("div");
    row.className = "coin-row";

    // Rank number
    const rankSpan = document.createElement("span");
    rankSpan.className = "coin-rank";
    rankSpan.textContent = (index + 1) + ".";
    row.appendChild(rankSpan);

    // Short name
    const shortSpan = document.createElement("span");
    shortSpan.className = "coin-short";
    shortSpan.textContent = coin.symbol.toUpperCase();
    row.appendChild(shortSpan);

    // Logo
    const img = document.createElement("img");
    img.src = coin.image;
    img.className = "coin-img";
    row.appendChild(img);

    // Progress bar
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar-custom";

    const fill = document.createElement("div");
    fill.className = "progress-fill";

    let widthPercent;
    if(coin.price_change_percentage_7d_in_currency >= 0) {
      widthPercent = (coin.price_change_percentage_7d_in_currency / maxPositive) * 100;
      fill.style.background = "#4caf50"; // green
    } else {
      widthPercent = (coin.price_change_percentage_7d_in_currency / maxNegative) * 100;
      fill.style.background = "#f44336"; // red
    }
    fill.style.width = `${widthPercent}%`;

    const intensity = Math.max(1, 12 - (index * 0.3));
    const glowColor = coin.price_change_percentage_7d_in_currency >= 0 ? "#00ff00" : "#ff0000";
    fill.style.boxShadow = `0 0 ${intensity*2}px ${glowColor}`;

    progressBar.appendChild(fill);
    row.appendChild(progressBar);

    // Growth % value
    const growthValue = document.createElement("span");
    growthValue.className = "growth-value";
    growthValue.textContent = coin.price_change_percentage_7d_in_currency.toFixed(2) + "%";
    row.appendChild(growthValue);

    container.appendChild(row);
  });
}

// Fetch top 30 weekly coins
fetchWeeklyTop30();