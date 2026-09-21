/* ---------------------------------------------------------------
   ONCOmitra prototype — in-memory demo state (no backend, no storage)
---------------------------------------------------------------- */
const VILLAGES = ["Ambala City","Kaithal","Yamunanagar","Panchkula","Karnal","Kurukshetra"];
const ASHAS = ["Sunita Devi","Radha Kumari","Meena Sharma","Pooja Yadav"];
const STAGES = ["Screened","Risk Flagged","Referred","Hospital Visit","Biopsy","Diagnosed","Follow-up"];
const KANBAN_STAGES = ["Referred","Scheduled","Hospital Visit","Biopsy","Diagnosed","Follow-up"];
const SYMPTOMS = ["White/red patch","Non-healing ulcer (>2wks)","Difficulty chewing","Restricted mouth opening","Pain while swallowing","Lump in neck/mouth"];
const FIRST = ["Rekha","Suman","Anita","Geeta","Kavita","Rajesh","Suresh","Mahesh","Om Prakash","Vinod","Sarita","Poonam","Ramesh","Kiran","Deepak","Manju"];
const LAST = ["Devi","Kumari","Singh","Kumar","Yadav","Sharma","Verma","Rani"];

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function riskLevel(score){ return score>=70?"high":score>=40?"med":"low"; }
function fmtDate(d){ return d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}); }
function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d; }
function uid(){ return 'p'+Math.random().toString(36).slice(2,9); }

let patients = [];
(function seed(){
  for(let i=0;i<16;i++){
    const score = Math.floor(Math.random()*90)+8;
    const stageIdx = Math.min(Math.floor(Math.random()*7), 6);
    patients.push({
      id: uid(),
      name: FIRST[i%FIRST.length]+" "+LAST[(i*3)%LAST.length],
      age: 28 + Math.floor(Math.random()*45),
      gender: Math.random()>0.35?"Female":"Male",
      village: VILLAGES[i%VILLAGES.length],
      asha: ASHAS[i%ASHAS.length],
      risk: score,
      habit: ["None","Smokeless tobacco","Smoked tobacco","Areca nut","Both"][Math.floor(Math.random()*5)],
      stageIdx,
      updated: daysAgo(Math.floor(Math.random()*30)),
      notes: stageIdx>2 ? ["Initial hospital exam completed, biopsy advised."] : [],
      symptoms: SYMPTOMS.filter(()=>Math.random()>0.6)
    });
  }
})();

let state = { role:'clinician', theme:'dark', lang:'en', activeModal:null, riskFilter:'all', stageFilter:'all', sortKey:'updated', sortDir:'desc' };

let auditLog = [
  {text:"<b>Sunita Devi</b> completed a screening in Kaithal", time:"12 minutes ago"},
  {text:"<b>Dr. Rao</b> confirmed biopsy for Anita Kumari", time:"1 hour ago"},
  {text:"System flagged <b>3 patients</b> with no follow-up in 14 days", time:"3 hours ago"},
  {text:"<b>Radha Kumari</b> synced 5 offline records", time:"Yesterday"},
];

/* ---------------- Toasts ---------------- */
function toast(msg){
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className='toast';
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(),300); }, 2800);
}

/* ---------------- Demo login ---------------- */
const LS_I18N={
  en:{id:'ASHA ID or mobile',pw:'Password',btn:'Sign in securely',lang:'हिंदी',demo:'Demo: enter any ID and password',off:'Offline: sign-in uses this device’s saved credentials (demo)',
    err:'Enter your worker ID and password to continue.',bad:'Enter a valid ASHA/worker ID (4–20 letters or digits) or a 10-digit mobile number.',
    say:'Enter your ASHA ID or mobile number, choose your role, then enter your password.',
    roles:['ASHA worker','ANM','Frontline mobiliser','PHC Medical Officer','District NCD Cell','Programme admin']},
  hi:{id:'आशा आईडी या मोबाइल',pw:'पासवर्ड',btn:'सुरक्षित साइन इन',lang:'English',demo:'डेमो: कोई भी आईडी और पासवर्ड दर्ज करें',off:'ऑफ़लाइन: इस डिवाइस के सहेजे गए क्रेडेंशियल से साइन इन (डेमो)',
    err:'जारी रखने के लिए अपनी वर्कर आईडी और पासवर्ड दर्ज करें।',bad:'सही आशा/वर्कर आईडी (4–20 अक्षर या अंक) या 10 अंकों का मोबाइल नंबर दर्ज करें।',
    say:'अपनी आशा आईडी या मोबाइल नंबर दर्ज करें, अपनी भूमिका चुनें, फिर पासवर्ड डालें।',
    roles:['आशा कार्यकर्ता','एएनएम','फ्रंटलाइन मोबिलाइज़र','पीएचसी चिकित्सा अधिकारी','जिला एनसीडी सेल','कार्यक्रम व्यवस्थापक']}
};
function applyLoginLang(){
  const L=LS_I18N[state.lang]||LS_I18N.en,g=id=>document.getElementById(id);
  g('loginId').placeholder=L.id;g('loginPassword').placeholder=L.pw;g('lsLangBtn').textContent=L.lang;
  document.querySelector('#loginForm .ls-btn span').textContent=L.btn;
  [...g('loginRole').options].forEach((o,k)=>o.textContent=L.roles[k]);
  g('lsStatus').textContent=navigator.onLine?L.demo:L.off;g('loginError').textContent='';
}
document.getElementById('lsLangBtn').addEventListener('click',()=>{
  state.lang=state.lang==='hi'?'en':'hi';
  const ls=document.getElementById('langSwitch');ls.value=state.lang;ls.dispatchEvent(new Event('change'));
  applyLoginLang();
});
document.getElementById('lsAudioBtn').addEventListener('click',()=>{
  if(!window.speechSynthesis)return toast('Audio not supported on this device');
  const u=new SpeechSynthesisUtterance((LS_I18N[state.lang]||LS_I18N.en).say);
  u.lang=state.lang==='hi'?'hi-IN':'en-IN';speechSynthesis.cancel();speechSynthesis.speak(u);
});
addEventListener('online',applyLoginLang);addEventListener('offline',applyLoginLang);applyLoginLang();
document.getElementById('loginForm').addEventListener('submit', e=>{
  e.preventDefault();
  const idEl=document.getElementById('loginId'),pwEl=document.getElementById('loginPassword');
  const id=idEl.value.trim(),password=pwEl.value,error=document.getElementById('loginError'),L=LS_I18N[state.lang]||LS_I18N.en;
  if(!id||!password){error.textContent=L.err;(!id?idEl:pwEl).focus();return;}
  if(!/^(\d{10}|[A-Za-z0-9-]{4,20})$/.test(id)){error.textContent=L.bad;idEl.focus();return;}
  error.textContent='';
  const sel=document.getElementById('loginRole'),opt=sel.selectedOptions[0];
  const roleSwitch=document.getElementById('roleSwitch');
  roleSwitch.value=opt.dataset.view;
  roleSwitch.dispatchEvent(new Event('change'));
  document.getElementById('currentRoleLabel').textContent=opt.textContent;
  window.session={id,role:sel.value,view:opt.dataset.view};
  document.getElementById('loginScreen').style.display='none';
  pwEl.value='';
  toast(`Signed in as ${id}`+(navigator.onLine?'':' · offline mode: records save on this device'));
});
document.getElementById('signOutBtn').addEventListener('click', ()=>{
  location.reload(); return;
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginId').focus();
});
document.getElementById('forgotPasswordBtn').addEventListener('click', ()=>{
  toast('For this demo, use any worker ID and password to sign in.');
});

