const API = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true";

let coinData = [];

// Load data from API or localStorage
async function loadData() {
  try {
    const res = await fetch(API);
    if(!res.ok) throw "API error";
    const data = await res.json();
    localStorage.setItem("predictionCoins", JSON.stringify(data));
    coinData = data;
    console.log("Loaded data from API");
    displayCoins();
  } catch(e) {
    console.log("Using cached data");
    const cached = localStorage.getItem("predictionCoins");
    if(cached) {
      coinData = JSON.parse(cached);
      displayCoins();
    } else {
      console.log("No data available");
    }
  }
}

// Calculate circles, highest percentage, description, sum gain/loss
function processCoin(coin, days) {
  const prices = coin.sparkline_in_7d.price.slice(-10); // last 10 prices
  const xDays = prices.slice(-days-1); // get x days differences
  const dailyChange = [];
  for(let i=1;i<xDays.length;i++){
    dailyChange.push(((xDays[i]-xDays[i-1])/xDays[i-1])*100);
  }

  const totalSum = dailyChange.reduce((a,b)=>a+Math.abs(b),0);
  const gainSum = dailyChange.filter(v=>v>0).reduce((a,b)=>a+b,0);
  const lossSum = dailyChange.filter(v=>v<0).reduce((a,b)=>a+Math.abs(b),0);

  const gainPercent = (gainSum/totalSum)*100;
  const lossPercent = (lossSum/totalSum)*100;
  const highestPercent = Math.max(gainPercent, lossPercent);

  // Reversal-aware description
  let description = "";
  if(highestPercent === gainPercent && gainPercent > 60) {
      description = "Price may drop / pullback likely ⚠️";
  } else if(highestPercent === lossPercent && lossPercent > 60) {
      description = "Price may start to rise because it is dropping abnormally 🔄";
  } else {
      description = "Stable / mixed trend ⚖️";
  }

  const circles = dailyChange.map(v=>v>=0?"green":"red");

  return { circles, highestPercent, description, dailyChange, gainSum, lossSum };
}

// Display coins
function displayCoins() {
  const container = document.getElementById("coinsContainer");
  container.innerHTML = "";
  const days = parseInt(document.getElementById("daySelect").value);

  coinData.forEach(coin=>{
    const { circles, highestPercent, description, dailyChange, gainSum, lossSum } = processCoin(coin, days);

    const circlesHTML = circles.map(c=>`<span class="circle ${c}"></span>`).join("");

    const html = `
      <div class="card-coin">
        <div class="coin-header">
          <img class="coin-logo" src="${coin.image}">
          <b>${coin.symbol.toUpperCase()}</b>
        </div>
        <div class="circles">${circlesHTML}</div>
        <div style="margin-bottom:4px;">Sum Gain: ${gainSum.toFixed(2)}% | Sum Loss: ${lossSum.toFixed(2)}%</div>
        <button class="percentage-btn">${highestPercent.toFixed(2)}%</button>
        <div class="description">${description}</div>
        <canvas id="chart-${coin.id}" height="50"></canvas>
      </div>
    `;
    container.innerHTML += html;
  });

  // After DOM updated, draw all charts
  coinData.forEach(coin=>{
    const ctx = document.getElementById(`chart-${coin.id}`);
    if(!ctx) return;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: coin.sparkline_in_7d.price.map((_,i)=>i),
        datasets:[{
          data: coin.sparkline_in_7d.price,
          borderColor: "#4caf50",
          borderWidth:1,
          fill:false,
          pointRadius:0
        }]
      },
      options:{
        responsive:true,
        plugins:{legend:{display:false}},
        scales:{x:{display:false},y:{display:false}}
      }
    });
  });
}

// Event listener for days selector
document.getElementById("daySelect").addEventListener("change", displayCoins);

// Initialize
loadData();