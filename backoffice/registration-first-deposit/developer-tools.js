(function(){
 'use strict';const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
 ParticipationStates.keys.forEach(key=>{const option=document.createElement('option');option.value=key;option.textContent=ParticipationStates.get(key).title;$('previewState').append(option);});
 $('previewLanguage').value=['zh-CN','zh-TW','en','bn'].includes(q.get('lang'))?q.get('lang'):'zh-CN';
 $('previewState').value=ParticipationStates.keys.includes(q.get('scenario'))?q.get('scenario'):'available';
 function update(){const lang=$('previewLanguage').value,key=$('previewState').value,state=ParticipationStates.get(key,lang),params=new URLSearchParams({lang,scenario:key==='available'?'new':key});$('stateDescription').textContent=state.title+' · '+state.body;$('stateDescription').lang=lang;$('activityPreview').href='player.html?'+params;$('depositPreview').href='deposit.html?'+params;history.replaceState(null,'','?'+new URLSearchParams({lang,scenario:key}));}
 $('previewLanguage').onchange=$('previewState').onchange=update;update();
})();