/* ---------------- Nav / tabs ---------------- */
document.getElementById('nav').addEventListener('click', e=>{
  const btn = e.target.closest('.nav-item');
  if(!btn) return;
  activateTab(btn.dataset.tab);
});
document.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>activateTab(b.dataset.goto)));
function activateTab(tab){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.tab===tab));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active', p.id==='panel-'+tab));
  if(tab==='analytics') setTimeout(renderCharts, 30);
}

/* ---------------- Theme / role / lang ---------------- */
function setTheme(dark){
  state.theme = dark?'dark':'light';
  document.body.setAttribute('data-theme', state.theme);
  document.getElementById('prefTheme').checked = dark;
}
document.getElementById('themeToggle').addEventListener('click', ()=> setTheme(state.theme==='light'));
document.getElementById('prefTheme').addEventListener('change', e=> setTheme(e.target.checked));

document.getElementById('roleSwitch').addEventListener('change', e=>{
  state.role = e.target.value;
  const labels = {admin:'Admin',asha:'ASHA worker',clinician:'Clinician',researcher:'Researcher'};
  document.getElementById('currentRoleLabel').textContent = labels[state.role];
  toast('Switched to '+labels[state.role]+' view');
});
document.getElementById('langSwitch').addEventListener('change', e=>{
  const hindi = e.target.value==='hi';
  document.getElementById('prefLang').checked = hindi;
  document.getElementById('voiceLabel').textContent = hindi? 'वॉइस इनटेक (हिंदी)':'Voice intake (Hindi)';
  toast(hindi? 'भाषा हिंदी में बदली गई' : 'Language set to English');
});
document.getElementById('prefLang').addEventListener('change', e=>{
  document.getElementById('langSwitch').value = e.target.checked?'hi':'en';
  document.getElementById('langSwitch').dispatchEvent(new Event('change'));
});

document.getElementById('dismissBanner').addEventListener('click', e=> e.target.closest('.banner').style.display='none');

document.getElementById('notifBtn').addEventListener('click', ()=>{
  document.getElementById('notifDot').style.display='none';
  toast('3 patients need follow-up · 1 biopsy result ready');
});
document.getElementById('helpBtn').addEventListener('click', ()=> toast('Tip: click any patient row to open their full journey.'));
document.getElementById('profileBtn').addEventListener('click', ()=> activateTab('settings') || document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.tab==='settings')));

/* ---------------- Global search ---------------- */
document.getElementById('globalSearch').addEventListener('input', e=>{
  const q = e.target.value.trim();
  if(q.length>1){ activateTab('records'); document.getElementById('tableSearch').value=q; renderTable(); }
});

/* ---------------- Overview ---------------- */
function renderKpis(){
  const total = patients.length;
  const referred = patients.filter(p=>p.stageIdx>=2).length;
  const dropoff = patients.filter(p=>p.stageIdx===2 && (new Date()-p.updated)/86400000>10).length;
  const biopsy = patients.filter(p=>p.stageIdx>=4).length;
  const followup = patients.filter(p=>p.stageIdx===6).length;
  const avgDays = 6;
  const kpis = [
    {label:"Screening coverage", value: total, trend:"+12% this month", up:true},
    {label:"Referral completion", value: Math.round(referred/total*100)+"%", trend:"+4% vs last month", up:true},
    {label:"Drop-off rate", value: Math.round(dropoff/total*100)+"%", trend:"-3% vs last month", up:true},
    {label:"Time to evaluation", value: avgDays+" days", trend:"-1.2 days", up:true},
    {label:"Biopsy completion", value: Math.round(biopsy/Math.max(referred,1)*100)+"%", trend:"+6% vs last month", up:true},
    {label:"Follow-up continuity", value: Math.round(followup/total*100)+"%", trend:"-2% vs last month", up:false},
  ];
  document.getElementById('kpiGrid').innerHTML = kpis.map(k=>`
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-trend ${k.up?'trend-up':'trend-down'}">${k.trend}</div>
    </div>`).join('');
}
function renderFunnel(){
  const counts = STAGES.map((s,i)=> patients.filter(p=>p.stageIdx>=i).length);
  const max = counts[0]||1;
  document.getElementById('funnel').innerHTML = STAGES.map((s,i)=>`
    <div class="funnel-row">
      <div>${s}</div>
      <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${(counts[i]/max*100)}%;"></div></div>
      <div class="funnel-count">${counts[i]}</div>
    </div>`).join('');
}
function renderFeed(){
  document.getElementById('activityFeed').innerHTML = auditLog.slice(0,5).map(a=>`
    <div class="feed-item"><div class="feed-dot"></div><div><div class="feed-text">${a.text}</div><div class="feed-time">${a.time}</div></div></div>`).join('');
  document.getElementById('auditLog').innerHTML = auditLog.map(a=>`
    <div class="feed-item"><div class="feed-dot"></div><div><div class="feed-text">${a.text}</div><div class="feed-time">${a.time}</div></div></div>`).join('');
}
document.getElementById('exportOverviewBtn').addEventListener('click', ()=> toast('Program report exported as PDF (demo)'));

/* ---------------- Screening form ---------------- */
function populateSelect(id, arr){
  document.getElementById(id).innerHTML = arr.map(v=>`<option>${v}</option>`).join('');
}
populateSelect('f_village', VILLAGES);
populateSelect('f_asha', ASHAS);

let voiceOn = false;
document.getElementById('voiceBtn').addEventListener('click', function(){
  voiceOn = !voiceOn;
  this.classList.toggle('listening', voiceOn);
  document.getElementById('voiceLabel').textContent = voiceOn ? 'Listening…' : (state.lang==='hi'?'वॉइस इनटेक (हिंदी)':'Voice intake (Hindi)');
  if(voiceOn) setTimeout(()=>{ this.classList.remove('listening'); voiceOn=false; document.getElementById('voiceLabel').textContent = state.lang==='hi'?'वॉइस इनटेक (हिंदी)':'Voice intake (Hindi)'; toast('Voice note attached to record'); }, 1800);
});

let geotagged = false;
let uploadedLesionUrl = '';
document.getElementById('geotagBtn').addEventListener('click', ()=>{
  geotagged = true;
  document.getElementById('geotagLabel').textContent = "29.94° N, 76.83° E · captured";
  toast('Location captured for this screening');
});

