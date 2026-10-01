'use strict';
document.getElementById('content').innerHTML=[...(window.ActivityIntegrationContent?.sections||[]),...CampaignContent.sections].map(s=>`<section class="panel" id="${s.id}"><h2>${s.title}</h2><p class="guide-lead">${s.lead}</p>${s.html}</section>`).join('');

window.ActivityIntegrationContent?.mount();

if(window.ParticipationStates){const stateSection=document.createElement('section');stateSection.className='panel';stateSection.id='participation-states';stateSection.innerHTML='<h2>参与与领奖状态</h2><p class="guide-lead">后台状态表示活动是否开放；玩家状态表示个人资格和领奖进度。已达标奖励即使遇到活动结束，也继续显示实际处理进度。</p><p>不能参加不等于尚未达标；已完成首充不等于已领奖。只有确认入账后，才显示已领奖。</p><div class="participation-cards">'+ParticipationStates.keys.map(key=>{const s=ParticipationStates.get(key),scenario=key==='available'?'new':key;return '<article><h3>'+s.title+'</h3><p>'+s.body+'</p><a href="player.html?scenario='+scenario+'">查看玩家画面</a></article>';}).join('')+'</div>';document.getElementById('content').prepend(stateSection);

}
