const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

// CONFIG GANTI PUNYA LU
const BOT_TOKEN = "ISI_TOKEN_BOT_LU";
const API_KEY_NOKOS = "ISI_APIKEY_5SIM/SMSHUB LU"; // ambil di dashboard provider
const OWNER_ID = 123456789;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("🎰 BOT GACHA NOKOS ONLINE");

// DATABASE HARGA & LAYANAN
const LAYANAN = {
  wa: "whatsapp",
  tg: "telegram",
  fb: "facebook",
  ig: "instagram",
  ml: "google" // buat ML biasanya pake google
}

// FUNGSI GACHA
async function gachaNokos(service = "whatsapp", country = "indonesia") {
  try {
    // CONTOH PAKE API 5SIM - GANTI SESUAI PROVIDER LU
    // Dokumentasi: https://5sim.net/docs
    let res = await axios.get(`https://5sim.net/v1/guest/products/${country}/${service}`, {
      headers: { Authorization: `Bearer ${API_KEY_NOKOS}` }
    });

    let data = res.data;
    if(!data || Object.keys(data).length === 0) return { status: false, msg: "Stok kosong bos!" };

    // GACHA RANDOM OPERATOR
    let operators = Object.keys(data);
    let randomOp = operators[Math.floor(Math.random() * operators.length)];
    let stock = data[randomOp];

    return {
      status: true,
      service: service,
      country: country,
      operator: randomOp,
      price: stock.cost,
      count: stock.count,
      msg: `🎰 DAPET NOKOS!\n📱 Layanan: ${service}\n🌍 Negara: ${country}\n📶 Operator: ${randomOp}\n💰 Harga: ${stock.cost} RUB\n📦 Stok: ${stock.count}`
    };
  } catch(e) {
    return { status: false, msg: "❌ Gagal gacha: " + (e.response?.data || e.message) };
  }
}

bot.onText(/\/start/, (msg)=>{
  if(msg.from.id!==OWNER_ID) return;
  bot.sendMessage(msg.chat.id, `🎰 *BOT GACHA NOKOS*\n\n/gacha wa - gacha nokos WA indo\n/gacha tg - gacha nokos TELE indo\n/gacha wa rusia - gacha WA rusia\n/ceknokos wa - cek stok WA\n/buy wa - beli 1 nomor\n\nNegara: indonesia, rusia, vietnam, usa\nLayanan: wa,tg,fb,ig`, {parse_mode:"Markdown"})
});

bot.onText(/\/gacha(?: (.+))?/, async (msg, match)=>{
  if(msg.from.id!==OWNER_ID) return;
  let args = (match[1] || "wa").split(' ');
  let service = LAYANAN[args[0]] || args[0] || "whatsapp";
  let country = args[1] || "indonesia";

  let loading = await bot.sendMessage(msg.chat.id, `🎰 Lagi gacha ${service} ${country}...`);
  let hasil = await gachaNokos(service, country);

  bot.editMessageText(hasil.msg, {chat_id: msg.chat.id, message_id: loading.message_id, parse_mode: "Markdown"});
});

bot.onText(/\/ceknokos (.+)/, async (msg, match)=>{
  let service = LAYANAN[match[1]] || match[1];
  let hasil = await gachaNokos(service, "indonesia");
  bot.sendMessage(msg.chat.id, hasil.msg);
});

// BUAT VERSI WEB SIMPLE BIAR BISA GACHA DI BROWSER
// File gacha.html
/*
<!DOCTYPE html>
<html><body>
<h2>🎰 GACHA NOKOS</h2>
<button onclick="gacha()">GACHA WA INDO</button>
<div id="hasil"></div>
<script>
async function gacha(){
  document.getElementById('hasil').innerHTML = "Loading...";
  // panggil API lu sendiri di /api/gacha
  let res = await fetch('/api/gacha?service=whatsapp&country=indonesia');
  let data = await res.json();
  document.getElementById('hasil').innerHTML = JSON.stringify(data, null, 2);
}
</script>
</body></html>
*/