/* ---------------- Spec-aligned intake (Screens 1-5) ---------------- */
const HABITS=['Gutkha','Khaini','Paan + Tobacco','Areca nut / Supari','Bidi / Cigarette','Alcohol'];
const FLAGS=[['mouth','Can insert 3 fingers vertically?'],['lesion14','Lesion / ulcer lasting > 14 days'],['burn','Burning sensation with spices'],['node','Palpable neck node'],['tooth','Unexplained tooth mobility']];
const SYMLBL={mouth:'Reduced mouth opening',lesion14:'Non-healing lesion (>14 days)',burn:'Burning with spices',node:'Palpable neck node',tooth:'Unexplained tooth mobility'};
let habits={},flags={},sites=new Set(),photos=[null,null],demoBypass=false,pickShot=0;
let appearance=new Set();
/* Appearance / colour reference photos (supplied by the programme, embedded so they work offline) */
const APPEAR_IMG={
 white:'appearance-white.jpg',
 red:'appearance-red.jpg',
 mixed:'appearance-mixed.jpg',
 ulcer:'appearance-ulcer.jpg',
 growth:'appearance-growth.jpg',
 dark:'appearance-dark.jpg'
};
const APPEAR=[
 {k:'white',label:'Homogenous white',pos:'47% 62%',tip:'An even white or grey patch, flat or slightly raised, that does not wipe off. Common under the tongue, on the cheek lining or gums.'},
 {k:'red',label:'Fiery / velvet red',pos:'45% 50%',tip:'Bright, fiery red patch with a smooth, velvety or granular surface that may bleed easily. Less common than white patches but taken more seriously.'},
 {k:'mixed',label:'Mixed red and white',pos:'58% 60%',tip:'A mix of red and white areas in one patch, often uneven or rough, sometimes with a sore spot in it.'},
 {k:'ulcer',label:'Ulcer and crater',pos:'48% 50%',tip:'Open sore shaped like a crater, with a yellow-white base and a raised red edge. A sore that has not healed in 2 weeks needs a doctor.'},
 {k:'growth',label:'Cauliflower / wart',pos:'45% 60%',tip:'Raised, rough growth that looks like a cauliflower or wart, white and red in colour, sometimes on the gum or jaw ridge. May bleed or feel hard.'},
 {k:'dark',label:'Brown / black',pos:'56% 50%',tip:'Brown, blue or black patch, flat or raised, sometimes with bleeding. Any new dark spot in the mouth needs a doctor’s check.'},
 {k:'unsure',label:'Not sure / other',tip:'Does not match any photo, or you cannot tell. Choose this and refer for a doctor’s check.'}
];
const appearMedia=(a,cls)=>a.k==='unsure'?`<div class="app-unsure" aria-hidden="true">?</div>`:`<img class="${cls}" src="${APPEAR_IMG[a.k]}" alt="Reference photo: ${a.label}" style="object-position:${a.pos}" draggable="false"${cls==='help-img'?` data-zoom="${a.k}"`:''}>`;
function toggleAppear(k){
  if(k==='unsure'){appearance=appearance.has('unsure')?new Set():new Set(['unsure']);}
  else{appearance.delete('unsure');appearance.has(k)?appearance.delete(k):appearance.add(k);}
  renderAppearance();
}
function renderAppearance(){
  const g=$('appearanceGrid');if(!g)return;
  g.innerHTML=APPEAR.map(a=>`<div class="app-wrap"><button type="button" class="app-opt${appearance.has(a.k)?' on':''}" data-a="${a.k}" aria-pressed="${appearance.has(a.k)}">${appearMedia(a,'app-img')}<span>${a.label}</span></button><button type="button" class="help-q" data-help="${a.k}" aria-label="More about: ${a.label}">?</button></div>`).join('');
}
function openAppearHelp(focusKey){
  $('appearHelpGrid').innerHTML=APPEAR.map(a=>`<div class="help-card${a.k===focusKey?' focus':''}" data-card="${a.k}">${appearMedia(a,'help-img')}<h4>${a.label}</h4><p>${a.tip}</p><button type="button" class="btn ${appearance.has(a.k)?'btn-primary':'btn-ghost'} btn-sm" data-pick="${a.k}">${appearance.has(a.k)?'Selected ✓':'This looks like it'}</button></div>`).join('');
  $('appearHelpOverlay').classList.add('show');
  const f=focusKey&&$('appearHelpGrid').querySelector(`[data-card="${focusKey}"]`);
  if(f)f.scrollIntoView({block:'nearest'});
  $('appearHelpClose').focus();
}
const closeAppearHelp=()=>{$('appearHelpOverlay').classList.remove('show');};
const $=id=>document.getElementById(id);

/* Habit matrix */
const step=(i,k,v)=>`<button type="button" class="tag" data-h="${i}" data-k="${k}" data-d="-1">−</button> <b>${v}</b> <button type="button" class="tag" data-h="${i}" data-k="${k}" data-d="1">+</button>`;
function habitInfo(){
  const on=HABITS.filter(h=>habits[h]),tob=on.filter(h=>h!=='Alcohol');
  const exp=on.reduce((a,h)=>a+habits[h].f*habits[h].y*(h==='Alcohol'?.5:1),0);
  return {on,tob,exp,high:tob.length>=2||exp>=10,pts:Math.min(12,3*tob.length+Math.floor(exp/5)),
    text:on.length?on.map(h=>`${h} (${habits[h].f}/day, ${habits[h].y} yr)`).join(', '):'None'};
}
function renderHabits(){
  $('habitMatrix').innerHTML=HABITS.map((h,i)=>{const s=habits[h];
    return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:4px 0;"><button type="button" class="tag${s?' active':''}" data-h="${i}" style="min-width:160px;text-align:left;">${h}</button>${s?`<span style="font-size:12px;">${step(i,'f',s.f)} /day &nbsp; ${step(i,'y',s.y)} yrs</span>`:''}</div>`;}).join('');
  const H=habitInfo();
  $('habitIndex').innerHTML=H.on.length?(H.high?'<b style="color:var(--risk-high)">⚑ High-risk habit index</b>':'Habit index: standard'):'No habit selected';
}
$('habitMatrix').addEventListener('click',e=>{
  const b=e.target.closest('[data-h]');if(!b)return;const h=HABITS[b.dataset.h];
  if(b.dataset.k){const k=b.dataset.k;habits[h][k]=Math.max(1,Math.min(k==='f'?20:60,habits[h][k]+ +b.dataset.d));}
  else if(habits[h])delete habits[h];else habits[h]={f:1,y:1};
  renderHabits();
});

/* Red-flag Yes/No toggles */
function renderFlags(){
  $('patchToggle').innerHTML=[1,0].map(v=>`<button type="button" class="tag${flags.patch===v?' active':''}" data-p="${v}">${v?'Yes':'No'}</button>`).join('');
  $('lesionExpanded').classList.toggle('open',flags.patch===1);
  renderAppearance();
  $('symptomChecklist').innerHTML=FLAGS.filter(([k])=>k!=='lesion14'||flags.patch===1).map(([k,l])=>`<div class="chk" style="justify-content:space-between;gap:8px;"><span>${l}</span><span style="display:flex;gap:4px;">${[1,0].map(v=>`<button type="button" class="tag${flags[k]===v?' active':''}" data-f="${k}" data-v="${v}">${v?'Yes':'No'}</button>`).join('')}</span></div>`).join('');
  $('fingerField').style.display=flags.mouth===0?'':'none';
}
/* Appearance / colour picker + "?" reference-picture pop-up */
document.body.insertAdjacentHTML('beforeend',`<div class="appear-zoom" id="appearZoom" role="dialog" aria-label="Enlarged reference photo"><img alt=""></div><div class="modal-overlay" id="appearHelpOverlay" role="dialog" aria-modal="true" aria-labelledby="appearHelpTitle"><div class="modal" style="max-width:780px"><div class="modal-head"><div><h3 id="appearHelpTitle" style="font-family:var(--font-head);margin:0 0 4px;font-size:19px;">Match what you see</h3><p class="card-sub" style="margin:0;font-size:12.5px;line-height:1.45;color:var(--ink-soft);max-width:520px;">Compare the patch in the mouth with these photos, then tap the closest match. Tap a photo to enlarge it.</p></div><button type="button" class="modal-close" id="appearHelpClose" aria-label="Close">✕</button></div><div class="modal-body"><div class="help-grid" id="appearHelpGrid"></div><p style="font-size:11.5px;color:var(--ink-faint);margin:14px 0 0;">These are reference photos to help you compare. Real patches vary in shape, size and shade. They do not replace a clinical examination. If unsure, choose “Not sure” and refer.</p></div></div></div>`);
$('appearanceGrid').addEventListener('click',e=>{
  const q=e.target.closest('[data-help]');if(q){openAppearHelp(q.dataset.help);return;}
  const b=e.target.closest('[data-a]');if(b)toggleAppear(b.dataset.a);
});
$('appearHelpBtn').addEventListener('click',()=>openAppearHelp());
$('appearHelpLink').addEventListener('click',()=>openAppearHelp());
$('appearHelpClose').addEventListener('click',closeAppearHelp);
$('appearHelpOverlay').addEventListener('click',e=>{if(e.target.id==='appearHelpOverlay')closeAppearHelp();});
$('appearZoom').addEventListener('click',()=>$('appearZoom').classList.remove('show'));
$('appearHelpGrid').addEventListener('click',e=>{const z=e.target.closest('[data-zoom]');if(z){$('appearZoom').querySelector('img').src=z.src;$('appearZoom').querySelector('img').alt=z.alt;$('appearZoom').classList.add('show');return;}const p=e.target.closest('[data-pick]');if(!p)return;const k=p.dataset.pick;if(!appearance.has(k))toggleAppear(k);closeAppearHelp();});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('appearZoom').classList.contains('show')){$('appearZoom').classList.remove('show');return;}if($('appearHelpOverlay').classList.contains('show'))closeAppearHelp();});

