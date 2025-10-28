/* ====== 0) Görsel havuzu ======
   assets klasöründe gerçek dosya adlarını kullan.
   isAI: true=Yapay Zekâ üretimi, false=İnsan (foto/çizim).
*/
const QUESTION_POOL = [
  { image:"assets/1.png",  isAI:true  },
  { image:"assets/2.png",  isAI:true},
  { image:"assets/3.png",  isAI:true  },
  { image:"assets/4.png",  isAI:true },
  { image:"assets/5.png",  isAI:true  },
  { image:"assets/6.png",  isAI:true },
  { image:"assets/7.png",  isAI:true  },
  { image:"assets/8.jpeg",  isAI:true },
  { image:"assets/9.png",  isAI:true  },
  { image:"assets/10.png", isAI:true },
  { image:"assets/11.png", isAI:true  },
  { image:"assets/12.jpeg", isAI:false },
  { image:"assets/13.jpeg", isAI:false  },
  { image:"assets/14.jpeg", isAI:false },
  { image:"assets/15.jpeg", isAI:false  },
  { image:"assets/16.jpeg", isAI:false },
  { image:"assets/17.png", isAI:false  },
  { image:"assets/18.jpeg", isAI:false },
  { image:"assets/19.jpeg", isAI:false  },
  { image:"assets/20.jpeg", isAI:false },
];

