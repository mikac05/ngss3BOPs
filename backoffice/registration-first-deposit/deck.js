'use strict';
const pages=CampaignContent.sections,$=id=>document.getElementById(id);
$('slides').innerHTML=pages.map((p,i)=>`<section class="slide panel" id="page-${i+1}"><h1>${p.title}</h1><p class="lead">${p.lead}</p>${p.html}</section>`).join('');
$('toc').innerHTML=pages.map((p,i)=>`<option value="${i}">${i+1}. ${p.title}</option>`).join('');
let pos=0;function show(i){pos=Math.max(0,Math.min(pages.length-1,i||0));document.querySelectorAll('.slide').forEach((s,n)=>s.hidden=n!==pos);$('count').textContent=`${pos+1} / ${pages.length}`;$('toc').value=pos;$('prev').disabled=pos===0;$('next').disabled=pos===pages.length-1;history.replaceState(null,'','#page-'+(pos+1));}
function hash(){show(Number(location.hash.replace('#page-',''))-1);}window.onhashchange=hash;$('prev').onclick=()=>show(pos-1);$('next').onclick=()=>show(pos+1);$('toc').onchange=e=>show(Number(e.target.value));document.addEventListener('keydown',e=>{if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')show(pos+1);if(e.key==='ArrowLeft')show(pos-1);});hash();