/* Visible patch / abnormal tissue growth gate: YES opens the expanded lesion window, NO skips it */
$('patchToggle').addEventListener('click',e=>{
  const b=e.target.closest('[data-p]');if(!b)return;const v=+b.dataset.p;
  if(flags.patch===v)return;
  flags.patch=v;
  if(v===0){
    flags.lesion14=0;$('f_duration').value='No lesion';$('f_ai').value='none';
    sites=new Set();appearance=new Set();photos=[null,null];demoBypass=false;renderSites();renderPhotos();
  }else{
    delete flags.lesion14;
  }
  renderFlags();
});
$('symptomChecklist').addEventListener('click',e=>{
  const b=e.target.closest('[data-f]');if(!b)return;const k=b.dataset.f,v=+b.dataset.v;flags[k]=v;
  if(k==='lesion14'){const d=$('f_duration');if(v)d.value='Over 14 days';else if(d.value==='Over 14 days')d.value='7–14 days';}
  renderFlags();
});
$('f_duration').addEventListener('change',e=>{flags.lesion14=e.target.value==='Over 14 days'?1:0;renderFlags();});

/* Anatomical site map */
function renderSites(){
  document.querySelectorAll('#mouthMap .site').forEach(g=>g.classList.toggle('on',sites.has(g.dataset.site)));
  $('siteSelected').textContent=sites.size?'Selected: '+[...sites].join(', '):'None — tap at least one region';
}
$('mouthMap').addEventListener('click',e=>{const g=e.target.closest('.site');if(!g)return;const s=g.dataset.site;sites.has(s)?sites.delete(s):sites.add(s);renderSites();});

/* Image capture + on-device quality gates */
function qc(src,sw,sh,crop){
  const W=320,H=Math.round(W*sh/sw),c=qc.c||(qc.c=document.createElement('canvas'));c.width=W;c.height=H;
  const x=c.getContext('2d',{willReadFrequently:true});
  if(crop)x.drawImage(src,sw*.25,sh*.25,sw*.5,sh*.5,0,0,W,H);else x.drawImage(src,0,0,W,H);
  const d=x.getImageData(0,0,W,H).data,g=new Float32Array(W*H);let hot=0;
  for(let i=0;i<W*H;i++){const r=d[4*i],gr=d[4*i+1],b=d[4*i+2];g[i]=.299*r+.587*gr+.114*b;if(r>245&&gr>245&&b>245)hot++;}
  let s=0,q=0,n=0;
  for(let y=1;y<H-1;y++)for(let z=1;z<W-1;z++){const i=y*W+z,l=g[i-1]+g[i+1]+g[i-W]+g[i+W]-4*g[i];s+=l;q+=l*l;n++;}
  const m=s/n;return {blur:q/n-m*m,glare:hot/(W*H)};
}
const qcMsg=r=>r.blur<100?'Too blurry — hold steady and refocus':r.glare>.015?'Glare detected — tilt torch away from wet mucosa':'';
function renderPhotos(){
  [0,1].forEach(i=>{const b=$(i?'uploadBox2':'uploadBox'),p=photos[i];
    b.classList.toggle('has-img',!!p);
    b.innerHTML=p?`<img src="${p.url}">`:`<span>Photo ${i+1} · ${i?'Close-up of lesion':'Regional overview'}<br>Tap to capture</span>`;});
  uploadedLesionUrl=(photos[1]||photos[0]||{}).url||'';
}
const pickFile=i=>{pickShot=i;$('fileInput').click();};
async function openCam(i){
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){pickFile(i);return;}
  const m=document.createElement('div');
  m.style.cssText='position:fixed;inset:0;z-index:9999;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:12px;';
  m.innerHTML=`<div style="position:relative;width:min(92vw,560px);"><video autoplay playsinline muted style="width:100%;border-radius:10px;display:block;"></video>${i?'<div style="position:absolute;left:25%;top:25%;width:50%;height:50%;border:2px dashed #48cdbd;border-radius:8px;"></div>':''}</div><div class="cam-msg" style="color:#fff;font-size:13px;text-align:center;">Starting camera…</div><div style="display:flex;gap:10px;"><button type="button" class="btn btn-primary cam-shot" disabled>Capture</button><button type="button" class="btn btn-ghost cam-x" style="color:#fff;">Cancel</button></div>`;
  document.body.appendChild(m);
  const v=m.querySelector('video'),msg=m.querySelector('.cam-msg'),shot=m.querySelector('.cam-shot');let stream,tm;
  const close=()=>{clearInterval(tm);if(stream)stream.getTracks().forEach(t=>t.stop());m.remove();};
  m.querySelector('.cam-x').onclick=close;
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});}
  catch(e){close();pickFile(i);return;}
  v.srcObject=stream;
  const tr=stream.getVideoTracks()[0],cap=tr.getCapabilities?tr.getCapabilities():{},adv=[];
  if(cap.torch)adv.push({torch:true});
  if(cap.focusDistance)adv.push({focusMode:'manual',focusDistance:cap.focusDistance.min});
  try{if(adv.length)await tr.applyConstraints({advanced:adv});}catch(e){}
  const hw=(cap.torch?'Torch ON':'Torch unavailable')+(cap.focusDistance?' · macro focus':'');
  tm=setInterval(()=>{if(!v.videoWidth)return;const e=qcMsg(qc(v,v.videoWidth,v.videoHeight,i===1));shot.disabled=!!e;msg.textContent=(e||'Quality OK — capture now')+' · '+hw+(i?' · fill the box with the lesion':'');},400);
  shot.onclick=()=>{const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);c.toBlob(b=>{photos[i]={url:URL.createObjectURL(b)};renderPhotos();close();},'image/jpeg',.9);};
}
$('uploadBox').addEventListener('click',()=>openCam(0));
$('uploadBox2').addEventListener('click',()=>openCam(1));
$('fileInput').addEventListener('change',e=>{
  const file=e.target.files[0];if(!file)return;
  if(!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)||file.size>5*1024*1024){toast('Please choose a PNG, JPG, WebP or GIF image under 5 MB');e.target.value='';return;}
  const url=URL.createObjectURL(file),im=new Image(),i=pickShot;e.target.value='';
  im.onload=()=>{const err=qcMsg(qc(im,im.naturalWidth,im.naturalHeight,i===1));if(err){toast('Photo rejected: '+err);URL.revokeObjectURL(url);return;}photos[i]={url};renderPhotos();};
  im.src=url;
});

