(function(){var e=Object.defineProperty,t=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,r=Object.prototype.hasOwnProperty,i=(e,t)=>()=>(e&&(t=e(e=0)),t),a=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),o=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r},s=(i,a,o,s)=>{if(a&&typeof a==`object`||typeof a==`function`)for(var c=n(a),l=0,u=c.length,d;l<u;l++)d=c[l],!r.call(i,d)&&d!==o&&e(i,d,{get:(e=>a[e]).bind(null,d),enumerable:!(s=t(a,d))||s.enumerable});return i},c=t=>r.call(t,`module.exports`)?t[`module.exports`]:s(e({},`__esModule`,{value:!0}),t);function l(e){let t=new Map;for(let n=0;n<e.length;n++)t.set(e[n],n);return t}function u(e,t){if(t.length===0||e.length===0||t.length>e.length)return{indexes:[],comparisons:0};let n=l(t),r=[],i=0,a=0;for(;a<=e.length-t.length;){let o=t.length-1;for(;o>=0&&(i++,t[o]===e[a+o]);)o--;if(o<0)r.push(a),a+=1;else{let t=e[a+o],r=n.get(t)??-1,i=o-r;a+=Math.max(1,i)}}return{indexes:r,comparisons:i}}function d(e,t){let n=performance.now(),r=[],i=0,a=e.toLowerCase();for(let n of t){let t=n.trim();if(t.length===0)continue;let o=u(a,t.toLowerCase());i+=o.comparisons;for(let n of o.indexes){let i=n+t.length;r.push({keyword:t,matchedText:e.slice(n,i),startIndex:n,endIndex:i,algorithm:`Boyer-Moore`,similarity:1})}}return{algorithm:`Boyer-Moore`,matches:r,stats:{algorithm:`Boyer-Moore`,totalMatches:r.length,comparisons:i,executionTimeMs:performance.now()-n}}}function f(e){let t=Array(e.length).fill(0),n=0,r=0,i=1;for(;i<e.length;)n++,e[i]===e[r]?(r++,t[i]=r,i++):r===0?(t[i]=0,i++):r=t[r-1];return{lps:t,comparisons:n}}function p(e,t){if(t.length===0)return{indexes:[],comparisons:0};let{lps:n,comparisons:r}=f(t),i=[],a=r,o=0,s=0;for(;o<e.length;)a++,e[o]===t[s]&&(o++,s++),s===t.length?(i.push(o-s),s=n[s-1]):o<e.length&&e[o]!==t[s]&&(a++,s===0?o++:s=n[s-1]);return{indexes:i,comparisons:a}}function m(e,t){let n=performance.now(),r=[],i=0,a=e.toLowerCase();for(let n of t){let t=n.trim();if(t.length===0)continue;let o=p(a,t.toLowerCase());i+=o.comparisons;for(let n of o.indexes){let i=n+t.length;r.push({keyword:t,matchedText:e.slice(n,i),startIndex:n,endIndex:i,algorithm:`KMP`,similarity:1})}}return{algorithm:`KMP`,matches:r,stats:{algorithm:`KMP`,totalMatches:r.length,comparisons:i,executionTimeMs:performance.now()-n}}}var h=/[\p{L}][\p{L}\p{M}]{2,}[0-9]{2,4}/giu;function g(e){let t=e.replace(/[^\p{L}\p{M}]/gu,``).length,n=e.replace(/[^0-9]/g,``).length;return t>=3&&n>=2}function _(e){let t=performance.now(),n=[];h.lastIndex=0;for(let t of e.matchAll(h)){let e=t[0],r=t.index??0,i=r+e.length;g(e)&&n.push({keyword:e,matchedText:e,startIndex:r,endIndex:i,algorithm:`Regex`,similarity:1})}return{algorithm:`Regex`,matches:n,stats:{algorithm:`Regex`,totalMatches:n.length,executionTimeMs:performance.now()-t}}}var v=.82,y=/[\p{L}\p{M}0-9]{3,}/giu,b=new Map([[`o|0`,.2],[`i|1`,.2],[`l|1`,.3],[`a|4`,.3],[`e|3`,.3],[`s|5`,.3],[`a|α`,.2]]);function x(e,t){if(e===t)return 0;let n=`${e}|${t}`,r=`${t}|${e}`;return b.get(n)??b.get(r)??1}function S(e,t){let n=e.toLowerCase(),r=t.toLowerCase(),i=n.length+1,a=r.length+1,o=Array.from({length:i},()=>Array(a).fill(0));for(let e=0;e<i;e++)o[e][0]=e;for(let e=0;e<a;e++)o[0][e]=e;for(let e=1;e<i;e++)for(let t=1;t<a;t++){let i=o[e-1][t]+1,a=o[e][t-1]+1,s=o[e-1][t-1]+x(n[e-1],r[t-1]);o[e][t]=Math.min(i,a,s)}return o[n.length][r.length]}function C(e,t){let n=Math.max(e.length,t.length);return n===0?1:1-S(e,t)/n}function w(e){let t=[];y.lastIndex=0;for(let n of e.matchAll(y)){let e=n[0],r=n.index??0;t.push({token:e,startIndex:r,endIndex:r+e.length})}return t}function T(e,t){return Math.abs(e.length-t.length)<=Math.max(2,Math.floor(t.length*.4))}function E(e,t,n=v){let r=performance.now(),i=[],a=w(e);for(let{token:e,startIndex:r,endIndex:o}of a){let a=``,s=0;for(let n of t){let t=n.trim();if(t.length===0||!T(e,t))continue;let r=C(e,t);r>s&&(a=t,s=r)}s>=n&&e.toLowerCase()!==a.toLowerCase()&&i.push({keyword:a,matchedText:e,startIndex:r,endIndex:o,algorithm:`Weighted-Levenshtein`,similarity:s})}return{algorithm:`Weighted-Levenshtein`,matches:i,stats:{algorithm:`Weighted-Levenshtein`,totalMatches:i.length,executionTimeMs:performance.now()-r}}}var D=`sweetbonanza.scanStatistics`;function ee(){return globalThis.chrome}function O(e){let t=ee(),n=t?.storage?.local;return n?new Promise((r,i)=>{n.set({[D]:e},()=>{let e=t?.runtime?.lastError?.message;if(e){i(Error(e));return}r()})}):Promise.resolve()}var k=`sweetbonanza.ocrEnabled`,A=`sweetbonanza.blurEnabled`;function j(){return globalThis.chrome}function te(e){let t=j(),n=t?.storage?.local;return n?new Promise((r,i)=>{n.get(e,n=>{let a=t?.runtime?.lastError?.message;if(a){i(Error(a));return}r(n[e]===!0)})}):Promise.resolve(!1)}function ne(e,t){let n=j()?.storage?.onChanged;if(!n)return()=>void 0;let r=(n,r)=>{r!==`local`||!n[e]||t(n[e].newValue===!0)};return n.addListener(r),()=>n.removeListener(r)}function re(){return te(k)}function ie(e){return ne(k,e)}function ae(){return te(A)}function M(e){return ne(A,e)}var oe=a(((e,t)=>{var n=function(e){"use strict";var t=Object.prototype,n=t.hasOwnProperty,r=Object.defineProperty||function(e,t,n){e[t]=n.value},i,a=typeof Symbol==`function`?Symbol:{},o=a.iterator||`@@iterator`,s=a.asyncIterator||`@@asyncIterator`,c=a.toStringTag||`@@toStringTag`;function l(e,t,n){return Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{l({},``)}catch{l=function(e,t,n){return e[t]=n}}function u(e,t,n,i){var a=t&&t.prototype instanceof _?t:_,o=Object.create(a.prototype);return r(o,`_invoke`,{value:E(e,n,new k(i||[]))}),o}e.wrap=u;function d(e,t,n){try{return{type:`normal`,arg:e.call(t,n)}}catch(e){return{type:`throw`,arg:e}}}var f=`suspendedStart`,p=`suspendedYield`,m=`executing`,h=`completed`,g={};function _(){}function v(){}function y(){}var b={};l(b,o,function(){return this});var x=Object.getPrototypeOf,S=x&&x(x(A([])));S&&S!==t&&n.call(S,o)&&(b=S);var C=y.prototype=_.prototype=Object.create(b);v.prototype=y,r(C,`constructor`,{value:y,configurable:!0}),r(y,`constructor`,{value:v,configurable:!0}),v.displayName=l(y,c,`GeneratorFunction`);function w(e){[`next`,`throw`,`return`].forEach(function(t){l(e,t,function(e){return this._invoke(t,e)})})}e.isGeneratorFunction=function(e){var t=typeof e==`function`&&e.constructor;return t?t===v||(t.displayName||t.name)===`GeneratorFunction`:!1},e.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,y):(e.__proto__=y,l(e,c,`GeneratorFunction`)),e.prototype=Object.create(C),e},e.awrap=function(e){return{__await:e}};function T(e,t){function i(r,a,o,s){var c=d(e[r],e,a);if(c.type===`throw`)s(c.arg);else{var l=c.arg,u=l.value;return u&&typeof u==`object`&&n.call(u,`__await`)?t.resolve(u.__await).then(function(e){i(`next`,e,o,s)},function(e){i(`throw`,e,o,s)}):t.resolve(u).then(function(e){l.value=e,o(l)},function(e){return i(`throw`,e,o,s)})}}var a;function o(e,n){function r(){return new t(function(t,r){i(e,n,t,r)})}return a=a?a.then(r,r):r()}r(this,`_invoke`,{value:o})}w(T.prototype),l(T.prototype,s,function(){return this}),e.AsyncIterator=T,e.async=function(t,n,r,i,a){a===void 0&&(a=Promise);var o=new T(u(t,n,r,i),a);return e.isGeneratorFunction(n)?o:o.next().then(function(e){return e.done?e.value:o.next()})};function E(e,t,n){var r=f;return function(i,a){if(r===m)throw Error(`Generator is already running`);if(r===h){if(i===`throw`)throw a;return j()}for(n.method=i,n.arg=a;;){var o=n.delegate;if(o){var s=D(o,n);if(s){if(s===g)continue;return s}}if(n.method===`next`)n.sent=n._sent=n.arg;else if(n.method===`throw`){if(r===f)throw r=h,n.arg;n.dispatchException(n.arg)}else n.method===`return`&&n.abrupt(`return`,n.arg);r=m;var c=d(e,t,n);if(c.type===`normal`){if(r=n.done?h:p,c.arg===g)continue;return{value:c.arg,done:n.done}}else c.type===`throw`&&(r=h,n.method=`throw`,n.arg=c.arg)}}}function D(e,t){var n=t.method,r=e.iterator[n];if(r===i)return t.delegate=null,n===`throw`&&e.iterator.return&&(t.method=`return`,t.arg=i,D(e,t),t.method===`throw`)||n!==`return`&&(t.method=`throw`,t.arg=TypeError(`The iterator does not provide a '`+n+`' method`)),g;var a=d(r,e.iterator,t.arg);if(a.type===`throw`)return t.method=`throw`,t.arg=a.arg,t.delegate=null,g;var o=a.arg;if(!o)return t.method=`throw`,t.arg=TypeError(`iterator result is not an object`),t.delegate=null,g;if(o.done)t[e.resultName]=o.value,t.next=e.nextLoc,t.method!==`return`&&(t.method=`next`,t.arg=i);else return o;return t.delegate=null,g}w(C),l(C,c,`Generator`),l(C,o,function(){return this}),l(C,`toString`,function(){return`[object Generator]`});function ee(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function O(e){var t=e.completion||{};t.type=`normal`,delete t.arg,e.completion=t}function k(e){this.tryEntries=[{tryLoc:`root`}],e.forEach(ee,this),this.reset(!0)}e.keys=function(e){var t=Object(e),n=[];for(var r in t)n.push(r);return n.reverse(),function e(){for(;n.length;){var r=n.pop();if(r in t)return e.value=r,e.done=!1,e}return e.done=!0,e}};function A(e){if(e){var t=e[o];if(t)return t.call(e);if(typeof e.next==`function`)return e;if(!isNaN(e.length)){var r=-1,a=function t(){for(;++r<e.length;)if(n.call(e,r))return t.value=e[r],t.done=!1,t;return t.value=i,t.done=!0,t};return a.next=a}}return{next:j}}e.values=A;function j(){return{value:i,done:!0}}return k.prototype={constructor:k,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=i,this.done=!1,this.delegate=null,this.method=`next`,this.arg=i,this.tryEntries.forEach(O),!e)for(var t in this)t.charAt(0)===`t`&&n.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=i)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if(e.type===`throw`)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function r(n,r){return s.type=`throw`,s.arg=e,t.next=n,r&&(t.method=`next`,t.arg=i),!!r}for(var a=this.tryEntries.length-1;a>=0;--a){var o=this.tryEntries[a],s=o.completion;if(o.tryLoc===`root`)return r(`end`);if(o.tryLoc<=this.prev){var c=n.call(o,`catchLoc`),l=n.call(o,`finallyLoc`);if(c&&l){if(this.prev<o.catchLoc)return r(o.catchLoc,!0);if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else if(c){if(this.prev<o.catchLoc)return r(o.catchLoc,!0)}else if(l){if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else throw Error(`try statement without catch or finally`)}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var i=this.tryEntries[r];if(i.tryLoc<=this.prev&&n.call(i,`finallyLoc`)&&this.prev<i.finallyLoc){var a=i;break}}a&&(e===`break`||e===`continue`)&&a.tryLoc<=t&&t<=a.finallyLoc&&(a=null);var o=a?a.completion:{};return o.type=e,o.arg=t,a?(this.method=`next`,this.next=a.finallyLoc,g):this.complete(o)},complete:function(e,t){if(e.type===`throw`)throw e.arg;return e.type===`break`||e.type===`continue`?this.next=e.arg:e.type===`return`?(this.rval=this.arg=e.arg,this.method=`return`,this.next=`end`):e.type===`normal`&&t&&(this.next=t),g},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.finallyLoc===e)return this.complete(n.completion,n.afterLoc),O(n),g}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var n=this.tryEntries[t];if(n.tryLoc===e){var r=n.completion;if(r.type===`throw`){var i=r.arg;O(n)}return i}}throw Error(`illegal catch attempt`)},delegateYield:function(e,t,n){return this.delegate={iterator:A(e),resultName:t,nextLoc:n},this.method===`next`&&(this.arg=i),g}},e}(typeof t==`object`?t.exports:{});try{regeneratorRuntime=n}catch{typeof globalThis==`object`?globalThis.regeneratorRuntime=n:Function(`r`,`regeneratorRuntime = r`)(n)}})),N=a(((e,t)=>{t.exports=(e,t)=>`${e}-${t}-${Math.random().toString(16).slice(3,8)}`})),se=a(((e,t)=>{var n=N(),r=0;t.exports=({id:e,action:t,payload:i={}})=>{let a=e;return a===void 0&&(a=n(`Job`,r),r+=1),{id:a,action:t,payload:i}}})),P=a((e=>{var t=!1;e.logging=t,e.setLogging=e=>{t=e},e.log=(...n)=>t?console.log.apply(e,n):null})),ce=a(((e,t)=>{var n=se(),{log:r}=P(),i=N(),a=0;t.exports=()=>{let t=i(`Scheduler`,a),o={},s={},c=[];a+=1;let l=()=>c.length,u=()=>Object.keys(o).length,d=()=>{if(c.length!==0){let e=Object.keys(o);for(let t=0;t<e.length;t+=1)if(s[e[t]]===void 0){c[0](o[e[t]]);break}}},f=(i,a)=>new Promise((o,l)=>{let u=n({action:i,payload:a});c.push(async t=>{c.shift(),s[t.id]=u;try{o(await t[i].apply(e,[...a,u.id]))}catch(e){l(e)}finally{delete s[t.id],d()}}),r(`[${t}]: Add ${u.id} to JobQueue`),r(`[${t}]: JobQueue length=${c.length}`),d()});return{addWorker:e=>(o[e.id]=e,r(`[${t}]: Add ${e.id}`),r(`[${t}]: Number of workers=${u()}`),d(),e.id),addJob:async(e,...n)=>{if(u()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return f(e,n)},terminate:async()=>{Object.keys(o).forEach(async e=>{await o[e].terminate()}),c=[]},getQueueLen:l,getNumWorkers:u}}})),le=a(((e,t)=>{t.exports=e=>{let t={};return typeof WorkerGlobalScope<`u`?t.type=`webworker`:typeof document==`object`?t.type=`browser`:typeof process==`object`&&typeof require==`function`&&(t.type=`node`),e===void 0?t:t[e]}})),ue=a(((e,t)=>{var n=le()(`type`)===`browser`?e=>new URL(e,window.location.href).href:e=>e;t.exports=e=>{let t={...e};return[`corePath`,`workerPath`,`langPath`].forEach(r=>{e[r]&&(t[r]=n(t[r]))}),t}})),de=a(((e,t)=>{t.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}})),fe=o({author:()=>``,browser:()=>R,bugs:()=>we,collective:()=>Ee,contributors:()=>z,default:()=>De,dependencies:()=>xe,description:()=>he,devDependencies:()=>be,homepage:()=>Te,jsdelivr:()=>I,license:()=>ye,main:()=>ge,name:()=>pe,overrides:()=>Se,repository:()=>Ce,scripts:()=>L,type:()=>_e,types:()=>ve,unpkg:()=>F,version:()=>me}),pe,me,he,ge,_e,ve,F,I,L,R,z,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe=i((()=>{pe=`tesseract.js`,me=`7.0.0`,he=`Pure Javascript Multilingual OCR`,ge=`src/index.js`,_e=`commonjs`,ve=`src/index.d.ts`,F=`dist/tesseract.min.js`,I=`dist/tesseract.min.js`,L={start:`node scripts/server.js`,build:`rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs`,"profile:tesseract":`webpack-bundle-analyzer dist/tesseract-stats.json`,"profile:worker":`webpack-bundle-analyzer dist/worker-stats.json`,prepublishOnly:`npm run build`,wait:`rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js`,test:`npm-run-all -p -r start test:all`,"test:all":`npm-run-all wait test:browser test:node:all`,"test:browser":`karma start karma.conf.js`,"test:node":`nyc mocha --exit --bail --require ./scripts/test-helper.mjs`,"test:node:all":`npm run test:node -- ./tests/*.test.mjs`,lint:`eslint src`,"lint:fix":`eslint --fix src`,postinstall:`opencollective-postinstall || true`},R={"./src/worker/node/index.js":`./src/worker/browser/index.js`},z=[`jeromewu`],ye=`Apache-2.0`,be={"@babel/core":`^7.21.4`,"@babel/eslint-parser":`^7.21.3`,"@babel/preset-env":`^7.21.4`,"@rollup/plugin-commonjs":`^24.1.0`,acorn:`^8.8.2`,"babel-loader":`^9.1.2`,buffer:`^6.0.3`,cors:`^2.8.5`,eslint:`^7.32.0`,"eslint-config-airbnb-base":`^14.2.1`,"eslint-plugin-import":`^2.27.5`,"expect.js":`^0.3.1`,express:`^4.18.2`,mocha:`^10.2.0`,"npm-run-all":`^4.1.5`,karma:`^6.4.2`,"karma-chrome-launcher":`^3.2.0`,"karma-firefox-launcher":`^2.1.2`,"karma-mocha":`^2.0.1`,"karma-webpack":`^5.0.0`,nyc:`^15.1.0`,rimraf:`^5.0.0`,rollup:`^3.20.7`,"wait-on":`^7.0.1`,webpack:`^5.79.0`,"webpack-bundle-analyzer":`^4.8.0`,"webpack-cli":`^5.0.1`,"webpack-dev-middleware":`^6.0.2`,"rollup-plugin-sourcemaps":`^0.6.3`},xe={"bmp-js":`^0.1.0`,"idb-keyval":`^6.2.0`,"is-url":`^1.2.4`,"node-fetch":`^2.6.9`,"opencollective-postinstall":`^2.0.3`,"regenerator-runtime":`^0.13.3`,"tesseract.js-core":`^7.0.0`,"wasm-feature-detect":`^1.8.0`,zlibjs:`^0.3.1`},Se={"@rollup/pluginutils":`^5.0.2`},Ce={type:`git`,url:`https://github.com/naptha/tesseract.js.git`},we={url:`https://github.com/naptha/tesseract.js/issues`},Te=`https://github.com/naptha/tesseract.js`,Ee={type:`opencollective`,url:`https://opencollective.com/tesseractjs`},De={name:pe,version:me,description:he,main:ge,type:_e,types:ve,unpkg:F,jsdelivr:I,scripts:L,browser:R,author:``,contributors:z,license:ye,devDependencies:be,dependencies:xe,overrides:Se,repository:Ce,bugs:we,homepage:Te,collective:Ee}})),ke=a(((e,t)=>{t.exports={workerBlobURL:!0,logger:()=>{}}})),Ae=a(((e,t)=>{var n=(Oe(),c(fe).default).version;t.exports={...ke(),workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${n}/dist/worker.min.js`}})),je=a(((e,t)=>{t.exports=({workerPath:e,workerBlobURL:t})=>{let n;if(Blob&&URL&&t){let t=new Blob([`importScripts("${e}");`],{type:`application/javascript`});n=new Worker(URL.createObjectURL(t))}else n=new Worker(e);return n}})),Me=a(((e,t)=>{t.exports=e=>{e.terminate()}})),Ne=a(((e,t)=>{t.exports=(e,t)=>{e.onmessage=({data:e})=>{t(e)}}})),Pe=a(((e,t)=>{t.exports=async(e,t)=>{e.postMessage(t)}})),Fe=a(((e,t)=>{var n=e=>new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{t(r.result)},r.onerror=({target:{error:{code:e}}})=>{n(Error(`File could not be read! Code=${e}`))},r.readAsArrayBuffer(e)}),r=async e=>{let t=e;return e===void 0?`undefined`:(typeof e==`string`?t=/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(e)?atob(e.split(`,`)[1]).split(``).map(e=>e.charCodeAt(0)):await(await fetch(e)).arrayBuffer():typeof HTMLElement<`u`&&e instanceof HTMLElement?(e.tagName===`IMG`&&(t=await r(e.src)),e.tagName===`VIDEO`&&(t=await r(e.poster)),e.tagName===`CANVAS`&&await new Promise(r=>{e.toBlob(async e=>{t=await n(e),r()})})):typeof OffscreenCanvas<`u`&&e instanceof OffscreenCanvas?t=await n(await e.convertToBlob()):(e instanceof File||e instanceof Blob)&&(t=await n(e)),new Uint8Array(t))};t.exports=r})),Ie=a(((e,t)=>{t.exports={defaultOptions:Ae(),spawnWorker:je(),terminateWorker:Me(),onMessage:Ne(),send:Pe(),loadImage:Fe()}})),Le=a(((e,t)=>{var n=ue(),r=se(),{log:i}=P(),a=N(),o=de(),{defaultOptions:s,spawnWorker:c,terminateWorker:l,onMessage:u,loadImage:d,send:f}=Ie(),p=0;t.exports=async(e=`eng`,t=o.LSTM_ONLY,m={},h={})=>{let g=a(`Worker`,p),{logger:_,errorHandler:v,...y}=n({...s,...m}),b={},x=typeof e==`string`?e.split(`+`):e,S=t,C=h,w=[o.DEFAULT,o.LSTM_ONLY].includes(t)&&!y.legacyCore,T,E,D=new Promise((e,t)=>{E=e,T=t}),ee=e=>{T(e.message)},O=c(y);O.onerror=ee,p+=1;let k=({id:e,action:t,payload:n})=>new Promise((r,a)=>{i(`[${g}]: Start ${e}, action=${t}`);let o=`${t}-${e}`;b[o]={resolve:r,reject:a},f(O,{workerId:g,jobId:e,action:t,payload:n})}),A=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),j=e=>k(r({id:e,action:`load`,payload:{options:{lstmOnly:w,corePath:y.corePath,logging:y.logging}}})),te=(e,t,n)=>k(r({id:n,action:`FS`,payload:{method:`writeFile`,args:[e,t]}})),ne=(e,t)=>k(r({id:t,action:`FS`,payload:{method:`readFile`,args:[e,{encoding:`utf8`}]}})),re=(e,t)=>k(r({id:t,action:`FS`,payload:{method:`unlink`,args:[e]}})),ie=(e,t,n)=>k(r({id:n,action:`FS`,payload:{method:e,args:t}})),ae=(e,t)=>k(r({id:t,action:`loadLanguage`,payload:{langs:e,options:{langPath:y.langPath,dataPath:y.dataPath,cachePath:y.cachePath,cacheMethod:y.cacheMethod,gzip:y.gzip,lstmOnly:[o.DEFAULT,o.LSTM_ONLY].includes(S)&&!y.legacyLang}}})),M=(e,t,n,i)=>k(r({id:i,action:`initialize`,payload:{langs:e,oem:t,config:n}})),oe=(e=`eng`,t,n,r)=>{if(w&&[o.TESSERACT_ONLY,o.TESSERACT_LSTM_COMBINED].includes(t))throw Error(`Legacy model requested but code missing.`);let i=t||S;S=i;let a=n||C;C=a;let s=(typeof e==`string`?e.split(`+`):e).filter(e=>!x.includes(e));return x.push(...s),s.length>0?ae(s,r).then(()=>M(e,i,a,r)):M(e,i,a,r)},N=(e={},t)=>k(r({id:t,action:`setParameters`,payload:{params:e}})),se=async(e,t={},n={text:!0},i)=>k(r({id:i,action:`recognize`,payload:{image:await d(e),options:t,output:n}})),P=async(e,t)=>{if(w)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return k(r({id:t,action:`detect`,payload:{image:await d(e)}}))},ce=async()=>(O!==null&&(l(O),O=null),Promise.resolve());u(O,({workerId:e,jobId:t,status:n,action:r,data:a})=>{let o=`${r}-${t}`;if(n===`resolve`)i(`[${e}]: Complete ${t}`),b[o].resolve({jobId:t,data:a}),delete b[o];else if(n===`reject`)if(b[o].reject(a),delete b[o],r===`load`&&T(a),v)v(a);else throw Error(a);else n===`progress`&&_({...a,userJobId:t})});let le={id:g,worker:O,load:A,writeText:te,readText:ne,removeFile:re,FS:ie,reinitialize:oe,setParameters:N,recognize:se,detect:P,terminate:ce};return j().then(()=>ae(e)).then(()=>M(e,t,h)).then(()=>E(le)).catch(()=>{}),D}})),Re=a(((e,t)=>{var n=Le();t.exports={recognize:async(e,t,r)=>{let i=await n(t,1,r);return i.recognize(e).finally(async()=>{await i.terminate()})},detect:async(e,t)=>{let r=await n(`osd`,0,t);return r.detect(e).finally(async()=>{await r.terminate()})}}})),ze=a(((e,t)=>{t.exports={AFR:`afr`,AMH:`amh`,ARA:`ara`,ASM:`asm`,AZE:`aze`,AZE_CYRL:`aze_cyrl`,BEL:`bel`,BEN:`ben`,BOD:`bod`,BOS:`bos`,BUL:`bul`,CAT:`cat`,CEB:`ceb`,CES:`ces`,CHI_SIM:`chi_sim`,CHI_TRA:`chi_tra`,CHR:`chr`,CYM:`cym`,DAN:`dan`,DEU:`deu`,DZO:`dzo`,ELL:`ell`,ENG:`eng`,ENM:`enm`,EPO:`epo`,EST:`est`,EUS:`eus`,FAS:`fas`,FIN:`fin`,FRA:`fra`,FRK:`frk`,FRM:`frm`,GLE:`gle`,GLG:`glg`,GRC:`grc`,GUJ:`guj`,HAT:`hat`,HEB:`heb`,HIN:`hin`,HRV:`hrv`,HUN:`hun`,IKU:`iku`,IND:`ind`,ISL:`isl`,ITA:`ita`,ITA_OLD:`ita_old`,JAV:`jav`,JPN:`jpn`,KAN:`kan`,KAT:`kat`,KAT_OLD:`kat_old`,KAZ:`kaz`,KHM:`khm`,KIR:`kir`,KOR:`kor`,KUR:`kur`,LAO:`lao`,LAT:`lat`,LAV:`lav`,LIT:`lit`,MAL:`mal`,MAR:`mar`,MKD:`mkd`,MLT:`mlt`,MSA:`msa`,MYA:`mya`,NEP:`nep`,NLD:`nld`,NOR:`nor`,ORI:`ori`,PAN:`pan`,POL:`pol`,POR:`por`,PUS:`pus`,RON:`ron`,RUS:`rus`,SAN:`san`,SIN:`sin`,SLK:`slk`,SLV:`slv`,SPA:`spa`,SPA_OLD:`spa_old`,SQI:`sqi`,SRP:`srp`,SRP_LATN:`srp_latn`,SWA:`swa`,SWE:`swe`,SYR:`syr`,TAM:`tam`,TEL:`tel`,TGK:`tgk`,TGL:`tgl`,THA:`tha`,TIR:`tir`,TUR:`tur`,UIG:`uig`,UKR:`ukr`,URD:`urd`,UZB:`uzb`,UZB_CYRL:`uzb_cyrl`,VIE:`vie`,YID:`yid`}})),Be=a(((e,t)=>{t.exports={OSD_ONLY:`0`,AUTO_OSD:`1`,AUTO_ONLY:`2`,AUTO:`3`,SINGLE_COLUMN:`4`,SINGLE_BLOCK_VERT_TEXT:`5`,SINGLE_BLOCK:`6`,SINGLE_LINE:`7`,SINGLE_WORD:`8`,CIRCLE_WORD:`9`,SINGLE_CHAR:`10`,SPARSE_TEXT:`11`,SPARSE_TEXT_OSD:`12`,RAW_LINE:`13`}})),Ve=a(((e,t)=>{oe();var n=ce(),r=Le(),i=Re(),a=ze(),o=de(),s=Be(),{setLogging:c}=P();t.exports={languages:a,OEM:o,PSM:s,createScheduler:n,createWorker:r,setLogging:c,...i}}))(),B=`slot
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
`.split(/\r?\n/).map(e=>e.trim()).filter(Boolean),He=[`Boyer-Moore`,`KMP`,`Regex`,`Weighted-Levenshtein`,`OCR`],V=new Map,H=new Map,U=new Map,W=new Map,G=new Map,Ue=12,K=80,We=500,Ge=200,Ke=2,qe=900,Je=1600,Ye=6e4,Xe=45e3;He.forEach(e=>{U.set(e,0),W.set(e,0)});var Ze=0,Qe=null,$e=!1,et=!1,q,tt=!1,J=!1,Y=new Set,X=document.createElement(`div`);X.style.position=`absolute`,X.style.display=`none`,X.style.backgroundColor=`#333`,X.style.color=`#fff`,X.style.padding=`8px`,X.style.borderRadius=`4px`,X.style.fontSize=`12px`,X.style.zIndex=`999999`,X.style.pointerEvents=`none`,X.style.lineHeight=`1.5`,document.body.appendChild(X);function nt(e,t,n){let r=0,i=[];for(let e of t){let t=U.get(e.algorithm)||0;U.set(e.algorithm,t+e.stats.executionTimeMs);let n=W.get(e.algorithm)||0;if(W.set(e.algorithm,n+e.matches.length),typeof e.stats.comparisons==`number`){let t=G.get(e.algorithm)||0;G.set(e.algorithm,t+e.stats.comparisons)}for(let t of e.matches)i.push({...t,algorithms:new Set([e.algorithm])})}if(i.length>0){i.sort((e,t)=>e.startIndex-t.startIndex);let t=[];for(let e of i){let n=t[t.length-1];n&&n.startIndex===e.startIndex&&n.endIndex===e.endIndex?e.algorithms.forEach(e=>n.algorithms.add(e)):t.push(e)}let a=[],o=-1;for(let e of t)e.startIndex>=o&&(a.push(e),o=e.endIndex);if(a.length===0)return 0;let s=document.createDocumentFragment(),c=0;for(let t of a){let n=e.slice(c,t.startIndex);n&&s.appendChild(document.createTextNode(n));let i=document.createElement(`mark`);i.className=`sweetbonanza-highlighted-word`,i.style.backgroundColor=`red`,i.style.color=`white`,i.style.cursor=`help`,i.dataset.sweetbonanzaTextHighlight=`true`;let a=e.slice(t.startIndex,t.endIndex);i.textContent=a;let o=a.toLowerCase();V.set(o,(V.get(o)||0)+1),i.dataset.keyword=a,i.dataset.algorithms=Array.from(t.algorithms).join(`, `),tt&&(i.style.filter=`blur(4px)`,i.dataset.sweetbonanzaBlurred=`true`),s.appendChild(i),c=t.endIndex,r++}let l=e.slice(c);l&&s.appendChild(document.createTextNode(l)),n.parentNode?.replaceChild(s,n)}return r}function rt(e){return it()?.runtime?.getURL?.(e)||e}function it(){return globalThis.chrome}async function at(){if(!Qe){let e={workerPath:rt(`tesseract/worker.min.js`),corePath:rt(`tesseract-core`)};Qe=(0,Ve.createWorker)(`eng`,1,{...e,workerBlobURL:!0}).catch(t=>(console.warn(`OCR worker blob gagal dibuat, mencoba worker langsung:`,t),(0,Ve.createWorker)(`eng`,1,{...e,workerBlobURL:!1})))}return Qe}function ot(e,t,n){let r,i=new Promise((e,i)=>{r=window.setTimeout(()=>i(Error(n)),t)});return Promise.race([e,i]).finally(()=>{typeof r==`number`&&window.clearTimeout(r)})}function st(){return Ze+(W.get(`OCR`)||0)}function ct(e){let t={algorithm:e,matchCount:W.get(e)||0,executionTimeMs:U.get(e)||0},n=G.get(e);return typeof n==`number`&&(t.comparisons=n),t}function lt(e){return{totalMatches:e,keywordFrequencies:Array.from(V.entries()).map(([e,t])=>({keyword:e,count:t})).sort((e,t)=>t.count-e.count),algorithms:He.map(ct),scannedAt:new Date().toISOString(),pageUrl:window.location.href,pageTitle:document.title}}function Z(){ut(lt(st()))}function ut(e){O(e).catch(e=>{console.error(`Gagal menyimpan statistik scan:`,e)})}function dt(e){return e.currentSrc||e.src}function ft(e){let t=it(),n=t?.runtime?.sendMessage;return n?new Promise(r=>{n({type:`SWEETBONANZA_FETCH_IMAGE`,url:e},e=>{let n=t?.runtime?.lastError?.message;if(n||!e?.ok){(n||e?.error)&&console.warn(`Gambar OCR tidak dapat diambil lewat background:`,n||e?.error),r(null);return}r(e.dataUrl)})}):Promise.resolve(null)}function pt(){let e=it(),t=e?.runtime?.sendMessage;return t?new Promise(n=>{t({type:`SWEETBONANZA_CAPTURE_VISIBLE_TAB`},t=>{let r=e?.runtime?.lastError?.message;if(r||!t?.ok){(r||t?.error)&&console.warn(`Screenshot OCR tidak dapat diambil:`,r||t?.error),n(null);return}n(t.dataUrl)})}):Promise.resolve(null)}async function mt(e){let t=dt(e);return t.startsWith(`data:`)?t:(t.startsWith(`http://`)||t.startsWith(`https://`))&&await ft(t)||e}function ht(e){tt=e,document.querySelectorAll(`.sweetbonanza-highlighted-word`).forEach(t=>{e?(t.style.filter=`blur(4px)`,t.dataset.sweetbonanzaBlurred=`true`):(t.style.filter=``,delete t.dataset.sweetbonanzaBlurred)})}function gt(e,t){e.dataset.sweetbonanzaOcrDetected=`true`,e.dataset.sweetbonanzaOcrKeywords=t.join(`, `),delete e.dataset.sweetbonanzaOcrFailures,e.style.filter=`blur(8px)`,e.style.outline=`3px solid #b42318`,e.style.outlineOffset=`2px`,e.title=`Judol terdeteksi dari OCR: ${t.join(`, `)}`}function _t(e){delete e.dataset.sweetbonanzaOcrProcessed,delete e.dataset.sweetbonanzaOcrDetected,delete e.dataset.sweetbonanzaOcrKeywords,delete e.dataset.sweetbonanzaOcrFailures,e.style.filter=``,e.style.outline=``,e.style.outlineOffset=``,e.removeAttribute(`title`)}function vt(){document.querySelectorAll(`img[data-sweetbonanza-ocr-processed='true'], img[data-sweetbonanza-ocr-detected='true'], img[data-sweetbonanza-ocr-failures]`).forEach(_t)}function yt(){W.set(`OCR`,0),U.set(`OCR`,0),G.set(`OCR`,0),Y.clear();for(let[e,t]of H.entries()){let n=(V.get(e)||0)-t;n>0?V.set(e,n):V.delete(e)}H.clear(),Z()}function bt(e){let t=e.getBoundingClientRect(),n=window.getComputedStyle(e);return e.complete&&e.naturalWidth>=K&&e.naturalHeight>=K&&t.width>=K&&t.height>=K&&n.display!==`none`&&n.visibility!==`hidden`&&n.opacity!==`0`}function xt(e){let t=Number(e.dataset.sweetbonanzaOcrFailures||`0`);return Number.isFinite(t)?t:0}function St(e,t){let n=xt(e)+1;e.dataset.sweetbonanzaOcrFailures=String(n),Q(0),Z(),console.warn(`OCR gambar gagal diproses (${n}/${Ke}):`,t)}function Ct(e){return!e.dataset.sweetbonanzaOcrProcessed&&xt(e)<Ke&&bt(e)}function wt(){return Array.from(document.images).filter(Ct).sort((e,t)=>e.getBoundingClientRect().top-t.getBoundingClientRect().top).slice(0,Ue)}function Tt(){return Array.from(document.images).some(Ct)}function Et(e){let t=e.flatMap(e=>e.matches),n=new Set,r=[];for(let e of t){let t=`${e.startIndex}:${e.endIndex}:${e.keyword.toLowerCase()}`;n.has(t)||(n.add(t),r.push(e))}return r}function Dt(e){return Et([d(e,B),m(e,B),_(e),E(e,B)])}function Ot(e){return new Promise((t,n)=>{let r=new Image;r.onload=()=>t(r),r.onerror=()=>n(Error(`Data gambar OCR tidak dapat dimuat.`)),r.src=e})}async function kt(e){if(!e.startsWith(`data:image/`))return e;let t=await Ot(e),n=t.naturalWidth||t.width,r=t.naturalHeight||t.height,i=Math.max(n,r);if(n<=0||r<=0||i<=0)return e;let a=1;i<qe?a=Math.min(3,qe/i):i>Je&&(a=Je/i);let o=Math.max(1,Math.round(n*a)),s=Math.max(1,Math.round(r*a)),c=document.createElement(`canvas`);c.width=o,c.height=s;let l=c.getContext(`2d`);return l?(l.fillStyle=`#ffffff`,l.fillRect(0,0,o,s),l.imageSmoothingEnabled=!0,l.imageSmoothingQuality=`high`,l.filter=`grayscale(1) contrast(1.35)`,l.drawImage(t,0,0,o,s),c.toDataURL(`image/png`)):e}async function At(e){if(typeof e!=`string`)return e;try{return await kt(e)}catch(t){return console.warn(`Preprocessing OCR gagal, memakai gambar asli:`,t),e}}function jt(e,t){G.set(`OCR`,(G.get(`OCR`)||0)+1),U.set(`OCR`,(U.get(`OCR`)||0)+t),W.set(`OCR`,(W.get(`OCR`)||0)+e.length);for(let t of e){let e=t.keyword.toLowerCase();V.set(e,(V.get(e)||0)+1),H.set(e,(H.get(e)||0)+1)}}function Q(e){G.set(`OCR`,(G.get(`OCR`)||0)+1),U.set(`OCR`,(U.get(`OCR`)||0)+e)}async function Mt(e,t,n){let r=performance.now(),i=await At(t),a=(await ot(e.recognize(i),Xe,n)).data.text||``;return{matches:Dt(a),executionTimeMs:performance.now()-r,text:a}}function Nt(){let e=Math.max(window.innerHeight,1),t=Math.round(window.scrollY/e);return`${window.location.href}:${t}:${window.innerWidth}x${window.innerHeight}`}async function Pt(e){let t=Nt();if(Y.has(t))return!1;let n=await pt();if(!n)return!1;Y.add(t);try{let t=await Mt(e,n,`OCR screenshot melewati batas waktu.`);return t.matches.length>0?jt(t.matches,t.executionTimeMs):Q(t.executionTimeMs),console.info(`OCR screenshot selesai. Teks ${t.text.length} karakter, ${t.matches.length} match.`),Z(),!0}catch(e){return Y.delete(t),console.warn(`OCR screenshot gagal diproses:`,e),!1}}function $(e=We){J&&(typeof q==`number`&&window.clearTimeout(q),q=window.setTimeout(()=>{q=void 0,Ft()},e))}async function Ft(){if(!J)return;if($e){et=!0;return}let e=!1;$e=!0;try{let t=performance.now(),n;try{n=await ot(at(),Ye,`OCR worker melewati batas waktu inisialisasi.`)}catch(e){Q(performance.now()-t),Z(),console.warn(`OCR worker gagal disiapkan:`,e);return}let r=await Pt(n),i=wt();if(i.length===0){r||console.info(`OCR aktif, tetapi belum ada gambar visible yang memenuhi ukuran minimum.`);return}for(let e of i)try{let t=await mt(e),r=await Mt(n,t,`OCR gambar melewati batas waktu.`);e.dataset.sweetbonanzaOcrProcessed=`true`,r.matches.length>0?(jt(r.matches,r.executionTimeMs),gt(e,Array.from(new Set(r.matches.map(e=>e.keyword))))):Q(r.executionTimeMs),console.info(`OCR gambar selesai. Teks ${r.text.length} karakter, ${r.matches.length} match.`),Z()}catch(t){St(e,t)}e=Tt()}finally{$e=!1,(et||e)&&(et=!1,$(e?Ge:We))}}function It(){let e=()=>$(),t=e=>{e.target instanceof HTMLImageElement&&$()},n=new MutationObserver(e=>{e.some(e=>e.type===`attributes`&&e.target instanceof HTMLImageElement?(_t(e.target),!0):Array.from(e.addedNodes).some(e=>e instanceof HTMLImageElement?!0:e instanceof HTMLElement&&!!e.querySelector(`img`)))&&$()});return window.addEventListener(`load`,e),window.addEventListener(`scroll`,e,{passive:!0}),window.addEventListener(`resize`,e),document.addEventListener(`load`,t,!0),n.observe(document.body,{attributeFilter:[`src`,`srcset`],attributes:!0,childList:!0,subtree:!0}),()=>{window.removeEventListener(`load`,e),window.removeEventListener(`scroll`,e),window.removeEventListener(`resize`,e),document.removeEventListener(`load`,t,!0),n.disconnect(),typeof q==`number`&&window.clearTimeout(q)}}async function Lt(){let[e,t]=await Promise.all([ae(),re()]);ht(e),J=t;let n=M(e=>{ht(e)}),r=ie(e=>{if(J=e,e){$(0);return}vt(),yt()}),i=It();window.addEventListener(`unload`,()=>{n(),r(),i()},{once:!0}),t&&$(0)}function Rt(){let e=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:e=>{if(!e.nodeValue?.trim())return NodeFilter.FILTER_REJECT;let t=e.parentNode;return t&&[`SCRIPT`,`STYLE`,`NOSCRIPT`,`MARK`].includes(t.nodeName)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),t=[],n=e.nextNode();for(;n;)t.push(n),n=e.nextNode();let r=0;for(let e of t){let t=e.nodeValue||``,n=[d(t,B),m(t,B),_(t),E(t,B)];r+=nt(t,n,e)}document.querySelectorAll(`.sweetbonanza-highlighted-word`).forEach(e=>{let t=e;t.addEventListener(`mouseenter`,e=>{let n=e,r=t.dataset.keyword||``,i=r.toLowerCase(),a=V.get(i)||0,o=t.dataset.algorithms||``,s=``;o.split(`, `).forEach(e=>{if(!e)return;let t=U.get(e)||0;s+=`- ${e}: ${t.toFixed(3)} ms<br>`}),X.innerHTML=`
            <strong>Keyword:</strong> ${r}<br>
            <strong>Algoritma:</strong> ${o}<br>
            <strong>Frekuensi:</strong> ${a} kali<br>
            <strong>Total Waktu Eksekusi:</strong><br>
            ${s}
          `,X.style.display=`block`,X.style.left=`${n.pageX+15}px`,X.style.top=`${n.pageY+15}px`}),t.addEventListener(`mousemove`,e=>{let t=e;X.style.left=`${t.pageX+15}px`,X.style.top=`${t.pageY+15}px`}),t.addEventListener(`mouseleave`,()=>{X.style.display=`none`})}),console.log(`Pencarian selesai. Ditemukan ${r} kata unik.`),console.log(`Statistik Waktu per algoritma:`,Object.fromEntries(U)),Ze=r,Z()}Rt(),Lt()})();