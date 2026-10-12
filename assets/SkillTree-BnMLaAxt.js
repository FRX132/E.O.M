import{i as e}from"./rolldown-runtime-aKtaBQYM.js";import{R as t}from"./vendor-3d-globe-BhKFdDGp.js";import{i as n}from"./vendor-bootstrap-BeuC3L4E.js";import{l as r,s as i,t as a}from"./store-DKnoKcHR.js";import{n as o,r as s}from"./index-B7WRvO71.js";import{c,d as l,i as u,l as d,n as f,r as p,s as m,t as h}from"./vendor-flow-ZKP01r8j.js";var g=e(h(),1),_=e(t(),1),v=n();function y({isOpen:e,onClose:t,onSelectSkill:n}){let r=a(e=>e.activeQuests||[]),o=a(e=>e.updateQuestProgress),s=a(e=>e.completeQuest),c=a(e=>e.addXP),l=a(e=>e.skills||[]);if(!e)return null;let u=e=>{o(e),c(100)},d=e=>{s(e),c(250)};return(0,v.jsxs)(`div`,{className:`quest-drawer-overlay`,onClick:t,children:[(0,v.jsxs)(`div`,{className:`quest-drawer-content`,onClick:e=>e.stopPropagation(),children:[(0,v.jsxs)(`div`,{className:`quest-drawer-header`,children:[(0,v.jsxs)(`div`,{className:`quest-drawer-title-wrap`,children:[(0,v.jsx)(`span`,{style:{fontSize:`1.4rem`},children:`📜`}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`h3`,{children:`Active Hunter Quests`}),(0,v.jsxs)(`p`,{children:[r.length,` `,r.length===1?`quest`:`quests`,` in progress`]})]})]}),(0,v.jsx)(`button`,{className:`quest-drawer-close`,onClick:t,"aria-label":`Close Quest Log`,children:`✕`})]}),(0,v.jsx)(`div`,{className:`quest-drawer-body`,children:r.length===0?(0,v.jsxs)(`div`,{className:`quest-drawer-empty`,children:[(0,v.jsx)(`span`,{className:`quest-empty-icon`,children:`🎯`}),(0,v.jsx)(`h4`,{children:`No Active Quests`}),(0,v.jsx)(`p`,{children:`Click on any available skill in the tree with fulfilled prerequisites to initiate an unlock quest!`}),(0,v.jsxs)(`div`,{className:`quest-stats-badge`,children:[`Mastered Skills: `,(0,v.jsx)(`b`,{children:l.length}),` / `,i.length]})]}):(0,v.jsx)(`div`,{className:`quest-list`,children:r.map(e=>{let r=i.find(t=>t.id===e.skillId);if(!r)return null;let a=Math.min(Math.round(e.progress/e.total*100),100),o=e.progress>=e.total;return(0,v.jsxs)(`div`,{className:`quest-card`,children:[(0,v.jsxs)(`div`,{className:`quest-card-top`,children:[(0,v.jsx)(`div`,{className:`quest-card-icon`,children:r.icon}),(0,v.jsxs)(`div`,{className:`quest-card-info`,children:[(0,v.jsx)(`div`,{className:`quest-card-cat`,children:r.category}),(0,v.jsxs)(`h4`,{className:`quest-card-name`,onClick:()=>{n&&n(r),t()},title:`View on Skill Tree`,children:[r.name,` ❯`]})]}),(0,v.jsxs)(`div`,{className:`quest-card-days`,children:[e.progress,` / `,e.total,` Days`]})]}),(0,v.jsxs)(`div`,{className:`quest-card-desc`,children:[(0,v.jsx)(`b`,{children:`Objective:`}),` `,r.quest||r.habit]}),(0,v.jsx)(`div`,{className:`quest-progress-track`,children:(0,v.jsx)(`div`,{className:`quest-progress-fill`,style:{width:`${a}%`,background:o?`#22c55e`:`var(--primary)`}})}),(0,v.jsxs)(`div`,{className:`quest-card-actions`,children:[(0,v.jsx)(`button`,{className:`quest-action-btn advance`,onClick:()=>u(e.skillId),disabled:o,children:`+1 Day Progress (+100 XP)`}),o?(0,v.jsx)(`button`,{className:`quest-action-btn complete-ready`,onClick:()=>d(e.skillId),children:`🎉 Claim Unlock!`}):(0,v.jsx)(`button`,{className:`quest-action-btn complete-quick`,onClick:()=>d(e.skillId),title:`Instant completion with bonus XP`,children:`Instant Finish`})]})]},e.skillId)})})}),(0,v.jsx)(`div`,{className:`quest-drawer-footer`,children:(0,v.jsx)(`div`,{className:`quest-footer-tip`,children:`💡 Completing quests unlocks linked automated daily habits and grants substantial rank XP.`})})]}),(0,v.jsx)(`style`,{children:`
        .quest-drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          z-index: 10000;
          display: flex;
          justify-content: flex-end;
          animation: drawerFade 0.2s ease-out;
        }

        @keyframes drawerFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .quest-drawer-content {
          background: var(--bg-card, #121215);
          border-left: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          width: 440px;
          max-width: 90vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          box-shadow: -10px 0 40px rgba(0, 0, 0, 0.7);
          animation: drawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--text-main, #f4f4f5);
        }

        @keyframes drawerSlide {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        .quest-drawer-header {
          padding: 22px 24px;
          border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .quest-drawer-title-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quest-drawer-title-wrap h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .quest-drawer-title-wrap p {
          margin: 2px 0 0;
          font-size: 0.75rem;
          color: var(--text-muted, #a1a1aa);
        }

        .quest-drawer-close {
          background: transparent;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
          color: var(--text-muted, #a1a1aa);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .quest-drawer-close:hover {
          color: #fff;
          border-color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }

        .quest-drawer-body {
          flex: 1;
          padding: 20px 24px;
          overflow-y: auto;
        }

        .quest-drawer-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 60px 20px;
          gap: 12px;
        }

        .quest-empty-icon {
          font-size: 3rem;
          opacity: 0.8;
        }

        .quest-drawer-empty h4 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .quest-drawer-empty p {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-muted, #a1a1aa);
          line-height: 1.5;
        }

        .quest-stats-badge {
          margin-top: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          color: var(--text-muted, #a1a1aa);
        }

        .quest-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .quest-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: all 0.2s;
        }

        .quest-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .quest-card-top {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quest-card-icon {
          font-size: 1.6rem;
        }

        .quest-card-info {
          flex: 1;
        }

        .quest-card-cat {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--primary);
        }

        .quest-card-name {
          margin: 2px 0 0;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s;
        }
        .quest-card-name:hover {
          color: var(--primary);
        }

        .quest-card-days {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted, #a1a1aa);
        }

        .quest-card-desc {
          font-size: 0.82rem;
          color: var(--text-muted, #d4d4d8);
          line-height: 1.4;
        }

        .quest-progress-track {
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;
        }

        .quest-progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .quest-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }

        .quest-action-btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .quest-action-btn.advance {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .quest-action-btn.advance:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
        }
        .quest-action-btn.advance:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quest-action-btn.complete-ready {
          background: #22c55e;
          color: #fff;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
        }
        .quest-action-btn.complete-ready:hover {
          filter: brightness(1.15);
        }

        .quest-action-btn.complete-quick {
          background: transparent;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
          color: var(--text-muted, #a1a1aa);
          flex: 0.6;
        }
        .quest-action-btn.complete-quick:hover {
          color: #fff;
          border-color: #fff;
        }

        .quest-drawer-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          background: rgba(0, 0, 0, 0.2);
        }

        .quest-footer-tip {
          font-size: 0.76rem;
          color: var(--text-muted, #71717a);
          line-height: 1.4;
        }
      `})]})}var ee=()=>(0,v.jsx)(`svg`,{xmlns:`http://www.w3.org/2000/svg`,width:`22`,height:`22`,fill:`currentColor`,viewBox:`0 0 16 16`,children:(0,v.jsx)(`path`,{d:`M8.416.223a.5.5 0 0 0-.832 0l-3 4.5A.5.5 0 0 0 5 5.5h.098L3.076 8.735A.5.5 0 0 0 3.5 9.5h.191l-1.638 3.276a.5.5 0 0 0 .447.724H7V16h2v-2.5h4.5a.5.5 0 0 0 .447-.724L12.31 9.5h.191a.5.5 0 0 0 .424-.765L10.902 5.5H11a.5.5 0 0 0 .416-.777l-3-4.5zM6.437 4.758A1.5 1.5 0 0 0 5 5.5h-.01L8 1.01l3.01 4.49H11a1.5 1.5 0 0 0-1.437-.742l-3.126.5z`})}),b={Core:`#ffffff`,Health:`#10b981`,Mental:`#06b6d4`,Spirit:`#a855f7`,Social:`#ec4899`,Career:`#f59e0b`},x={customSkill:({data:e})=>{let{node:t,isUnlocked:n,canUnlock:r,activeQuest:i,handleNodeClick:a,theme:o,isDimmed:s,isHighlighted:c}=e,d=n(t.id),f=b[t.category]||`#777`,p=o===`dark`,m=!!i,h=r(t)&&!d&&!m;if(t.id===`core`)return(0,v.jsxs)(`div`,{onClick:()=>a(t),style:{border:`2px solid ${f}`,background:p?`rgba(20,20,24,0.95)`:`#1a1a1b`,padding:`0 20px`,height:`52px`,width:`210px`,display:`flex`,alignItems:`center`,justifyContent:`center`,borderRadius:`14px`,cursor:`pointer`,color:`#fff`,fontSize:`1rem`,fontWeight:800,boxShadow:p?`0 0 25px ${f}50`:`0 10px 30px rgba(0,0,0,0.25)`,transition:`all 0.25s ease`,opacity:s?.2:1},className:`skill-node-core`,title:`Life Tree - Central Nexus`,children:[(0,v.jsx)(u,{type:`source`,position:l.Top,id:`s-top`,style:{visibility:`hidden`}}),(0,v.jsx)(u,{type:`source`,position:l.Right,id:`s-right`,style:{visibility:`hidden`}}),(0,v.jsx)(u,{type:`source`,position:l.Bottom,id:`s-bottom`,style:{visibility:`hidden`}}),(0,v.jsx)(u,{type:`source`,position:l.Left,id:`s-left`,style:{visibility:`hidden`}}),(0,v.jsxs)(`span`,{children:[`🌳 `,t.name]})]});let g=p?`rgba(255, 255, 255, 0.08)`:`rgba(0, 0, 0, 0.08)`,_=p?`rgba(20, 20, 24, 0.45)`:`rgba(240, 240, 240, 0.4)`,y=`none`;return d?(g=f,_=p?`rgba(26, 26, 32, 0.95)`:`#ffffff`,y=`0 0 16px ${f}35`):m?(g=`#f59e0b`,_=p?`rgba(30, 25, 18, 0.9)`:`rgba(254, 243, 199, 0.9)`,y=`0 0 14px rgba(245, 158, 11, 0.35)`):h&&(g=`${f}90`,_=p?`rgba(26, 26, 34, 0.75)`:`rgba(245, 245, 250, 0.85)`,y=`0 0 10px ${f}20`),c&&(y=`0 0 20px #ffffff`,g=`#ffffff`),(0,v.jsxs)(`div`,{onClick:()=>a(t),style:{border:`1.5px solid ${g}`,background:_,padding:`0 10px`,width:`184px`,height:`46px`,borderRadius:`11px`,cursor:`pointer`,opacity:s?.15:1,color:d?p?`#fff`:`#111`:p?`#a1a1aa`:`#555`,fontSize:`0.86rem`,fontWeight:d?700:500,display:`flex`,alignItems:`center`,gap:`8px`,boxShadow:y,transition:`all 0.25s ease`,backdropFilter:`blur(10px)`,position:`relative`,overflow:`hidden`},title:`${t.name} (${t.category})`,className:`custom-skill-node ${d?`unlocked`:``} ${h?`available`:``} ${m?`in-progress`:``}`,children:[(0,v.jsx)(u,{type:`target`,position:e.targetPos,style:{visibility:`hidden`}}),(0,v.jsx)(`span`,{style:{fontSize:`1.25rem`,filter:d||m||h?`none`:`grayscale(100%) opacity(0.6)`,flexShrink:0},children:t.icon}),(0,v.jsx)(`span`,{style:{textOverflow:`ellipsis`,overflow:`hidden`,whiteSpace:`nowrap`,flex:1},children:t.name}),d&&(0,v.jsx)(`span`,{style:{fontSize:`0.75rem`,color:f,flexShrink:0},title:`Unlocked`,children:`✓`}),m&&(0,v.jsx)(`span`,{style:{fontSize:`0.7rem`,color:`#f59e0b`,fontWeight:800,flexShrink:0},title:`Quest In Progress`,children:`⏳`}),h&&(0,v.jsx)(`span`,{style:{fontSize:`0.7rem`,color:f,fontWeight:700,flexShrink:0},title:`Ready to Unlock`,children:`🔓`}),m&&i&&(0,v.jsx)(`div`,{style:{position:`absolute`,bottom:0,left:0,right:0,height:`3px`,background:`rgba(255,255,255,0.1)`},children:(0,v.jsx)(`div`,{style:{height:`100%`,width:`${Math.min(i.progress/i.total*100,100)}%`,background:`#f59e0b`,transition:`width 0.3s`}})}),(0,v.jsx)(u,{type:`source`,position:e.sourcePos,style:{visibility:`hidden`}})]})}};function S(){let[e,t]=(0,_.useState)(null),[n,u]=(0,_.useState)(!1),[h,S]=(0,_.useState)(!1),[C,w]=(0,_.useState)(!1),[T,E]=(0,_.useState)(`All`),[D,O]=(0,_.useState)(`All`),[k,A]=(0,_.useState)(``),[j,M]=(0,_.useState)(!0),N=a(e=>e.theme),P=a(e=>e.skills||[]),F=a(e=>e.profile?.xp||0),I=a(e=>e.activeQuests||[]),L=a(e=>e.startQuest),R=a(e=>e.updateQuestProgress),z=a(e=>e.completeQuest),B=a(e=>e.addXP),V=(0,_.useMemo)(()=>r(F),[F]),H=(0,_.useCallback)(e=>P.includes(e),[P]),U=(0,_.useCallback)(e=>H(e.id)?!1:(e.reqs||[]).every(e=>H(e)),[H]),W=(0,_.useCallback)(e=>I.find(t=>t.skillId===e),[I]),G=e=>{t(e)},K=e=>{H(e.id)||I.some(t=>t.skillId===e.id)||U(e)&&F>=(e.xpReq||0)&&(L(e.id,e.duration||1),t(null))},q=e=>{R(e),B(100)},J=e=>{z(e),B(250),t(null)},Y=(0,_.useMemo)(()=>{let e=[`Health`,`Mental`,`Spirit`,`Social`,`Career`],t={};return e.forEach(e=>{let n=i.filter(t=>t.category===e),r=n.filter(e=>H(e.id)).length;t[e]={total:n.length,unlocked:r,pct:n.length>0?Math.round(r/n.length*100):0}}),t},[H]),{layoutedNodes:X,layoutedEdges:Z}=(0,_.useMemo)(()=>{let e={Health:{dir:`RL`,targetPos:l.Right,sourcePos:l.Left,nodes:[],edges:[]},Spirit:{dir:`BT`,targetPos:l.Bottom,sourcePos:l.Top,nodes:[],edges:[]},Social:{dir:`LR`,targetPos:l.Left,sourcePos:l.Right,nodes:[],edges:[]},Career:{dir:`LR`,targetPos:l.Left,sourcePos:l.Right,nodes:[],edges:[]},Mental:{dir:`TB`,targetPos:l.Top,sourcePos:l.Bottom,nodes:[],edges:[]}},t=[],n=[],r=i.find(e=>e.id===`core`);return t.push({id:`core`,type:`customSkill`,data:{node:r,isUnlocked:H,canUnlock:U,activeQuest:null,handleNodeClick:G,theme:N,isDimmed:T!==`All`,isHighlighted:!1},position:{x:0,y:0}}),i.forEach(t=>{if(t.id===`core`)return;let r=e[t.category];r&&r.nodes.push(t),(t.reqs||[]).forEach(e=>{let i=H(t.id),a=U(t)||i,o={id:`e-${e}-${t.id}`,source:e,target:t.id,animated:!i&&a,style:{stroke:i?b[t.category]:N===`dark`?`rgba(255,255,255,0.12)`:`rgba(0,0,0,0.12)`,strokeWidth:i?2.5:1.5,opacity:i||a?1:.35}};e===`core`?(t.category===`Health`?o.sourceHandle=`s-left`:t.category===`Spirit`?o.sourceHandle=`s-top`:t.category===`Social`||t.category===`Career`?o.sourceHandle=`s-right`:t.category===`Mental`&&(o.sourceHandle=`s-bottom`),n.push(o)):r&&r.edges.push(o)})}),Object.keys(e).forEach(r=>{let i=e[r],a=new g.default.graphlib.Graph;a.setDefaultEdgeLabel(()=>({})),a.setGraph({rankdir:i.dir,ranksep:110,nodesep:38}),i.nodes.forEach(e=>a.setNode(e.id,{width:184,height:46})),i.edges.forEach(e=>a.setEdge(e.source,e.target)),g.default.layout(a);let o=0,s=0,c=0,l=0;i.nodes.forEach((e,t)=>{let n=a.node(e.id);t===0&&(o=n.x,s=n.y,c=n.x,l=n.y),o=Math.min(o,n.x),s=Math.min(s,n.y),c=Math.max(c,n.x),l=Math.max(l,n.y)}),i.nodes.forEach(e=>{let n=a.node(e.id),u=n.x,d=n.y;i.dir===`LR`?(u=n.x-o+150+30,r===`Social`?d=n.y-(s+l)/2-260:r===`Career`&&(d=n.y-(s+l)/2+260)):i.dir===`RL`?(u=n.x-c-150-30,d=n.y-(s+l)/2):i.dir===`BT`?(d=n.y-l-150-30,u=n.x-(o+c)/2):i.dir===`TB`&&(d=n.y-s+150+30,u=n.x-(o+c)/2);let f=k.trim()===``||e.name.toLowerCase().includes(k.toLowerCase())||e.habit&&e.habit.toLowerCase().includes(k.toLowerCase())||e.desc&&e.desc.toLowerCase().includes(k.toLowerCase()),p=T===`All`||e.category===T,m=H(e.id),h=!!W(e.id),g=U(e)&&!m&&!h,_=!0;D===`Unlocked`?_=m:D===`InProgress`?_=h:D===`Available`?_=g:D===`Locked`&&(_=!m&&!g&&!h);let v=!(f&&p&&_)&&(k.trim()!==``||T!==`All`||D!==`All`),y=k.trim()!==``&&f;t.push({id:e.id,type:`customSkill`,data:{node:e,isUnlocked:H,canUnlock:U,activeQuest:W(e.id),handleNodeClick:G,targetPos:i.targetPos,sourcePos:i.sourcePos,theme:N,isDimmed:v,isHighlighted:y},position:{x:u,y:d}})}),i.edges.forEach(e=>n.push(e))}),{layoutedNodes:t,layoutedEdges:n}},[H,U,W,N,T,D,k]),[te,Q,ne]=d(X),[re,$,ie]=c(Z);(0,_.useEffect)(()=>{Q(e=>e.map(e=>{let t=X.find(t=>t.id===e.id);return t?{...e,data:t.data}:e})),$(e=>e.map(e=>{let t=Z.find(t=>t.id===e.id);return t?{...t}:e}))},[X,Z,Q,$]);let ae=()=>{Q(X),$(Z)},oe=N===`dark`?`rgba(255,255,255,0.05)`:`rgba(0,0,0,0.08)`;return(0,v.jsxs)(`div`,{className:`premium-container skilltree-full-container`,style:{maxWidth:`1400px`,height:`100vh`,display:`flex`,flexDirection:`column`},children:[(0,v.jsxs)(`div`,{className:`skilltree-header`,children:[(0,v.jsxs)(`div`,{className:`skilltree-header-top`,children:[(0,v.jsxs)(`div`,{className:`skilltree-title-group`,children:[(0,v.jsx)(`div`,{className:`premium-icon-wrapper`,children:(0,v.jsx)(ee,{})}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`h1`,{className:`premium-title`,style:{fontSize:`1.4rem`,margin:0},children:`Life Tree & Skill Mastery`}),(0,v.jsxs)(`p`,{className:`premium-subtitle`,style:{fontSize:`0.8rem`,margin:0},children:[P.length,` of `,i.length,` skills mastered (`,Math.round(P.length/i.length*100),`%)`]})]})]}),(0,v.jsxs)(`div`,{className:`skilltree-actions-group`,children:[(0,v.jsxs)(`button`,{className:`skill-rank-btn`,onClick:()=>S(!0),style:{borderColor:V.currentRank.color},title:`Inspect Rank Hierarchy`,children:[(0,v.jsx)(`span`,{children:V.currentRank.badge}),(0,v.jsxs)(`span`,{className:`skill-rank-btn-text`,children:[`RANK `,V.currentRank.rank,` • `,V.currentRank.title]})]}),(0,v.jsxs)(`button`,{className:`skill-quest-btn`,onClick:()=>u(!0),title:`Open Active Quests`,children:[(0,v.jsx)(`span`,{children:`📜`}),(0,v.jsx)(`span`,{children:`Quest Log`}),I.length>0&&(0,v.jsx)(`span`,{className:`skill-quest-badge`,children:I.length})]}),(0,v.jsxs)(`button`,{className:`skill-radar-btn`,onClick:()=>w(!0),title:`Open Life Balance Radar`,children:[(0,v.jsx)(`span`,{children:`🕸️`}),(0,v.jsx)(`span`,{children:`Life Radar`})]}),(0,v.jsx)(`button`,{className:`skilltree-tool-btn`,onClick:ae,title:`Reset Diagram Layout`,children:`🔄 Reset`}),(0,v.jsxs)(`button`,{className:`skilltree-tool-btn ${j?`active`:``}`,onClick:()=>M(!j),children:[`Grid: `,j?`ON`:`OFF`]})]})]}),(0,v.jsx)(`div`,{className:`skilltree-branch-strip`,children:Object.entries(Y).map(([e,t])=>(0,v.jsxs)(`div`,{className:`branch-strip-item ${T===e?`active`:``}`,onClick:()=>E(T===e?`All`:e),children:[(0,v.jsxs)(`div`,{className:`branch-strip-label`,children:[(0,v.jsx)(`span`,{style:{color:b[e]},children:`●`}),(0,v.jsx)(`span`,{children:e}),(0,v.jsxs)(`span`,{className:`branch-strip-count`,children:[t.unlocked,`/`,t.total]})]}),(0,v.jsx)(`div`,{className:`branch-strip-bar`,children:(0,v.jsx)(`div`,{className:`branch-strip-fill`,style:{width:`${t.pct}%`,background:b[e]}})})]},e))}),(0,v.jsxs)(`div`,{className:`skilltree-filter-bar`,children:[(0,v.jsx)(`div`,{className:`skilltree-tabs`,children:[`All`,`Health`,`Mental`,`Spirit`,`Social`,`Career`].map(e=>(0,v.jsx)(`button`,{className:`skill-tab-btn ${T===e?`active`:``}`,onClick:()=>E(e),style:{"--cat-color":b[e]||`var(--primary)`},children:e},e))}),(0,v.jsx)(`div`,{className:`skilltree-status-pills`,children:[{id:`All`,label:`All Status`},{id:`Unlocked`,label:`✓ Unlocked`},{id:`InProgress`,label:`⏳ In Progress`},{id:`Available`,label:`🔓 Ready`},{id:`Locked`,label:`🔒 Locked`}].map(e=>(0,v.jsx)(`button`,{className:`skill-status-pill ${D===e.id?`active`:``}`,onClick:()=>O(e.id),children:e.label},e.id))}),(0,v.jsxs)(`div`,{className:`skilltree-search-wrap`,children:[(0,v.jsx)(`input`,{type:`text`,placeholder:`Search skills, habits, perks...`,value:k,onChange:e=>A(e.target.value),className:`skilltree-search-input`}),k&&(0,v.jsx)(`button`,{className:`skilltree-search-clear`,onClick:()=>A(``),children:`✕`})]})]})]}),(0,v.jsx)(`div`,{className:`notion-block`,style:{flex:1,padding:0,height:`70vh`,width:`100%`,overflow:`hidden`},children:(0,v.jsxs)(m,{nodes:te,edges:re,onNodesChange:ne,onEdgesChange:ie,nodeTypes:x,fitView:!0,fitViewOptions:{padding:.2},minZoom:.15,maxZoom:2.2,proOptions:{hideAttribution:!0},snapToGrid:j,snapGrid:[30,30],children:[(0,v.jsx)(f,{variant:`lines`,color:oe,gap:30,size:1}),(0,v.jsx)(p,{style:{display:`flex`,flexDirection:`row`}})]})}),e&&(0,v.jsx)(`div`,{className:`skill-modal-overlay`,onClick:()=>t(null),children:(0,v.jsxs)(`div`,{className:`skill-modal-card`,style:{borderColor:b[e.category]||`var(--border-color)`,"--modal-cat-color":b[e.category]||`var(--primary)`},onClick:e=>e.stopPropagation(),children:[(0,v.jsxs)(`div`,{className:`skill-modal-header`,children:[(0,v.jsx)(`div`,{className:`skill-modal-icon`,children:e.icon}),(0,v.jsxs)(`div`,{className:`skill-modal-titles`,children:[(0,v.jsxs)(`span`,{className:`skill-modal-cat-tag`,style:{color:b[e.category]},children:[e.category,` DOMAIN`]}),(0,v.jsx)(`h2`,{children:e.name})]}),(0,v.jsx)(`button`,{className:`skill-modal-close`,onClick:()=>t(null),children:`✕`})]}),(0,v.jsx)(`p`,{className:`skill-modal-desc`,children:e.desc||`No description available.`}),e.habit&&(0,v.jsxs)(`div`,{className:`skill-modal-section`,children:[(0,v.jsx)(`div`,{className:`skill-modal-sec-title`,children:`AUTOMATED CORE HABIT`}),(0,v.jsxs)(`div`,{className:`skill-habit-row`,children:[(0,v.jsx)(`span`,{style:{fontSize:`1.1rem`},children:`⚡`}),(0,v.jsxs)(`div`,{children:[(0,v.jsx)(`b`,{children:e.habit}),(0,v.jsx)(`p`,{style:{margin:`2px 0 0`,fontSize:`0.78rem`,color:`var(--text-muted)`},children:`Automatically synced to daily habits upon skill unlock`})]})]})]}),e.perk&&(0,v.jsxs)(`div`,{className:`skill-modal-section`,children:[(0,v.jsx)(`div`,{className:`skill-modal-sec-title`,children:`PASSIVE RANK PERK`}),(0,v.jsxs)(`div`,{className:`skill-perk-row`,children:[(0,v.jsx)(`span`,{children:`✨`}),(0,v.jsx)(`span`,{children:e.perk})]})]}),(0,v.jsxs)(`div`,{className:`skill-modal-section`,children:[(0,v.jsx)(`div`,{className:`skill-modal-sec-title`,children:`UNLOCK CRITERIA`}),(0,v.jsxs)(`div`,{className:`skill-reqs-grid`,children:[(0,v.jsxs)(`div`,{className:`skill-req-pill ${F>=(e.xpReq||0)?`met`:`unmet`}`,children:[(0,v.jsx)(`span`,{children:F>=(e.xpReq||0)?`✓`:`✗`}),(0,v.jsxs)(`span`,{children:[`XP: `,(e.xpReq||0).toLocaleString(),` (Have `,F.toLocaleString(),`)`]})]}),e.duration&&(0,v.jsxs)(`div`,{className:`skill-req-pill met`,children:[(0,v.jsx)(`span`,{children:`⏱️`}),(0,v.jsxs)(`span`,{children:[`Quest Duration: `,e.duration,` Days`]})]})]}),e.reqs&&e.reqs.length>0&&e.id!==`core`&&(0,v.jsxs)(`div`,{className:`skill-prereqs-list`,children:[(0,v.jsx)(`span`,{style:{fontSize:`0.75rem`,color:`var(--text-muted)`},children:`Prerequisites:`}),(0,v.jsx)(`div`,{style:{display:`flex`,gap:`6px`,flexWrap:`wrap`,marginTop:`4px`},children:e.reqs.map(e=>{let t=i.find(t=>t.id===e),n=H(e);return(0,v.jsxs)(`span`,{className:`prereq-tag ${n?`met`:`unmet`}`,children:[n?`✓`:`🔒`,` `,t?t.name:e]},e)})})]}),e.quest&&(0,v.jsxs)(`div`,{className:`skill-quest-obj`,children:[(0,v.jsx)(`b`,{children:`Quest Task:`}),` `,e.quest]})]}),W(e.id)&&(0,v.jsxs)(`div`,{className:`skill-modal-section active-quest-box`,children:[(0,v.jsxs)(`div`,{style:{display:`flex`,justifyContent:`space-between`,fontSize:`0.8rem`,fontWeight:700},children:[(0,v.jsx)(`span`,{children:`Quest In Progress`}),(0,v.jsxs)(`span`,{children:[W(e.id).progress,` / `,W(e.id).total,` Days`]})]}),(0,v.jsx)(`div`,{className:`quest-progress-track`,style:{marginTop:`6px`},children:(0,v.jsx)(`div`,{className:`quest-progress-fill`,style:{width:`${Math.min(W(e.id).progress/W(e.id).total*100,100)}%`,background:`#f59e0b`}})})]}),(0,v.jsxs)(`div`,{className:`skill-modal-actions`,children:[H(e.id)?(0,v.jsx)(`button`,{className:`notion-btn`,disabled:!0,style:{flex:1,opacity:.6},children:`✓ Skill Mastered`}):W(e.id)?(0,v.jsxs)(v.Fragment,{children:[(0,v.jsx)(`button`,{className:`notion-btn`,style:{flex:1,background:`#f59e0b`,color:`#000`,fontWeight:800},onClick:()=>q(e.id),children:`+1 Day Progress (+100 XP)`}),(0,v.jsx)(`button`,{className:`notion-btn`,style:{background:`#22c55e`,color:`#fff`,fontWeight:800},onClick:()=>J(e.id),children:`Instant Unlock`})]}):U(e)?(0,v.jsx)(`button`,{className:`notion-btn`,style:{flex:1,background:F>=(e.xpReq||0)?b[e.category]||`var(--primary)`:`var(--border-color)`,color:`#fff`,fontWeight:800,cursor:F>=(e.xpReq||0)?`pointer`:`not-allowed`},onClick:()=>F>=(e.xpReq||0)&&K(e),children:F>=(e.xpReq||0)?`Initiate Unlock Quest`:`Requires More XP`}):(0,v.jsx)(`button`,{className:`notion-btn`,disabled:!0,style:{flex:1,opacity:.5},children:`Prerequisites Locked`}),(0,v.jsx)(`button`,{className:`notion-btn secondary`,onClick:()=>t(null),children:`Close`})]})]})}),(0,v.jsx)(y,{isOpen:n,onClose:()=>u(!1),onSelectSkill:e=>t(e)}),(0,v.jsx)(s,{isOpen:h,onClose:()=>S(!1)}),C&&(0,v.jsx)(`div`,{className:`skill-modal-overlay`,onClick:()=>w(!1),children:(0,v.jsxs)(`div`,{className:`skill-modal-card`,style:{maxWidth:`440px`,borderColor:`#6366f1`,"--modal-cat-color":`#6366f1`},onClick:e=>e.stopPropagation(),children:[(0,v.jsxs)(`div`,{className:`skill-modal-header`,children:[(0,v.jsx)(`div`,{className:`skill-modal-icon`,children:`🕸️`}),(0,v.jsxs)(`div`,{className:`skill-modal-titles`,children:[(0,v.jsx)(`span`,{className:`skill-modal-cat-tag`,style:{color:`#6366f1`},children:`HOLISTIC MASTERY RADAR`}),(0,v.jsx)(`h2`,{children:`Life Balance Radar`})]}),(0,v.jsx)(`button`,{className:`skill-modal-close`,onClick:()=>w(!1),children:`✕`})]}),(0,v.jsx)(`p`,{className:`skill-modal-desc`,children:`Visual overview of your unlocked skills and progression balance across all 5 branches plus overall mastery.`}),(0,v.jsx)(`div`,{style:{display:`flex`,justifyContent:`center`,padding:`4px 0`},children:(0,v.jsx)(o,{mode:`skills`,width:320,height:320})}),(0,v.jsx)(`div`,{className:`skill-modal-actions`,children:(0,v.jsx)(`button`,{className:`notion-btn`,style:{flex:1,background:`#6366f1`,color:`#fff`,fontWeight:800},onClick:()=>w(!1),children:`Close Radar`})})]})}),(0,v.jsx)(`style`,{children:`
        .skilltree-full-container {
          padding: 12px 20px 20px;
        }

        .skilltree-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 12px;
        }

        .skilltree-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .skilltree-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .skilltree-actions-group {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .skill-rank-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1.5px solid;
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-rank-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .skill-quest-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .skill-quest-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .skill-quest-badge {
          background: #f59e0b;
          color: #000;
          border-radius: 10px;
          padding: 1px 6px;
          font-size: 0.68rem;
          font-weight: 900;
        }

        .skill-radar-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.12);
          color: #a5b4fc;
          font-size: 0.76rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-radar-btn:hover {
          background: rgba(99, 102, 241, 0.25);
          border-color: #6366f1;
          color: #fff;
          transform: translateY(-1px);
        }

        .skilltree-tool-btn {
          padding: 6px 12px;
          font-size: 0.72rem;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 700;
          text-transform: uppercase;
        }
        .skilltree-tool-btn:hover {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.08);
        }
        .skilltree-tool-btn.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        .skilltree-branch-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 8px;
        }

        .branch-strip-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          border-radius: 8px;
          padding: 6px 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .branch-strip-item:hover, .branch-strip-item.active {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .branch-strip-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .branch-strip-count {
          margin-left: auto;
          color: var(--text-muted);
          font-size: 0.7rem;
        }

        .branch-strip-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          overflow: hidden;
        }

        .branch-strip-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s;
        }

        .skilltree-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 6px 0;
        }

        .skilltree-tabs {
          display: flex;
          gap: 6px;
          overflow-x: auto;
        }

        .skill-tab-btn {
          padding: 5px 12px;
          border-radius: 16px;
          font-size: 0.74rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-tab-btn:hover {
          color: var(--text-main);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .skill-tab-btn.active {
          background: var(--cat-color);
          color: #fff;
          border-color: var(--cat-color);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
        }

        .skilltree-status-pills {
          display: flex;
          gap: 5px;
        }

        .skill-status-pill {
          padding: 4px 10px;
          border-radius: 14px;
          font-size: 0.7rem;
          font-weight: 600;
          background: transparent;
          border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .skill-status-pill:hover {
          color: var(--text-main);
        }
        .skill-status-pill.active {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .skilltree-search-wrap {
          position: relative;
          min-width: 220px;
        }

        .skilltree-search-input {
          width: 100%;
          padding: 6px 28px 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-main);
          font-size: 0.78rem;
          outline: none;
        }
        .skilltree-search-input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
        }

        .skilltree-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.75rem;
        }

        /* Modal styling */
        .skill-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .skill-modal-card {
          background: var(--bg-card, #121215);
          border: 1.5px solid;
          border-radius: 16px;
          padding: 28px;
          max-width: 440px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
          color: var(--text-main);
        }

        .skill-modal-header {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
        }

        .skill-modal-icon {
          font-size: 2.2rem;
        }

        .skill-modal-titles {
          flex: 1;
        }

        .skill-modal-cat-tag {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .skill-modal-titles h2 {
          margin: 2px 0 0;
          font-size: 1.25rem;
          font-weight: 800;
        }

        .skill-modal-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.1rem;
          cursor: pointer;
        }
        .skill-modal-close:hover {
          color: #fff;
        }

        .skill-modal-desc {
          margin: 0;
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.5;
        }

        .skill-modal-section {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .skill-modal-sec-title {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.8px;
          color: var(--text-muted);
        }

        .skill-habit-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .skill-perk-row {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--modal-cat-color);
        }

        .skill-reqs-grid {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .skill-req-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.04);
        }
        .skill-req-pill.met {
          color: #22c55e;
        }
        .skill-req-pill.unmet {
          color: #ef4444;
        }

        .skill-prereqs-list {
          margin-top: 4px;
        }

        .prereq-tag {
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid;
        }
        .prereq-tag.met {
          border-color: rgba(34, 197, 94, 0.4);
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }
        .prereq-tag.unmet {
          border-color: rgba(239, 68, 68, 0.4);
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        .skill-quest-obj {
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.8rem;
          color: #d4d4d8;
        }

        .skill-modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }

        @media (max-width: 900px) {
          .skilltree-header-top {
            flex-direction: column;
            align-items: flex-start;
          }
          .skilltree-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .skilltree-search-wrap {
            width: 100%;
          }
        }
      `})]})}export{S as default};