/* ABHA / ID scan */
$('scanIdBtn').addEventListener('click',()=>$('idScanInput').click());
$('idScanInput').addEventListener('change',async e=>{
  const f=e.target.files[0];e.target.value='';if(!f)return;
  if(!('BarcodeDetector' in window))return toast('QR scan not supported in this browser — type the ID');
  try{const r=await new BarcodeDetector({formats:['qr_code','code_128']}).detect(await createImageBitmap(f));
    if(r[0])$('f_abha').value=r[0].rawValue.replace(/[^\w-]/g,'').slice(0,32);else toast('No code found — retry or type the ID');}
  catch(_){toast('Could not read code — type the ID');}
});

/* Offline-first queue (local only: no name, mobile or photos stored) */
let queue=[];try{queue=JSON.parse(localStorage.getItem('oncomitra_queue')||'[]');}catch(e){}
const saveQ=()=>{try{localStorage.setItem('oncomitra_queue',JSON.stringify(queue));}catch(e){}};
function netUi(){
  const on=navigator.onLine;
  $('offlineTag').textContent=on?(queue.length?`● Syncing ${queue.length}…`:'● Synced'):`● Offline · ${queue.length} saved locally`;
  $('uuidHint').textContent=on?'Online: demographic lookup would run on ABHA entry (demo — no live gateway).':'Offline: a local UUID is generated for this patient.';
}
function syncQ(){if(!navigator.onLine||!queue.length)return netUi();netUi();setTimeout(()=>{queue=[];saveQ();netUi();toast('Saved encounters synced');},1200);}
addEventListener('online',syncQ);addEventListener('offline',netUi);

let lastTriage=null;
$('clearFormBtn').addEventListener('click',()=>{
  ['f_abha','f_name','f_age','f_mobile','f_notes'].forEach(id=>$(id).value='');
  $('f_duration').selectedIndex=0;$('f_ai').selectedIndex=0;$('f_fingers').value='2';
  habits={};flags={};sites=new Set();appearance=new Set();photos=[null,null];demoBypass=false;
  renderHabits();renderFlags();renderSites();renderPhotos();
  $('triageResult').classList.remove('show');
});
function demoFill(){
  $('f_name').value='Demo Patient';$('f_age').value='52';$('f_mobile').value='9876543210';
  habits={'Gutkha':{f:3,y:12},'Areca nut / Supari':{f:2,y:12}};
  flags={patch:1,mouth:0,lesion14:1,burn:1,node:0,tooth:0};$('f_duration').value='Over 14 days';$('f_fingers').value='1';
  sites=new Set(['Buccal Mucosa (Left)']);appearance=new Set(['white']);demoBypass=true;renderHabits();renderFlags();renderSites();
}

/* Screen 5: rule-based tiering */
const TIERS={
  1:['Low risk','low','Positive reinforcement: schedule routine 12-month re-screening and play the habit-cessation audio prompt.','Local sync to primary care panel; no urgent escalation.'],
  2:['Intermediate','med','Schedule a Primary Health Centre (PHC) Medical Officer visit within 14 days.','Notification sent to PHC doctor dashboard with lesion thumbnails.'],
  3:['High urgent','high','Immediate Priority Referral token issued. Counsel the patient personally.','High-priority alert to District NCD Cell; biopsy slot reserved automatically.']
};
$('runTriageBtn').addEventListener('click',()=>{
  const name=$('f_name').value.trim()||'Unnamed patient',age=Number($('f_age').value),mobile=$('f_mobile').value.trim();
  const err=!(age>=10&&age<=110)?'Enter age between 10 and 110'
    :(mobile&&!/^\d{10}$/.test(mobile))?'Mobile number must be 10 digits'
    :flags.patch===undefined?'Answer Yes or No: visible patch / abnormal tissue growth'
    :FLAGS.some(([k])=>flags[k]===undefined)?'Answer all red-flag questions'
    :(flags.patch===1&&$('f_duration').value==='No lesion')?'Select how long the patch / growth has been present'
    :(flags.patch===1&&!appearance.size)?'Select the appearance / colour of the patch (tap ? to see pictures)'
    :(flags.patch===1&&!sites.size)?'Tap at least one lesion site on the mouth map'
    :(flags.patch===1&&!(photos[0]&&photos[1])&&!demoBypass)?'Capture both photos: overview and close-up':'';
  if(err){toast(err);return;}
  const H=habitInfo(),dur=$('f_duration').value,ai=$('f_ai').value,fing=flags.mouth===0?$('f_fingers').value:'3';
  const t3=[],t2=[];
  if(flags.lesion14===1||dur==='Over 14 days')t3.push('Lesion >14 days');
  if(flags.mouth===0&&fing==='0')t3.push('Severe OSMF (<1 finger)');
  if(flags.node===1)t3.push('Palpable neck node');
  if(ai==='high')t3.push('High-confidence AI flag');
  if(flags.mouth===0&&fing!=='0')t2.push('OSMF signs (reduced mouth opening)');
  if(flags.burn===1)t2.push('Burning with spices');
  if(flags.tooth===1)t2.push('Unexplained tooth mobility');
  if(dur==='7–14 days')t2.push('Unhealed lesion 7–14 days');
  if(ai==='suspect')t2.push('Leukoplakia/erythroplakia suspicion');
  const tier=t3.length?3:t2.length?2:1,why=[...t3,...t2],T=TIERS[tier];
  const pos=FLAGS.filter(([k])=>k==='mouth'?flags.mouth===0:flags[k]===1);
  const basePoints={1:10,2:40,3:70}[tier],flagPoints=Math.min(12,4*pos.length),habitPoints=H.pts,agePoints=Math.max(0,Math.min(5,Math.floor((age-35)/5)));
  const score=basePoints+flagPoints+habitPoints+agePoints,level=T[1];
  const uuid=crypto.randomUUID?crypto.randomUUID():uid(),asha=$('f_asha').value,ts=new Date(),workerId=(window.session&&window.session.id)||asha;
  const token=btoa(JSON.stringify({u:uuid,t:tier,ts:ts.toISOString(),a:workerId}));
  lastTriage={name,age,score,level,tier,tierLabel:T[0],why,habit:H.text,habitHigh:H.high,duration:dur,ai,sites:[...sites],
    symptoms:[...(flags.patch===1?['Visible patch / abnormal tissue growth']:[]),...pos.map(([k])=>SYMLBL[k])],patch:flags.patch,appearance:[...appearance].map(k=>APPEAR.find(a=>a.k===k).label),flagPoints,habitPoints,agePoints,basePoints,uuid,asha,workerId,mobile,abha:$('f_abha').value.trim(),token,event:T[3],action:T[2],ts};

  const colors={high:'var(--risk-high)',med:'var(--risk-med)',low:'var(--risk-low)'},bgs={high:'var(--risk-high-bg)',med:'var(--risk-med-bg)',low:'var(--risk-low-bg)'};
  const ring=$('riskRing');ring.style.background=bgs[level];ring.style.color=colors[level];ring.textContent=score;
  $('riskHeadline').textContent=`Tier ${tier}: ${T[0]}`;
  $('riskConfidence').textContent=(why.length?'Triggers: '+why.join(' · '):'No red flags')+` · Habit index: ${H.high?'High':'Standard'}`;
  $('riskBadgeLarge').className='badge '+level;$('riskBadgeLarge').textContent=`Tier ${tier}`;
  $('riskRecommendation').textContent=`${T[2]} On save: ${T[3]}`;
  $('tokenLine').textContent='Patient token (QR payload): '+token;
  $('createReferralBtn').textContent=['Save to primary care panel','Save & notify PHC doctor','Save & issue priority referral'][tier-1];
  $('audioBtn').style.display=tier===1?'':'none';
  const contributions=[['Tier baseline',basePoints,''],['Red flags',flagPoints,flagPoints?'alert':''],['Habit index',habitPoints,habitPoints?'alert':''],['Age',agePoints,'']];
  $('contributionBars').innerHTML=contributions.map(([label,points,tone])=>`
    <div class="contribution-row ${tone}">
      <span class="contribution-label">${label}</span>
      <span class="contribution-track"><span class="contribution-bar" style="width:${Math.max(3,Math.min(100,points))}%"></span></span>
      <span class="contribution-value">+${points}</span>
    </div>`).join('');
  const heatmap=$('lesionHeatmap');
  heatmap.classList.toggle('has-photo',Boolean(uploadedLesionUrl));
  heatmap.style.backgroundImage=uploadedLesionUrl?`url("${uploadedLesionUrl}")`:'';
  const hotspot=$('lesionHotspot');
  hotspot.style.left=`${38+(pos.length*7)%28}%`;hotspot.style.top=`${27+(dur==='Over 14 days'?15:5)}%`;
  const showArea=flags.patch===1;$('areaReviewCol').style.display=showArea?'':'none';$('areaReviewCol').parentElement.style.gridTemplateColumns=showArea?'':'1fr';
  $('triageResult').classList.add('show');
});

