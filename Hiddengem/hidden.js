const API =
"https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true";

async function loadCoins(){

try{

let res = await fetch(API);

if(!res.ok) throw "API error";

let data = await res.json();

localStorage.setItem("hiddenCoins",JSON.stringify(data));

console.log("Loaded from API");

processCoins(data);

}

catch(e){

console.log("Using cached data");

let cache = localStorage.getItem("hiddenCoins");

if(cache){

processCoins(JSON.parse(cache));

}else{

console.log("No cached data");

}

}

}

function processCoins(data){

let results=[];

data.forEach(coin=>{

let prices = coin.sparkline_in_7d.price;

if(!prices) return;

let daily=[];

for(let i=1;i<=7;i++){

let p1 = prices[prices.length-(i+1)];
let p2 = prices[prices.length-i];

let change = ((p2-p1)/p1)*100;

daily.unshift(change);

}

let total7 = daily.reduce((a,b)=>a+b,0);

let avgWeek = total7;

let speed = total7 + avgWeek;

results.push({

symbol:coin.symbol.toUpperCase(),
logo:coin.image,
price:coin.current_price,
daily,
avg:avgWeek,
speed

});

});

results.sort((a,b)=>b.speed-a.speed);

display(results.slice(0,100));

}

function display(list){

let container=document.getElementById("coins");

container.innerHTML="";

list.forEach((c,i)=>{

let labels = `
<div class="days">
D1&nbsp;&nbsp;&nbsp;&nbsp;D2&nbsp;&nbsp;&nbsp;&nbsp;D3&nbsp;&nbsp;&nbsp;&nbsp;D4&nbsp;&nbsp;&nbsp;&nbsp;D5&nbsp;&nbsp;&nbsp;&nbsp;D6&nbsp;&nbsp;&nbsp;&nbsp;D7
</div>
`;

let values = c.daily.map(v=>{

let cls = v>=0 ? "green" : "red";

return `<span class="${cls}" style="margin-right:16px">${v.toFixed(1)}</span>`;

}).join("");

let html=`

<div class="card">

<div class="rank">${i+1}</div>

<img class="logo" src="${c.logo}">

<div class="name">${c.symbol}</div>

${labels}

<div class="days">% ${values}</div>

<div class="info">AVG: ${c.avg.toFixed(2)}%/week</div>

<div class="info">CP : $${c.price}</div>

</div>

`;

container.innerHTML+=html;

});

}

loadCoins();