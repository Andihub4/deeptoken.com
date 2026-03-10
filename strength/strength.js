const barContainer = document.getElementById("barContainer");
const excludeSelect = document.getElementById("excludeSelect");
const replaceSelect = document.getElementById("replaceSelect");
const replaceBtn = document.getElementById("replaceBtn");

const apiUrl = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1";
const storageKey = "verticalGrowthCache";
const cacheDuration = 60 * 1000;

let coins = [];
let allCoins = [];
const colors = { gain: '#4caf50', loss: '#f44336' };

// Fetch coins
async function fetchCoins() {
    try {
        const cached = JSON.parse(localStorage.getItem(storageKey) || "null");
        const now = Date.now();

        if(cached && cached.timestamp && (now - cached.timestamp < cacheDuration)){
            console.log("Loaded coins from cache");
            allCoins = cached.coins;
            initDisplay();
            return;
        }

        const res = await fetch(apiUrl);
        const data = await res.json();
        allCoins = data;

        localStorage.setItem(storageKey, JSON.stringify({ coins: allCoins, timestamp: now }));
        console.log("Fetched coins from API");
        initDisplay();
    } catch(err){
        console.error("Failed fetch or cache", err);
        const fallback = JSON.parse(localStorage.getItem(storageKey) || "null");
        if(fallback && fallback.coins){
            console.log("Loaded fallback cache");
            allCoins = fallback.coins;
            initDisplay();
        }
    }
}

// Initialize display
function initDisplay(){
    coins = allCoins.slice(0,5).map(c => ({ ...c, todayChange: c.price_change_percentage_24h }));
    populateSelects();
    drawBars();
}

// Populate dropdowns
function populateSelects(){
    excludeSelect.innerHTML = '';
    replaceSelect.innerHTML = '';
    allCoins.forEach(c => {
        const opt1 = document.createElement("option");
        opt1.value = c.id;
        opt1.textContent = c.symbol.toUpperCase();
        excludeSelect.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = c.id;
        opt2.textContent = c.symbol.toUpperCase();
        replaceSelect.appendChild(opt2);
    });
}

// Draw bars
function drawBars(){
    barContainer.innerHTML = '';
    coins.forEach(c => {
        const bar = document.createElement("div");
        bar.className = "bar";
        const height = Math.min(Math.abs(c.todayChange)*50, 250);
        bar.style.height = height + "px";
        bar.style.background = c.todayChange >=0 ? colors.gain : colors.loss;

        const value = document.createElement("div");
        value.className = "bar-value";
        value.textContent = c.todayChange.toFixed(2) + "%";

        const label = document.createElement("div");
        label.className = "bar-label";
        label.textContent = c.symbol.toUpperCase();

        bar.appendChild(value);
        bar.appendChild(label);
        barContainer.appendChild(bar);
    });
}

// Animate bar heights slightly to simulate live movement
function animateBars(){
    coins.forEach(c => {
        // small random fluctuation
        c.todayChange += (Math.random()-0.5)*0.2;
    });
    drawBars();
}

// Replace coin functionality
replaceBtn.addEventListener("click", ()=>{
    const exclude = excludeSelect.value;
    const replace = replaceSelect.value;
    if(!replace || !exclude) return;

    coins = coins.filter(c => c.id !== exclude);
    const newCoin = allCoins.find(c => c.id === replace && !coins.find(x=>x.id===replace));
    if(newCoin) coins.push({...newCoin, todayChange: newCoin.price_change_percentage_24h});
    drawBars();
});

// Animate bars every second
setInterval(animateBars, 500);

// Initial fetch
fetchCoins();