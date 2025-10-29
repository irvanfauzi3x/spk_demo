// app.js - small helpers and demo logic

// Demo Chart on dashboard
function renderRankingChart(ctxId){
  const ctx = document.getElementById(ctxId);
  if(!ctx) return;
  const labels = ['Ahmad','Siti','Budi','Rina','Dewi'];
  const data = [0.88,0.79,0.74,0.71,0.65];
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Nilai Preferensi',
        data,
        borderWidth:1,
        backgroundColor:'rgba(13,110,253,0.75)'
      }]
    },
    options: { scales: { y: { beginAtZero:true, max:1 } } }
  });
}

// Simple client-side "login" (demo only)
function attachLogin(){
  const form = document.getElementById('loginForm');
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    // demo: no real auth
    window.location.href = 'dashboard.html';
  });
}

// Demo: build sample table rows for Data Siswa
function populateStudents(){
  const tbody = document.querySelector('#studentsTable tbody');
  if(!tbody) return;
  const sample = [
    {nama:'Ahmad Fauzan', kelas:'XII RPL', sikap:85, pengetahuan:90, prakerin:88, alpha:5, ekstrakurikuler:80},
    {nama:'Siti Nur', kelas:'XII TKJ', sikap:82, pengetahuan:86, prakerin:84, alpha:2, ekstrakurikuler:78},
    {nama:'Budi Santoso', kelas:'XII RPL', sikap:80, pengetahuan:79, prakerin:82, alpha:7, ekstrakurikuler:70},
    {nama:'Rina Sari', kelas:'XI AKL', sikap:88, pengetahuan:84, prakerin:80, alpha:1, ekstrakurikuler:85},
    {nama:'Dewi Lestari', kelas:'XII MM', sikap:75, pengetahuan:80, prakerin:76, alpha:4, ekstrakurikuler:72}
  ];
  tbody.innerHTML = '';
  sample.forEach((s,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td>
      <td>${s.nama}</td>
      <td>${s.kelas}</td>
      <td>${s.sikap}</td>
      <td>${s.pengetahuan}</td>
      <td>${s.prakerin}</td>
      <td>${s.alpha}</td>
      <td>${s.ekstrakurikuler}</td>
      <td>
        <button class="btn btn-sm btn-warning">Edit</button>
        <button class="btn btn-sm btn-danger">Hapus</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

// AHP matrix demo: compute normalized weights (geometric mean)
function computeAHP(){
  // find inputs with data-row,data-col
  const inputs = document.querySelectorAll('.ahp-matrix input');
  if(!inputs.length) return;
  const n = +document.querySelector('.ahp-matrix').dataset.n;
  // build matrix
  const M = Array.from({length:n}, ()=>Array(n).fill(1));
  inputs.forEach(inp=>{
    const r = +inp.dataset.r;
    const c = +inp.dataset.c;
    M[r][c] = parseFloat(inp.value) || 1;
    M[c][r] = +(1 / M[r][c]).toFixed(4);
  });
  // geometric mean per row
  const gm = M.map(row=>{
    const prod = row.reduce((a,b)=>a*b,1);
    return Math.pow(prod, 1/n);
  });
  const sumGm = gm.reduce((a,b)=>a+b,0);
  const weights = gm.map(v => +(v / sumGm).toFixed(4));
  // display
  const out = document.getElementById('ahpWeights');
  out.innerHTML = weights.map((w,i)=>`<div><strong>W${i+1}:</strong> ${w}</div>`).join('');
  // rough CR calc skipped (demo)
}

// TOPSIS demo: compute preference scores with sample weights
function computeTopsis(){
  // read table rows
  const rows = document.querySelectorAll('#studentsTable tbody tr');
  if(!rows.length) return;
  // simple weights from AHP demo or default
  const weights = [0.25,0.30,0.20,0.10,0.15]; // sikap,pengetahuan,prakerin,alpha,ekstra
  const data = [];
  rows.forEach(r=>{
    const cells = r.querySelectorAll('td');
    const record = {
      nama: cells[1].textContent,
      sikap: +cells[3].textContent,
      pengetahuan: +cells[4].textContent,
      prakerin: +cells[5].textContent,
      alpha: +cells[6].textContent,
      ekstra: +cells[7].textContent
    };
    data.push(record);
  });
  // normalization (vector) and weighted sum as simplistic score
  const max = {
    sikap: Math.max(...data.map(d=>d.sikap)),
    pengetahuan: Math.max(...data.map(d=>d.pengetahuan)),
    prakerin: Math.max(...data.map(d=>d.prakerin)),
    alpha: Math.max(...data.map(d=>d.alpha)),
    ekstra: Math.max(...data.map(d=>d.ekstra))
  };
  const scores = data.map(d=>{
    // note: alpha is 'ketidakhadiran' (cost) -> smaller is better, so invert
    const s1 = (d.sikap / max.sikap);
    const s2 = (d.pengetahuan / max.pengetahuan);
    const s3 = (d.prakerin / max.prakerin);
    const s4 = (1 - (d.alpha / max.alpha)); // invert
    const s5 = (d.ekstra / max.ekstra);
    const score = +(weights[0]*s1 + weights[1]*s2 + weights[2]*s3 + weights[3]*s4 + weights[4]*s5).toFixed(4);
    return {nama:d.nama,score};
  });
  scores.sort((a,b)=>b.score - a.score);
  // render result table
  const tbody = document.querySelector('#topsisResult tbody');
  tbody.innerHTML = '';
  scores.forEach((s,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${s.nama}</td><td>${s.score}</td>`;
    tbody.appendChild(tr);
  });
}

// init on pages
document.addEventListener('DOMContentLoaded', ()=>{
  attachLogin();
  renderRankingChart('chartRanking');
  populateStudents();
  const ahpBtn = document.getElementById('ahpCompute');
  if(ahpBtn) ahpBtn.addEventListener('click', computeAHP);
  const topsisBtn = document.getElementById('topsisCompute');
  if(topsisBtn) topsisBtn.addEventListener('click', computeTopsis);
});