$('audioBtn').addEventListener('click',()=>{
  if(!window.speechSynthesis)return toast('Audio not supported on this device');
  const hi=state.lang==='hi';
  const u=new SpeechSynthesisUtterance(hi?'तंबाकू और सुपारी छोड़ना आपके मुंह और सेहत के लिए बहुत अच्छा है। कृपया आज ही छोड़ने का फैसला करें।':'Quitting tobacco and areca nut protects your mouth and your health. Please decide to quit today.');
  u.lang=hi?'hi-IN':'en-IN';speechSynthesis.cancel();speechSynthesis.speak(u);
});

$('createReferralBtn').addEventListener('click',()=>{
  if(!lastTriage)return;const t=lastTriage;
  patients.unshift({
    id:uid(),name:t.name,age:t.age,gender:$('f_gender').value,village:$('f_village').value,
    asha:t.asha,risk:t.score,habit:t.habit,stageIdx:t.tier-1,updated:new Date(),
    notes:[],symptoms:t.symptoms,tier:t.tier,mobile:t.mobile,abha:t.abha,uuid:t.uuid,sites:t.sites
  });
  auditLog.unshift({text:`<b>${esc(t.name)}</b> screened: Tier ${t.tier} (${t.tierLabel})`,time:'Just now'});
  queue.push({u:t.uuid,t:t.tier,ts:t.ts.toISOString(),a:t.workerId,s:t.sites});saveQ();
  navigator.onLine?syncQ():netUi();
  toast(`${t.name} saved — ${t.event}`);
  renderAll();
  $('clearFormBtn').click();
});