/* ====== 1) Gün anahtarı + localStorage ====== */
const todayKey = (() => {
  const d = new Date(), pad = n => String(n).padStart(2,"0");
  return `players_v4_${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;
})();
const norm = s => s.normalize("NFKD").replace(/\s+/g," ").trim().toLocaleLowerCase("tr");
const storage = {
  get(){ return JSON.parse(localStorage.getItem(todayKey)||"[]"); },
  save(rows){ localStorage.setItem(todayKey, JSON.stringify(rows)); },
  add(rec){ const r=this.get(); r.push(rec); this.save(r); },
  exists(name){ return this.get().some(p=>p.nameKey===norm(name)); },
  markRedeemed(name){
    const k=norm(name), r=this.get(); const i=r.findIndex(p=>p.nameKey===k);
    if(i>-1){ r[i].redeemed=true; this.save(r); }
  },
  clear(){ localStorage.removeItem(todayKey); }
};

/* ====== 2) Yardımcılar ====== */
const el = id => document.getElementById(id);
const shuffle = a => { for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pickSeven = () => shuffle([...QUESTION_POOL]).slice(0,7);
const prizeFor = score => {
  if(score <= 2) return "—";
  if(score <= 4) return "Kalem";
  if(score <= 6) return "Defter";
  return "Defter + Kalem";
};

/* ====== 3) Durum ====== */
let state = { player:null, picks:[], index:0, correct:0, answers:[] };

/* ====== 4) Ekran akışı ====== */
function showScreen(which){
  el("screen-start").style.display = which==="start"?"block":"none";
  el("screen-game").style.display  = which==="game" ?"block":"none";
  el("screen-end").style.display   = which==="end"  ?"block":"none";
}

function startGame(){
  const name = el("playerName").value.replace(/\s+/g," ").trim();
  if(!name){ alert("Lütfen adını yaz."); return; }
  if(storage.exists(name)){ alert("Bu isimle bugün zaten oynandı."); return; }

  state.player=name; state.picks=pickSeven(); state.index=0; state.correct=0; state.answers=[];
  el("who").textContent = "Oyuncu: " + name;
  el("bar").style.width = "0%";
  renderQuestion();
  showScreen("game");
}
function renderQuestion(){
  const q = state.picks[state.index];
  const img = el("qImage");

  // Kırpma yok — 'contain' CSS’te ayarlı. Yüklenemezse sıradakine geç.
  img.onload = () => {
    el("counter").textContent = `Soru ${state.index+1}/7`;
    el("bar").style.width = `${(state.index)/7*100}%`;
  };
  img.onerror = () => {
    console.warn("Görsel yüklenemedi:", q.image);
    nextQuestion(true);
  };
  img.src = q.image;
  img.style.cursor = 'zoom-in';
  img.onclick = () => openZoom(img.src);
}


function answer(isAI){
  const q = state.picks[state.index];
  const ok = (isAI === q.isAI);
  if(ok) state.correct++;
  state.answers.push({idx:state.index+1, isAI, correct:q.isAI});
  nextQuestion();
}
function nextQuestion(skip=false){
  if(!skip) state.index++;
  if(state.index >= state.picks.length){ finishGame(); return; }
  renderQuestion();
}
function finishGame(){
  el("bar").style.width = "100%";
  el("score").textContent = state.correct;
  const prize = prizeFor(state.correct);
  // Yanlış cevapları hazırla
  const wrongs = state.picks
    .map((q,i)=>{
      const ans = state.answers[i];
      const isCorrect = ans && ans.isAI === q.isAI;
      if(isCorrect) return null;
      const real = q.isAI ? "Yapay Zekâ" : "İnsan";
      return `
        <div class="wrong-item">
          <img src="${q.image}" alt="Yanlış ${i+1}" onclick="openZoom('${q.image}')">
          <p>${i+1}. Doğrusu: <b>${real}</b></p>
        </div>`;
    })
    .filter(Boolean)
    .join("");

  const wrongHtml = wrongs
    ? `<h3 style="margin-bottom:8px;">Yanlış Bildiklerin</h3><div class="wrong-list">${wrongs}</div>`
    : "<p>Hepsi doğru 🎉</p>";

  el("review").innerHTML = wrongHtml;

  storage.add({
    name: state.player,
    nameKey: norm(state.player),
    score: state.correct,
    prize,
    redeemed: false,
    ts: Date.now()
  });

  // konfeti (ödül varsa)
  if (prize !== "—") {
    confetti({
      particleCount: 200,
      spread: 70,
      startVelocity: 35,
      gravity: 0.8,
      origin: { y: 0.2 }
    });
  }

  showScreen("end");
}

/* ====== 5) CSV ve yönetim ====== */
function downloadCSV(){
  const rows = storage.get(); if(!rows.length){ alert("Bugün henüz kayıt yok."); return; }
  const header = "Ad Soyad,Saat,Skor,Ödül,Verildi\n";
  const body = rows.map(r=>{
    const time = new Date(r.ts).toLocaleString("tr-TR");
    const prizeTxt = r.prize==="—" ? "" : r.prize;
    return `"${r.name.replace(/"/g,'""')}",${time},${r.score},${prizeTxt},${r.redeemed?"Evet":"Hayır"}`;
  }).join("\n");
  const blob = new Blob([header+body], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=`katilimcilar_${todayKey}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

/* ====== 6) Eventler & Kısayollar ====== */
el("startBtn").onclick = startGame;
el("btnAI").onclick    = ()=>answer(true);
el("btnHuman").onclick = ()=>answer(false);
el("playAgain").onclick= ()=>{ el("playerName").value=""; showScreen("start"); };
el("downloadCsvBtn").onclick = downloadCSV;
el("clearPlayersBtn").onclick= ()=>{ if(confirm("Sadece bugünkü liste silinecek. Emin misin?")){ storage.clear(); alert("Temizlendi."); } };
el("markRedeemed").onclick   = ()=>{ storage.markRedeemed(state.player); alert("Ödül verildi olarak işaretlendi."); };

document.addEventListener("keydown",(e)=>{
  if(el("screen-game").style.display==="block"){
    const k=e.key.toLowerCase();
    if(k==="a") el("btnAI").click();
    if(k==="i"||k==="h") el("btnHuman").click();
  }
  if(e.shiftKey && e.key.toLowerCase()==="l"){
    const rows=storage.get();
    const txt = rows.length ? rows.map((r,i)=>`${i+1}. ${r.name} • ${r.score}/7 • ${(r.prize==="—"?"—":r.prize)} • ${r.redeemed?"✅":""}`).join("\n") : "(Kayıt yok)";
    alert(`Bugünkü Kayıtlar (${rows.length})\n\n${txt}`);
  }
});

// ==== Foto büyütme (lightbox) ====
const overlay = document.getElementById('zoomOverlay');
const zoomImg  = document.getElementById('zoomImg');

function openZoom(src){
  if(!overlay || !zoomImg) return;
  zoomImg.src = src;
  overlay.style.display = 'grid';
  document.body.classList.add('modal-open');
}
function closeZoom(){
  if(!overlay) return;
  overlay.style.display = 'none';
  zoomImg.src = '';
  document.body.classList.remove('modal-open');
}

// Arka plan tıkla → kapat
if (overlay) overlay.addEventListener('click', (e)=>{
  // sadece arka plana tıklandıysa kapat (foto tıklanırsa kapanmasın)
  if (e.target === overlay) closeZoom();
});
// ESC ile kapat
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && overlay && overlay.style.display !== 'none'){
    closeZoom();
  }
});

