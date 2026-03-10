const apiUrl =
"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true";

async function fetchCrypto() {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error("API failed");

    const data = await res.json();

    // Update localStorage
    localStorage.setItem("cryptoData", JSON.stringify(data));
    console.log("Loaded data from API");

    displayTopCoins(data);

  } catch (error) {
    console.log("API failed, loading from localStorage");

    const cached = localStorage.getItem("cryptoData");
    if (cached) {
      const data = JSON.parse(cached);
      displayTopCoins(data);
    } else {
      console.log("No cached data available");
      document.getElementById("trending").innerHTML = "N/A";
      document.getElementById("trending0").innerHTML = "N/A";
      document.getElementById("h").textContent = "N/A";
      document.getElementById("l").textContent = "N/A";
    }
  }
}

function displayTopCoins(data) {
  // Top Gainer
  const topGainer = [...data].sort(
    (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  )[0];

  // Top Loser
  const topLoser = [...data].sort(
    (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
  )[0];

  // ✅ Update paragraphs with short name (symbol)
  document.getElementById("h").textContent = topGainer.symbol.toUpperCase();
  document.getElementById("l").textContent = topLoser.symbol.toUpperCase();

  // Display Gainer card
  const gainerDiv = document.getElementById("trending");
  gainerDiv.innerHTML = `
    <div style="background-color: rgba(26, 36, 72, 1); color: white;"  class="card p-3 mb-3">
      <div class="d-flex align-items-center mb-2">
        <img src="${topGainer.image}" class="coin-img me-2">
        <b>${topGainer.name} (${topGainer.symbol.toUpperCase()})</b>
      </div>
      <p>Price: $${topGainer.current_price.toLocaleString()}</p>
      <p class="gain">24h Gain: ${topGainer.price_change_percentage_24h.toFixed(2)}%</p>
      <canvas id="chart-${topGainer.id}" height="50"></canvas>
    </div>
  `;

  new Chart(document.getElementById(`chart-${topGainer.id}`), {
    type: "line",
    data: {
      labels: topGainer.sparkline_in_7d.price.map((_, i) => i),
      datasets: [{
        data: topGainer.sparkline_in_7d.price,
        borderColor: "#4caf50",
        borderWidth: 2,
        fill: false,
        pointRadius: 0
      }]
    },
    options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
  });

  // Display Loser card
  const loserDiv = document.getElementById("trending0");
  loserDiv.innerHTML = `
    <div style="background-color: rgba(26, 36, 72, 1); color: white;" class="card p-3 mb-3">
      <div class="d-flex align-items-center mb-2">
        <img src="${topLoser.image}" class="coin-img me-2">
        <b>${topLoser.name} (${topLoser.symbol.toUpperCase()})</b>
      </div>
      <p>Price: $${topLoser.current_price.toLocaleString()}</p>
      <p class="loss">24h Loss: ${topLoser.price_change_percentage_24h.toFixed(2)}%</p>
      <canvas  id="chart-${topLoser.id}" height="50"></canvas>
    </div>
  `;

  new Chart(document.getElementById(`chart-${topLoser.id}`), {
    type: "line",
    data: {
      labels: topLoser.sparkline_in_7d.price.map((_, i) => i),
      datasets: [{
        data: topLoser.sparkline_in_7d.price,
        borderColor: "#f44336",
        borderWidth: 2,
        fill: false,
        pointRadius: 0
      }]
    },
    options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
  });
}

fetchCrypto();