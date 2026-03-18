// FIREBASE
const firebaseConfig = {
  apiKey:"AIzaSyBgaIaZQtCnYvVnDJ9WSGjAdJ25gJBVSew",
  databaseURL:"https://chefystudios-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let user="", bal=0, port={};

// STOCKS
const stocks=["TSLA","AAPL","GOOGL","AMZN","MSFT","META","NFLX","NVDA"];

stocks.forEach(s=>{
  let o=document.createElement("option");
  o.text=s;
  document.getElementById("stock").add(o);
});

// LOGIN
function login(){
  let u=document.getElementById("user").value;
  let p=document.getElementById("pass").value;

  if((u==="Virat"&&p==="1234")||(u==="YUG1ADMIN"&&p==="4231")){
    user=u;
    loadUser();

    if(u==="Virat"||u==="YUG1ADMIN"){
      document.getElementById("adminBtn").style.display="block";
    }
  }else{
    alert("Wrong login");
  }
}

// LOAD USER
function loadUser(){
  db.ref("users/"+user).once("value",snap=>{
    if(!snap.exists()){
      db.ref("users/"+user).set({bal:10000,port:{}});
    }

    db.ref("users/"+user).on("value",s=>{
      let d=s.val();
      bal=d.bal;
      port=d.port||{};
      update();
    });
  });
}

// UPDATE UI
function update(){
  document.getElementById("bal").innerText=bal;

  let t="";
  for(let k in port){
    t+=k+": "+port[k]+"<br>";
  }
  document.getElementById("port").innerHTML=t||"No stocks";
}

// BUY
function buy(){
  let s=stock.value;
  let a=parseInt(amt.value);

  if(!a) return;

  let fee=a*0.02;

  if(bal<a+fee){
    alert("No money");
    return;
  }

  bal-=a+fee;
  port[s]=(port[s]||0)+a;

  save();
}

// SELL
function sell(){
  let s=stock.value;
  let a=parseInt(amt.value);

  if(!a) return;

  if((port[s]||0)<a){
    alert("No stock");
    return;
  }

  let tax=a*0.01;

  port[s]-=a;
  bal+=a-tax;

  save();
}

// SAVE
function save(){
  db.ref("users/"+user).update({
    bal:bal,
    port:port
  });
}

// CHAT
function sendMsg(){
  let text=msg.value;
  if(!text) return;

  db.ref("chat").push({
    u:user,
    t:text
  });

  msg.value="";
}

db.ref("chat").on("child_added",snap=>{
  let d=snap.val();
  chat.innerHTML+=d.u+": "+d.t+"<br>";
});

// MONEY
function sendMoney(){
  let t=toUser.value;
  let a=parseInt(sendAmt.value);

  if(!a || bal<a){
    alert("No money");
    return;
  }

  db.ref("users/"+t).once("value",snap=>{
    if(!snap.exists()){
      alert("User not found");
      return;
    }

    bal-=a;
    db.ref("users/"+t+"/bal").set(snap.val().bal + a);
    save();
  });
}

// ADMIN
function admin(){
  let c=prompt("Command");

  if(!c) return;

  if(c.startsWith("ban")){
    let t=c.split(" ")[1];

    if(t==="Virat"){
      alert("Cannot ban main admin");
      return;
    }

    db.ref("banned/"+t).set(true);
    alert("User banned");
  }
}

// 🔥 FIXED CHART (MAIN BUG FIX)
const chartContainer = document.getElementById("chart");

const chart = LightweightCharts.createChart(chartContainer, {
  width: chartContainer.clientWidth,
  height: 250,
  layout: {
    background: { color: "#0b0f1a" },
    textColor: "#ffffff"
  },
  grid: {
    vertLines: { color: "rgba(255,255,255,0.05)" },
    horzLines: { color: "rgba(255,255,255,0.05)" }
  }
});

const series = chart.addCandlestickSeries();

let candleData = [];
let price = 100;

// INITIAL LOAD (IMPORTANT FIX)
for(let i=0;i<30;i++){
  let open = price;
  let close = open + (Math.random()*10-5);
  let high = Math.max(open, close)+3;
  let low = Math.min(open, close)-3;

  candleData.push({
    time: Math.floor(Date.now()/1000)-(30-i)*60,
    open, high, low, close
  });

  price = close;
}

series.setData(candleData);

// LIVE UPDATE
setInterval(()=>{
  let open = price;
  let close = open + (Math.random()*10-5);
  let high = Math.max(open, close)+3;
  let low = Math.min(open, close)-3;

  price = close;

  series.update({
    time: Math.floor(Date.now()/1000),
    open, high, low, close
  });

}, 2000);

// FIX RESIZE BUG
window.addEventListener("resize", ()=>{
  chart.applyOptions({
    width: chartContainer.clientWidth
  });
});
