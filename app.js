// FIREBASE
const firebaseConfig = {
apiKey:"AIzaSyBgaIaZQtCnYvVnDJ9WSGjAdJ25gJBVSew",
databaseURL:"https://chefystudios-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.database();

let user="",bal=0,port={};

// STOCKS
const stocks=["TSLA","AAPL","GOOGL","AMZN","MSFT","META","NFLX","NVDA","BABA","ORCL","INTC","AMD","IBM","SONY","UBER","SHOP","ADBE","PYPL","CRM","DIS","KO","PEP","WMT","NKE"];

stocks.forEach(s=>{
let o=document.createElement("option");
o.text=s;
document.getElementById("stock").add(o);
});

// LOGIN
function login(){
let u=user=document.getElementById("user").value;
let p=document.getElementById("pass").value;

if((u==="Virat"&&p==="1234")||(u==="YUG1ADMIN"&&p==="4231")){
loadUser();
if(u==="Virat"||u==="YUG1ADMIN"){
document.getElementById("adminBtn").style.display="block";
}
}else alert("Wrong login");
}

// LOAD USER
function loadUser(){
db.ref("users/"+user).once("value",snap=>{
if(!snap.exists()){
db.ref("users/"+user).set({bal:10000,port:{}});
}

db.ref("users/"+user).on("value",s=>{
let d=s.val();
bal=d.bal; port=d.port||{};
update();
});
});
}

// UPDATE UI
function update(){
document.getElementById("bal").innerText=bal;

let t="";
for(let k in port){t+=k+":"+port[k]+"<br>";}
document.getElementById("port").innerHTML=t;

// leaderboard
db.ref("users").once("value",snap=>{
let arr=[];
snap.forEach(s=>arr.push({u:s.key,b:s.val().bal}));
arr.sort((a,b)=>b.b-a.b);

let h="";
arr.slice(0,5).forEach(x=>h+=x.u+" ₹"+x.b+"<br>");
document.getElementById("leader").innerHTML=h;
});
}

// BUY SELL
function buy(){
let s=stock.value,a=+amt.value;
let fee=a*0.02;
if(bal<a+fee) return alert("No money");

bal-=a+fee;
port[s]=(port[s]||0)+a;
save();
}

function sell(){
let s=stock.value,a=+amt.value;
if((port[s]||0)<a) return alert("No stock");

let tax=a*0.01;
bal+=a-tax;
port[s]-=a;
save();
}

function save(){
db.ref("users/"+user).update({bal:bal,port:port});
}

// MONEY TRANSFER
function sendMoney(){
let t=toUser.value,a=+sendAmt.value;
if(bal<a) return alert("No money");

db.ref("users/"+t).once("value",snap=>{
if(!snap.exists()) return alert("User not found");

bal-=a;
db.ref("users/"+t+"/bal").set(snap.val().bal+a);
save();
});
}

// CHAT
function sendMsg(){
db.ref("chat").push({u:user,t:msg.value});
}

db.ref("chat").on("child_added",s=>{
chat.innerHTML+=s.val().u+": "+s.val().t+"<br>";
});

// PRIVATE CHAT
function sendPrivate(){
db.ref("pm/"+puser.value).push({u:user,t:pmsg.value});
}

// ADMIN
function admin(){
let c=prompt("Command");

if(c.startsWith("ban")){
let t=c.split(" ")[1];
if(t==="Virat") return alert("Cannot ban main admin");

db.ref("banned/"+t).set(true);
alert("Banned");
}

if(c.startsWith("reset")){
let t=c.split(" ")[1];
db.ref("users/"+t).set({bal:10000,port:{}});
}
}

// CHART
const chart=LightweightCharts.createChart(document.getElementById("chart"));
const series=chart.addCandlestickSeries();

let price=100;

setInterval(()=>{
let o=price,c=o+(Math.random()*10-5);
let h=Math.max(o,c)+5,l=Math.min(o,c)-5;
price=c;

series.update({time:Date.now()/1000,o,h,l,c});
},1500);
