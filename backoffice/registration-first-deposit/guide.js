'use strict';
document.getElementById('content').innerHTML=CampaignContent.sections.map(s=>`<section class="panel" id="${s.id}"><h2>${s.title}</h2><p class="guide-lead">${s.lead}</p>${s.html}</section>`).join('');