$('downloadTriageBtn').addEventListener('click',()=>{
  if(!lastTriage)return;const t=lastTriage;
  const report=[
    'ONCOmitra — Oral screening report',
    `Generated: ${new Date().toLocaleString('en-IN')}`,
    '',
    `Patient: ${t.name} (age ${t.age})`,
    `ASHA / worker ID: ${t.workerId}`,
    `Triage: Tier ${t.tier} — ${t.tierLabel} (score ${t.score}/100)`,
    `Triggers: ${t.why.length?t.why.join('; '):'None'}`,
    `Red flags: ${t.symptoms.length?t.symptoms.join(', '):'None'}`,
    `Visible patch / abnormal tissue growth: ${t.patch===1?'Yes':'No'}`,
    ...(t.patch===1?[`Appearance / colour: ${t.appearance.join(', ')}`,`Lesion sites: ${t.sites.join(', ')}`,`Lesion duration: ${t.duration}`]:[]),
    `Habit profile: ${t.habit} (${t.habitHigh?'high-risk':'standard'} habit index)`,
    ...(t.patch===1?[`AI lesion flag (demo): ${t.ai}`]:[]),
    '',
    'Score contribution breakdown',
    `Tier baseline: +${t.basePoints}`,
    `Red flags: +${t.flagPoints}`,
    `Habit index: +${t.habitPoints}`,
    `Age: +${t.agePoints}`,
    '',
    `Action: ${t.action}`,
    `System event: ${t.event}`,
    `Patient token (QR payload): ${t.token}`,
    '',
    'This is a screening-support report, not a diagnosis. Final evaluation requires clinical examination.'
  ].join('\n');
  const blob=new Blob([report],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`oncomitra-screening-${t.name.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'report'}.txt`;
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(a.href);
  toast('Screening report downloaded');
});

renderHabits();renderFlags();renderSites();renderPhotos();netUi();

/* ---------------- Patient table ---------------- */
document.getElementById('stageFilter').innerHTML = '<option value="all">All stages</option>'+STAGES.map(s=>`<option>${s}</option>`).join('');
document.querySelectorAll('#riskFilterTags .tag').forEach(t=>t.addEventListener('click', function(){
  document.querySelectorAll('#riskFilterTags .tag').forEach(x=>x.classList.remove('active'));
  this.classList.add('active'); state.riskFilter=this.dataset.risk; renderTable();
}));
document.getElementById('stageFilter').addEventListener('change', e=>{ state.stageFilter=e.target.value; renderTable(); });
document.getElementById('tableSearch').addEventListener('input', renderTable);
document.querySelectorAll('th[data-sort]').forEach(th=>th.addEventListener('click', ()=>{
  const key = th.dataset.sort;
  if(state.sortKey===key) state.sortDir = state.sortDir==='asc'?'desc':'asc'; else { state.sortKey=key; state.sortDir='asc'; }
  renderTable();
}));

function renderTable(){
  const q = (document.getElementById('tableSearch').value||'').toLowerCase();
  let rows = patients.filter(p=>{
    if(state.riskFilter!=='all' && riskLevel(p.risk)!==state.riskFilter) return false;
    if(state.stageFilter!=='all' && STAGES[p.stageIdx]!==state.stageFilter) return false;
    if(q && !(p.name.toLowerCase().includes(q) || p.village.toLowerCase().includes(q))) return false;
    return true;
  });
  const key = state.sortKey, dir = state.sortDir==='asc'?1:-1;
  rows.sort((a,b)=>{
    let av,bv;
    if(key==='name'){av=a.name;bv=b.name;}
    else if(key==='age'){av=a.age;bv=b.age;}
    else if(key==='village'){av=a.village;bv=b.village;}
    else if(key==='risk'){av=a.risk;bv=b.risk;}
    else if(key==='stage'){av=a.stageIdx;bv=b.stageIdx;}
    else {av=a.updated;bv=b.updated;}
    return av>bv?dir:av<bv?-dir:0;
  });
  document.getElementById('patientTableBody').innerHTML = rows.map(p=>{
    const lvl = riskLevel(p.risk);
    return `<tr class="row-clickable" data-id="${p.id}">
      <td class="name-cell">${esc(p.name)}</td>
      <td>${p.age}</td>
      <td class="village-cell">${esc(p.village)}</td>
      <td><span class="badge ${lvl}">${p.risk}</span></td>
      <td><span class="badge stage">${STAGES[p.stageIdx]}</span></td>
      <td>${fmtDate(p.updated)}</td>
      <td><button class="btn btn-ghost btn-sm reminder-btn" data-id="${p.id}">Remind</button></td>
    </tr>`;
  }).join('') || `<tr><td colspan="7"><div class="empty-state">No patients match these filters yet.</div></td></tr>`;
}
document.getElementById('patientTableBody').addEventListener('click', e=>{
  const remindBtn = e.target.closest('.reminder-btn');
  if(remindBtn){ e.stopPropagation(); const p=patients.find(x=>x.id===remindBtn.dataset.id); toast(`WhatsApp reminder sent to ${p.name}`); return; }
  const row = e.target.closest('tr[data-id]');
  if(row) openPatientModal(row.dataset.id);
});
document.getElementById('exportCsvBtn').addEventListener('click', ()=>{
  const header = "Name,Age,Gender,Village,ASHA,Risk,Stage,LastUpdate\n";
  const csvCell = v => { let s=String(v); if(/^[=+\-@\t\r]/.test(s)) s="'"+s; return '"'+s.replace(/"/g,'""')+'"'; };
  const rows = patients.map(p=>[p.name,p.age,p.gender,p.village,p.asha,p.risk,STAGES[p.stageIdx],p.updated.toISOString().slice(0,10)].map(csvCell).join(",")).join("\n");
  const blob = new Blob([header+rows], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download='oncomitra_patients.csv'; a.click();
  toast('CSV exported');
});

/* ---------------- Patient modal ---------------- */
function openPatientModal(id){
  const p = patients.find(x=>x.id===id);
  if(!p) return;
  state.activeModal = id;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalBadges').innerHTML = `<span class="badge ${riskLevel(p.risk)}">${p.risk} risk</span><span class="badge stage">${STAGES[p.stageIdx]}</span>`;
  document.getElementById('modalVillage').textContent = p.village;
  document.getElementById('modalAsha').textContent = p.asha;
  document.getElementById('modalAgeGender').textContent = `${p.age} yrs · ${p.gender}`;
  document.getElementById('modalHabit').textContent = p.habit;
  document.getElementById('modalQr').style.display='none';

  document.getElementById('modalTimeline').innerHTML = STAGES.map((s,i)=>{
    const done = i<=p.stageIdx;
    return `<div class="tl-item ${done?'':'pending'}">
      ${i<STAGES.length-1?'<div class="tl-line"></div>':''}
      <div class="tl-marker"></div>
      <div class="tl-content"><b>${s}</b><p>${done? (i===0? 'Completed by '+esc(p.asha)+' · '+fmtDate(p.updated) : 'Completed') : 'Pending'}</p></div>
    </div>`;
  }).join('');

  renderModalNotes(p);
  document.getElementById('patientModalOverlay').classList.add('show');
}
function renderModalNotes(p){
  document.getElementById('modalNotes').innerHTML = p.notes.length? p.notes.map(n=>`<div style="padding:6px 0;border-bottom:1px solid var(--border);">${esc(n)}</div>`).join('') : 'No notes yet.';
}
document.getElementById('modalCloseBtn').addEventListener('click', ()=> document.getElementById('patientModalOverlay').classList.remove('show'));
document.getElementById('patientModalOverlay').addEventListener('click', e=>{ if(e.target.id==='patientModalOverlay') e.currentTarget.classList.remove('show'); });
document.getElementById('modalReminderBtn').addEventListener('click', ()=>{ const p=patients.find(x=>x.id===state.activeModal); toast(`WhatsApp reminder sent to ${p.name}`); });
document.getElementById('modalPrintBtn').addEventListener('click', ()=> toast('Patient report exported as PDF (demo)'));
document.getElementById('modalQrBtn').addEventListener('click', ()=>{ const el=document.getElementById('modalQr'); el.style.display = el.style.display==='none'?'block':'none'; });
document.getElementById('modalAddNoteBtn').addEventListener('click', ()=>{
  const input = document.getElementById('modalNoteInput');
  if(!input.value.trim()) return;
  const p = patients.find(x=>x.id===state.activeModal);
  p.notes.unshift(input.value.trim());
  auditLog.unshift({text:`Note added for <b>${esc(p.name)}</b>`, time:"Just now"});
  input.value='';
  renderModalNotes(p);
  renderFeed();
});

/* ---------------- Kanban ---------------- */
function renderKanban(){
  const kb = document.getElementById('kanban');
  kb.innerHTML = KANBAN_STAGES.map((stage,ci)=>`
    <div class="kcol" data-idx="${ci+1}">
      <div class="kcol-head"><span>${stage}</span><span id="kcount-${ci}"></span></div>
      <div class="kdrop" data-idx="${ci+1}"></div>
    </div>`).join('');
  KANBAN_STAGES.forEach((stage,ci)=>{
    const list = patients.filter(p=>p.stageIdx===ci+1);
    document.getElementById('kcount-'+ci).textContent = list.length;
    const dropzone = kb.querySelector(`.kdrop[data-idx="${ci+1}"]`);
    dropzone.innerHTML = list.map(p=>`
      <div class="kcard" draggable="true" data-id="${p.id}">
        <b>${esc(p.name)}</b>${esc(p.village)} · <span class="badge ${riskLevel(p.risk)}" style="margin-top:4px;display:inline-flex;">${p.risk}</span>
      </div>`).join('');
  });
  kb.querySelectorAll('.kcol').forEach(col=>{
    col.addEventListener('dragover', e=>{ e.preventDefault(); col.classList.add('dragover'); });
    col.addEventListener('dragleave', ()=> col.classList.remove('dragover'));
    col.addEventListener('drop', e=>{
      e.preventDefault(); col.classList.remove('dragover');
      const id = e.dataTransfer.getData('text/plain');
      const p = patients.find(x=>x.id===id);
      if(p){ p.stageIdx = Number(col.dataset.idx); p.updated=new Date();
        auditLog.unshift({text:`<b>${esc(p.name)}</b> moved to ${STAGES[p.stageIdx]}`, time:"Just now"});
        renderAll(); toast(`${p.name} → ${STAGES[p.stageIdx]}`);
      }
    });
  });
  kb.querySelectorAll('.kcard').forEach(card=>{
    card.addEventListener('dragstart', e=>{ e.dataTransfer.setData('text/plain', card.dataset.id); card.classList.add('dragging'); });
    card.addEventListener('dragend', ()=> card.classList.remove('dragging'));
    card.addEventListener('click', ()=> openPatientModal(card.dataset.id));
  });
}
function renderAppointments(){
  const upcoming = patients.filter(p=>p.stageIdx>=2 && p.stageIdx<6).slice(0,6).map((p,i)=>({
    p, date: new Date(Date.now()+ (i+1)*86400000*2)
  }));
  document.getElementById('apptList').innerHTML = upcoming.map(u=>`
    <div class="feed-item"><div class="feed-dot"></div>
      <div><div class="feed-text"><b>${esc(u.p.name)}</b> — ${STAGES[u.p.stageIdx+1]||'Evaluation'} appointment</div>
      <div class="feed-time">${u.date.toLocaleDateString('en-IN',{weekday:'short', day:'2-digit', month:'short'})} · ${esc(u.p.village)} PHC</div></div>
    </div>`).join('') || '<div class="empty-state">No upcoming appointments.</div>';
}
document.getElementById('calendarToggleBtn').addEventListener('click', ()=> document.getElementById('apptCard').scrollIntoView({behavior:'smooth'}));

/* ---------------- Analytics charts ---------------- */
let chartRefs = {};
function renderCharts(){
  const dark = state.theme==='dark';
  const gridColor = dark? 'rgba(255,255,255,.08)':'rgba(0,0,0,.06)';
  const textColor = dark? '#B4ACC9':'#5E5578';
  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";

  const trendLabels = Array.from({length:8}, (_,i)=>`Wk ${i+1}`);
  const trendData = trendLabels.map(()=> 8+Math.floor(Math.random()*14));
  mkChart('chartTrend','line',{labels:trendLabels, datasets:[{label:'Screenings', data:trendData, borderColor:'#8B6CD0', backgroundColor:'rgba(139,108,208,.18)', tension:.35, fill:true}]}, {scales:{y:{grid:{color:gridColor}},x:{grid:{display:false}}}});

  const referred = patients.filter(p=>p.stageIdx>=2).length;
  const notReferred = patients.length-referred;
  mkChart('chartDonut','doughnut',{labels:['Completed referral','Pending / lost'],datasets:[{data:[referred,notReferred], backgroundColor:['#8B6CD0','#D9D0EB']}]},{plugins:{legend:{position:'bottom'}}});

  mkChart('chartDropoff','bar',{labels:STAGES.slice(0,5), datasets:[{label:'Patients lost', data:[2,5,7,3,1], backgroundColor:'#EF6F6C'}]},{scales:{y:{grid:{color:gridColor}},x:{grid:{display:false}}}});

  mkChart('chartHist','bar',{labels:['0-3d','4-7d','8-14d','15-30d','30d+'], datasets:[{label:'Patients', data:[3,7,5,2,1], backgroundColor:'#7C5CC4'}]},{scales:{y:{grid:{color:gridColor}},x:{grid:{display:false}}}});

  const scatterData = patients.map(p=>({x:p.risk, y: Math.round(p.risk*0.7 + Math.random()*20)}));
  mkChart('chartScatter','scatter',{datasets:[{label:'Sample', data:scatterData, backgroundColor:'#EF6F6C'}]},{scales:{x:{title:{display:true,text:'AI risk score'},grid:{color:gridColor}},y:{title:{display:true,text:'Biomarker signal (a.u.)'},grid:{color:gridColor}}}});

  renderHeatmap();
}
function mkChart(id,type,data,extraOpts){
  const ctx = document.getElementById(id);
  if(chartRefs[id]) chartRefs[id].destroy();
  chartRefs[id] = new Chart(ctx, {type, data, options: Object.assign({responsive:true, maintainAspectRatio:false}, extraOpts||{})});
}
function renderHeatmap(){
  const counts = VILLAGES.map(()=> 10+Math.floor(Math.random()*40));
  const max = Math.max(...counts);
  document.getElementById('heatmap').innerHTML = VILLAGES.map((v,i)=>{
    const intensity = counts[i]/max;
    const bg = `rgba(124,92,196,${0.3+intensity*0.65})`;
    return `<div class="heat-cell" style="background:${bg};"><b>${counts[i]}</b>${v}</div>`;
  }).join('');
}
document.getElementById('customizeBtn').addEventListener('click', ()=> toast('Widget layout customization coming soon'));

/* ---------------- Research tab ---------------- */
const MARKERS = ["TP53","CDKN2A","PIK3CA","NOTCH1","EGFR","CASP8"];
function renderBiomarkers(){
  const cohort = document.getElementById('cohortFilter').value;
  let pool = patients;
  if(cohort==='high') pool = patients.filter(p=>riskLevel(p.risk)==='high');
  if(cohort==='diagnosed') pool = patients.filter(p=>p.stageIdx>=5);
  const rows = pool.slice(0,8).map((p,i)=>{
    const marker = MARKERS[i%MARKERS.length];
    const expr = (Math.random()*4+1).toFixed(1);
    return `<tr><td>SMP-${(1000+i)}</td><td>${marker}</td><td>${expr}×</td><td>${riskLevel(p.risk)} risk / ${STAGES[p.stageIdx]}</td></tr>`;
  }).join('');
  document.getElementById('biomarkerBody').innerHTML = rows || `<tr><td colspan="4"><div class="empty-state">No samples in this cohort.</div></td></tr>`;
}
document.getElementById('cohortFilter').addEventListener('change', renderBiomarkers);
document.getElementById('exportResearchBtn').addEventListener('click', ()=> toast('De-identified dataset exported for IRB-approved research use (demo)'));

/* ---------------- Settings / feedback ---------------- */
document.getElementById('submitFeedbackBtn').addEventListener('click', ()=>{
  const val = document.getElementById('feedbackText').value.trim();
  if(!val){ toast('Write a note before submitting'); return; }
  document.getElementById('feedbackText').value='';
  auditLog.unshift({text:'Feedback submitted about the prototype', time:'Just now'});
  toast('Thank you — feedback submitted');
  renderFeed();
});

/* ---------------- Render orchestration ---------------- */
function renderAll(){
  renderKpis(); renderFunnel(); renderFeed(); renderTable(); renderKanban(); renderAppointments(); renderBiomarkers();
  if(document.getElementById('panel-analytics').classList.contains('active')) renderCharts();
}
setTheme(true);
renderAll();
