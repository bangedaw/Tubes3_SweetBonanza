import{n as e,t}from"./assets/chunk-1VNLd2iN.js";function n(e){let t=new Map;for(let n=0;n<e.length;n++)t.set(e[n],n);return t}function r(e,t){if(t.length===0||e.length===0||t.length>e.length)return{indexes:[],comparisons:0};let r=n(t),i=[],a=0,o=0;for(;o<=e.length-t.length;){let n=t.length-1;for(;n>=0&&(a++,t[n]===e[o+n]);)n--;if(n<0)i.push(o),o+=1;else{let t=e[o+n],i=r.get(t)??-1,a=n-i;o+=Math.max(1,a)}}return{indexes:i,comparisons:a}}function i(e,t){let n=performance.now(),i=[],a=0,o=e.toLowerCase();for(let n of t){let t=n.trim();if(t.length===0)continue;let s=r(o,t.toLowerCase());a+=s.comparisons;for(let n of s.indexes){let r=n+t.length;i.push({keyword:t,matchedText:e.slice(n,r),startIndex:n,endIndex:r,algorithm:`Boyer-Moore`,similarity:1})}}return{algorithm:`Boyer-Moore`,matches:i,stats:{algorithm:`Boyer-Moore`,totalMatches:i.length,comparisons:a,executionTimeMs:performance.now()-n}}}var a=e((()=>{}));function o(e){let t=Array(e.length).fill(0),n=0,r=0,i=1;for(;i<e.length;)n++,e[i]===e[r]?(r++,t[i]=r,i++):r===0?(t[i]=0,i++):r=t[r-1];return{lps:t,comparisons:n}}function s(e,t){if(t.length===0)return{indexes:[],comparisons:0};let{lps:n,comparisons:r}=o(t),i=[],a=r,s=0,c=0;for(;s<e.length;)a++,e[s]===t[c]&&(s++,c++),c===t.length?(i.push(s-c),c=n[c-1]):s<e.length&&e[s]!==t[c]&&(a++,c===0?s++:c=n[c-1]);return{indexes:i,comparisons:a}}function c(e,t){let n=performance.now(),r=[],i=0,a=e.toLowerCase();for(let n of t){let t=n.trim();if(t.length===0)continue;let o=s(a,t.toLowerCase());i+=o.comparisons;for(let n of o.indexes){let i=n+t.length;r.push({keyword:t,matchedText:e.slice(n,i),startIndex:n,endIndex:i,algorithm:`KMP`,similarity:1})}}return{algorithm:`KMP`,matches:r,stats:{algorithm:`KMP`,totalMatches:r.length,comparisons:i,executionTimeMs:performance.now()-n}}}var l=e((()=>{}));function u(e){let t=e.replace(/[^\p{L}\p{M}]/gu,``).length,n=e.replace(/[^0-9]/g,``).length;return t>=3&&n>=2}function d(e){let t=performance.now(),n=[];f.lastIndex=0;for(let t of e.matchAll(f)){let e=t[0],r=t.index??0,i=r+e.length;u(e)&&n.push({keyword:e,matchedText:e,startIndex:r,endIndex:i,algorithm:`Regex`,similarity:1})}return{algorithm:`Regex`,matches:n,stats:{algorithm:`Regex`,totalMatches:n.length,executionTimeMs:performance.now()-t}}}var f,p=e((()=>{f=/[\p{L}][\p{L}\p{M}]{2,}[0-9]{2,4}/giu}));function m(e,t){if(e===t)return 0;let n=`${e}|${t}`,r=`${t}|${e}`;return S.get(n)??S.get(r)??1}function h(e,t){let n=e.toLowerCase(),r=t.toLowerCase(),i=n.length+1,a=r.length+1,o=Array.from({length:i},()=>Array(a).fill(0));for(let e=0;e<i;e++)o[e][0]=e;for(let e=0;e<a;e++)o[0][e]=e;for(let e=1;e<i;e++)for(let t=1;t<a;t++){let i=o[e-1][t]+1,a=o[e][t-1]+1,s=o[e-1][t-1]+m(n[e-1],r[t-1]);o[e][t]=Math.min(i,a,s)}return o[n.length][r.length]}function g(e,t){let n=Math.max(e.length,t.length);return n===0?1:1-h(e,t)/n}function _(e){let t=[];x.lastIndex=0;for(let n of e.matchAll(x)){let e=n[0],r=n.index??0;t.push({token:e,startIndex:r,endIndex:r+e.length})}return t}function v(e,t){return Math.abs(e.length-t.length)<=Math.max(2,Math.floor(t.length*.4))}function y(e,t,n=b){let r=performance.now(),i=[],a=_(e);for(let{token:e,startIndex:r,endIndex:o}of a){let a=``,s=0;for(let n of t){let t=n.trim();if(t.length===0||!v(e,t))continue;let r=g(e,t);r>s&&(a=t,s=r)}s>=n&&e.toLowerCase()!==a.toLowerCase()&&i.push({keyword:a,matchedText:e,startIndex:r,endIndex:o,algorithm:`Weighted-Levenshtein`,similarity:s})}return{algorithm:`Weighted-Levenshtein`,matches:i,stats:{algorithm:`Weighted-Levenshtein`,totalMatches:i.length,executionTimeMs:performance.now()-r}}}var b,x,S,C=e((()=>{b=.82,x=/[\p{L}\p{M}0-9]{3,}/giu,S=new Map([[`o|0`,.2],[`i|1`,.2],[`l|1`,.3],[`a|4`,.3],[`e|3`,.3],[`s|5`,.3],[`a|α`,.2]])})),w,T=e((()=>{w=`slot
slot gacor
gacor
maxwin
scatter
scatter hitam
scatter merah
jackpot
jackpot maxwin
bonus new member
bonus member baru
bonus deposit
bonus harian
bonus mingguan
bonus bulanan
bonus rollingan
bonus turnover
bonus referral
bonus cashback
cashback slot
cashback casino
free spin
free spins
freebet
free bet
freechip
free chip
deposit pulsa
deposit ewallet
deposit dana
deposit ovo
deposit gopay
deposit qris
deposit tanpa potongan
minimal deposit
wd cepat
withdraw cepat
withdraw kilat
withdraw otomatis
rtp
rtp live
rtp slot
rtp gacor
rtp tertinggi
rtp hari ini
slot online
judi online
situs judi
situs slot
bandar slot
bandar togel
casino online
live casino
pragmatic play
pg soft
habanero
joker gaming
microgaming
spadegaming
slot88
slot 88
slot777
slot 777
slot gacor hari ini
slot gampang menang
slot terpercaya
slot resmi
slot terbaru
slot terbaik
slot viral
slot thailand
slot olympus
olympus1000
olympus 1000
mahjong ways
mahjong ways 2
sweet bonanza
starlight princess
gates of olympus
gates olympus
wild west gold
bonanza slot
zeus slot
kakek zeus
petir zeus
slot petir
slot receh
slot anti rungkad
anti rungkad
anti kalah
pasti menang
jamin menang
cuan slot
cuan besar
cuan maxwin
cuan gacor
slot cuan
situs gacor
game gacor
akun gacor
jam gacor
pola gacor
pola slot
pola maxwin
jam hoki
jam hoki slot
jam hoki gacor
admin slot
link alternatif
link gacor
login slot
daftar slot
daftar judi
register slot
main slot
main judi
main casino
main togel
pasang togel
prediksi togel
angka hoki
angka jitu
angka keramat
slot deposit pulsa
slot via dana
slot via ovo
slot via qris
slot via gopay
slot deposit qris
slot tanpa potongan
slot resmi terpercaya
situs terpercaya
agen judi
agen slot
agen togel
bandar darat online
bandar online
slot resmi indonesia
slot gampang wd
slot gampang maxwin
slot no 1
slot nomor 1
slot paling gacor
slot paling cuan
slot hoki
slot hoki hari ini
slot gacor maxwin
slot gacor terpercaya
slot gacor terbaru
slot gacor 2026
slot gacor 2025
slot thailand gacor
slot server thailand
server thailand
server kamboja
slot server kamboja
slot luar negeri
akun pro slot
akun sultan
akun hoki
akun maxwin
situs anti rungkad
judi bola
taruhan bola
sportsbook
mix parlay
parlay
casino terpercaya
roulette online
baccarat online
blackjack online
poker online
capsa online
domino qiu qiu
dominoqq
qq online
bandarq
sakong online
aduq online
togel singapore
togel hongkong
togel sidney
togel macau
toto gelap
togel online
pasaran togel
angka togel
keluaran togel
result togel
prediksi hk
prediksi sdy
prediksi sgp
live draw
live draw hk
live draw sdy
live draw sgp
jackpot terbesar
jackpot harian
jackpot mingguan
bonus member baru 100
bonus 100
bonus 200
bonus cashback 10 persen
bonus turnover slot
bonus rollingan slot
bonus referral slot
slot bonus new member
casino bonus
casino online terpercaya
situs gacor terpercaya
agen terpercaya
daftar sekarang
main sekarang
claim bonus
klaim bonus
spin gratis
spin free
spin otomatis
auto spin
buy free spin
buy feature
feature buy
slot buy feature
big win
mega win
super win
sensational
epic win
double chance
turbo spin
auto cuan
modal receh
modal kecil cuan besar
deposit receh
deposit 10 ribu
deposit 5 ribu
deposit murah
situs resmi slot
situs slot online terpercaya
situs slot gacor terpercaya
slot online terpercaya no 1
slot online gacor
slot online maxwin
slot online gampang menang
slot online indonesia
slot online via dana
slot online deposit pulsa
slot qris
slot dana
slot ovo
slot gopay
slot pulsa
slot tri
slot xl
slot telkomsel
slot indosat
slot smartfren
judi slot online
judi casino online
judi terpercaya
judi gacor
judi bola online
judi togel online
judi deposit pulsa
slot deposit dana
slot deposit ovo
slot deposit gopay
slot deposit linkaja
slot deposit shopeepay
situs slot deposit pulsa tanpa potongan
slot deposit ewallet
judi online terpercaya
akun demo slot
demo slot
provider slot
provider gacor
provider terbaik
slot pragmatic
slot pg soft
slot habanero
slot joker
slot microgaming
slot spadegaming
slot live22
slot toptrend
slot yggdrasil
slot jdb
slot cq9
slot playstar
slot ion
slot onetouch
slot no limit city
slot hacksaw
slot dragon hatch
slot aztec
slot zeus
slot fu fu fu
slot panda
slot naga
slot kakek merah
slot princess
slot bonanza
slot aladdin
slot buah
slot ikan
slot dewa petir
slot dewa zeus
slot gacor malam ini
slot gacor sore ini
slot gacor pagi ini
slot gacor siang ini
slot gacor auto maxwin
slot gacor anti kalah
slot gacor hari ini terpercaya
slot gacor gampang menang
slot gacor modal kecil
slot gacor deposit kecil
slot gacor bonus besar
slot gacor terpercaya no 1
situs slot gacor no 1
situs slot gampang menang
situs judi terpercaya no 1
link slot gacor
link judi online
link slot online
alternatif slot
alternatif judi
mirror site slot
mirror judi
main slot sekarang
main judi sekarang
main dan menang
auto menang
auto wd
wd tanpa syarat
wd 1 menit
wd 5 menit
wd tercepat
slot anti zonk
anti zonk
slot gacor anti zonk
slot hoki malam ini
slot hoki hari ini
slot hoki gacor
admin gacor
admin maxwin
admin hoki
jackpot terbesar hari ini
slot jackpot terbesar
slot jackpot maxwin
casino gacor
live casino gacor
live slot
live jackpot
prediksi slot
trik slot
cara menang slot
cara maxwin
tips gacor
tips maxwin
bocoran slot
bocoran admin
bocoran jam gacor
bocoran pola slot
bocoran maxwin
akun sultan gacor
akun hoki maxwin
akun gacor terpercaya
akun anti rungkad
akun auto win
akun auto maxwin
slot vip
member vip
vip slot
vip casino
vip gambling
high roller
rollingan besar
turnover besar
bonus turnover casino
bonus cashback harian
cashback mingguan
cashback bulanan
judi terpercaya indonesia
slot resmi terbaik
slot resmi no 1
slot resmi gampang menang
judi slot terpercaya
judi slot gacor
judi slot maxwin
slot online gampang wd
slot online gampang cuan
slot online anti kalah
slot online anti rungkad
slot online terpercaya indonesia
situs slot resmi indonesia
situs judi online indonesia
slot online terbaik
slot online resmi
slot online bonus besar
slot online bonus new member
casino online indonesia
casino online terpercaya indonesia
situs casino online
bandar casino online
bandar togel online
bandar slot online
`})),E=t((()=>{a(),l(),p(),C(),T();var e=w.split(/\r?\n/).map(e=>e.trim()).filter(Boolean),t=new Map,n=new Map,r=new Map;[`Boyer-Moore`,`KMP`,`Regex`,`Weighted-Levenshtein`].forEach(e=>{n.set(e,0),r.set(e,0)});var o=document.createElement(`div`);o.style.position=`absolute`,o.style.display=`none`,o.style.backgroundColor=`#333`,o.style.color=`#fff`,o.style.padding=`8px`,o.style.borderRadius=`4px`,o.style.fontSize=`12px`,o.style.zIndex=`999999`,o.style.pointerEvents=`none`,o.style.lineHeight=`1.5`,document.body.appendChild(o);function s(e,i,a){let o=0,s=[];for(let e of i){let t=n.get(e.algorithm)||0;n.set(e.algorithm,t+e.stats.executionTimeMs);let i=r.get(e.algorithm)||0;r.set(e.algorithm,i+e.matches.length);for(let t of e.matches)s.push({...t,algorithms:new Set([e.algorithm])})}if(s.length>0){s.sort((e,t)=>e.startIndex-t.startIndex);let n=[];for(let e of s){let t=n[n.length-1];t&&t.startIndex===e.startIndex&&t.endIndex===e.endIndex?e.algorithms.forEach(e=>t.algorithms.add(e)):n.push(e)}let r=[],i=-1;for(let e of n)e.startIndex>=i&&(r.push(e),i=e.endIndex);if(r.length===0)return 0;let c=document.createDocumentFragment(),l=0;for(let n of r){let r=e.slice(l,n.startIndex);r&&c.appendChild(document.createTextNode(r));let i=document.createElement(`mark`);i.className=`sweetbonanza-highlighted-word`,i.style.backgroundColor=`red`,i.style.color=`white`,i.style.cursor=`help`;let a=e.slice(n.startIndex,n.endIndex);i.textContent=a;let s=a.toLowerCase();t.set(s,(t.get(s)||0)+1),i.dataset.keyword=a,i.dataset.algorithms=Array.from(n.algorithms).join(`, `),c.appendChild(i),l=n.endIndex,o++}let u=e.slice(l);u&&c.appendChild(document.createTextNode(u)),a.parentNode?.replaceChild(c,a)}return o}function u(){let r=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:e=>{if(!e.nodeValue?.trim())return NodeFilter.FILTER_REJECT;let t=e.parentNode;return t&&[`SCRIPT`,`STYLE`,`NOSCRIPT`,`MARK`].includes(t.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),a=[],l=r.nextNode();for(;l;)a.push(l),l=r.nextNode();let u=0;for(let t of a){let n=t.nodeValue||``,r=[i(n,e),c(n,e),d(n),y(n,e)];u+=s(n,r,t)}document.querySelectorAll(`.sweetbonanza-highlighted-word`).forEach(e=>{let r=e;r.addEventListener(`mouseenter`,e=>{let i=e,a=r.dataset.keyword||``,s=a.toLowerCase(),c=t.get(s)||0,l=r.dataset.algorithms||``,u=``;l.split(`, `).forEach(e=>{if(!e)return;let t=n.get(e)||0;u+=`- ${e}: ${t.toFixed(3)} ms<br>`}),o.innerHTML=`
            <strong>Keyword:</strong> ${a}<br>
            <strong>Algoritma:</strong> ${l}<br>
            <strong>Frekuensi:</strong> ${c} kali<br>
            <strong>Total Waktu Eksekusi:</strong><br>
            ${u}
          `,o.style.display=`block`,o.style.left=`${i.pageX+15}px`,o.style.top=`${i.pageY+15}px`}),r.addEventListener(`mousemove`,e=>{let t=e;o.style.left=`${t.pageX+15}px`,o.style.top=`${t.pageY+15}px`}),r.addEventListener(`mouseleave`,()=>{o.style.display=`none`})}),console.log(`Pencarian selesai. Ditemukan ${u} kata unik.`),console.log(`Statistik Waktu per algoritma:`,Object.fromEntries(n))}u()}));export default E();