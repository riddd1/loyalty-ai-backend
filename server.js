<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Instagram DM Generator - Slideshow</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://unpkg.com/@ffmpeg/ffmpeg@0.12.6/dist/umd/ffmpeg.js"></script>
<script src="https://unpkg.com/@ffmpeg/util@0.12.1/dist/umd/index.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
@keyframes spin{to{transform:rotate(360deg)}}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0a;color:#fff;min-height:100vh;font-size:13px;overflow:hidden}

.topbar{display:flex;align-items:center;gap:10px;padding:10px 18px;border-bottom:1px solid rgba(255,255,255,0.07);background:#0a0a0a;position:sticky;top:0;z-index:100;height:46px}
.logo{font-size:15px;font-weight:800;color:#e8a87c}
.topbar-tabs{display:flex;gap:2px;margin-left:6px}
.t-tab{padding:4px 11px;font-size:11px;font-weight:700;border-radius:5px;cursor:pointer;border:1px solid rgba(255,255,255,0.12);background:none;color:rgba(255,255,255,0.4);transition:all .15s}
.t-tab.active{border-color:#e8a87c;color:#e8a87c;background:rgba(232,168,124,0.08)}
.main{display:grid;grid-template-columns:290px 1fr;height:calc(100vh - 46px)}

/* LEFT */
.lp{padding:12px;overflow-y:auto;border-right:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;gap:10px}
.sec-title{font-size:10px;font-weight:700;color:#e8a87c;margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px}
.div{height:1px;background:rgba(255,255,255,0.06)}
.fi{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:5px;padding:5px 8px;font-size:11px;width:100%}
.fi::placeholder{color:rgba(255,255,255,0.25)}
.profile-row{display:flex;align-items:center;gap:8px}
.avatar-upload{width:44px;height:44px;border-radius:50%;border:2px dashed rgba(255,255,255,0.2);cursor:pointer;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all .2s;background:rgba(255,255,255,0.05)}
.avatar-upload:hover{border-color:rgba(232,168,124,0.6)}
.avatar-upload img{width:100%;height:100%;object-fit:cover}
.toggle-row{display:flex;align-items:center;gap:7px;cursor:pointer}
.toggle-row input{accent-color:#e8a87c;width:14px;height:14px}
.toggle-row span{font-size:11px;color:rgba(255,255,255,0.6)}
.story-box{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:8px;padding:9px}
.story-row{display:flex;align-items:flex-start;gap:8px}
.story-thumb{width:46px;height:62px;border-radius:8px;background:rgba(255,255,255,0.07);border:1.5px dashed rgba(255,255,255,0.15);cursor:pointer;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px;transition:all .2s}
.story-thumb:hover{border-color:rgba(232,168,124,0.5)}
.story-thumb img{width:100%;height:100%;object-fit:cover}
.story-meta{flex:1;display:flex;flex-direction:column;gap:4px;min-width:0}
.pos-row{display:flex;gap:3px}
.pos-btn{flex:1;padding:4px;font-size:10px;font-weight:700;border-radius:4px;cursor:pointer;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.4);transition:all .15s;text-align:center}
.pos-btn.active{border-color:#e8a87c;color:#e8a87c;background:rgba(232,168,124,0.1)}
.color-opts{display:flex;gap:8px;margin-bottom:6px}
.radio-opt{display:flex;align-items:center;gap:4px;cursor:pointer;font-size:11px;color:rgba(255,255,255,0.6)}
.radio-opt input{accent-color:#e8a87c}
.color-row{display:flex;align-items:center;gap:7px;margin-bottom:5px}
.cswatch{width:18px;height:18px;border-radius:5px;border:1px solid rgba(255,255,255,0.15);cursor:pointer;padding:2px;flex-shrink:0}
.chex{font-size:10px;font-weight:600;color:rgba(255,255,255,0.4);font-family:monospace}
.clabel{font-size:10px;color:rgba(255,255,255,0.3);margin-left:auto}
.msg-list{display:flex;flex-direction:column;gap:3px}
.msg-row{background:rgba(255,255,255,0.04);border-radius:7px;padding:6px 7px;border:1px solid rgba(255,255,255,0.06)}
.msg-inner{display:grid;grid-template-columns:13px 50px 60px 1fr 18px;gap:3px;align-items:center}
.mnum{font-size:9px;color:rgba(255,255,255,0.2);font-weight:700}
select{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:4px;padding:3px;font-size:10px;width:100%}
select option{background:#1a1a1e}
.minput{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:4px;padding:3px 6px;font-size:11px;width:100%}
.minput::placeholder{color:rgba(255,255,255,0.2)}
.delbtn{background:rgba(255,50,50,0.08);border:none;color:rgba(255,100,100,0.5);border-radius:3px;width:17px;height:17px;cursor:pointer;font-size:8px}
.delbtn:hover{background:rgba(255,50,50,0.2)}
.react-row{display:flex;align-items:center;gap:4px;margin-top:3px}
.react-lbl{font-size:9px;color:rgba(255,255,255,0.3);flex-shrink:0}
.react-input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:4px;padding:2px 5px;font-size:13px;width:54px;text-align:center}
.react-input::placeholder{color:rgba(255,255,255,0.2);font-size:10px}
.add-row{display:flex;gap:3px;flex-wrap:wrap;margin-top:5px}
.abtn{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.65);border-radius:5px;padding:4px 8px;font-size:10px;font-weight:600;cursor:pointer;transition:all .15s}
.abtn:hover{background:rgba(255,255,255,0.11)}
.abtn.red{color:rgba(255,100,100,0.7);border-color:rgba(255,80,80,0.15)}
.seen-box{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:7px 8px;display:flex;flex-direction:column;gap:5px;margin-top:4px}
.bottom-btns{margin-top:auto;display:flex;flex-direction:column;gap:5px}
.gbtn{width:100%;background:linear-gradient(90deg,#e8a87c,#c45c8a,#8b5cf6);border:none;color:#fff;border-radius:9px;padding:11px;font-size:12px;font-weight:800;cursor:pointer;transition:opacity .2s}
.gbtn:hover{opacity:.88}
.gbtn.sec{background:#1a1a1e;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6)}

/* CODE MODE */
#code-panel{display:none;flex-direction:column;gap:7px}
.code-meta{font-size:10px;color:rgba(255,255,255,0.3);display:flex;justify-content:space-between}
#code-ta{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:7px;padding:9px;font-size:11px;font-family:monospace;resize:vertical;min-height:180px;line-height:1.6}
.code-hint{font-size:10px;color:rgba(255,255,255,0.25);line-height:1.6;padding:6px 8px;background:rgba(255,255,255,0.03);border-radius:5px;border:1px solid rgba(255,255,255,0.06)}
.code-hint b{color:rgba(255,255,255,0.45)}

/* RIGHT */
.rp{display:flex;flex-direction:column;background:#0d0d0f;overflow:hidden}
.preview-hdr{display:flex;align-items:center;padding:9px 16px;border-bottom:1px solid rgba(255,255,255,0.07)}
.pvbadge{font-size:10px;font-weight:600;background:rgba(255,255,255,0.07);border-radius:4px;padding:3px 7px;color:rgba(255,255,255,0.35)}
.preview-area{flex:1;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto;position:relative}

/* ── CROP OVERLAY ── */
#crop-overlay{display:none;position:absolute;inset:0;z-index:50;cursor:crosshair}
#crop-overlay.active{display:block}
#crop-selection{position:absolute;border:2px solid #e8a87c;background:rgba(232,168,124,0.08);pointer-events:none}
#crop-handles{position:absolute;inset:0;pointer-events:none}
.crop-outside{position:absolute;background:rgba(0,0,0,0.55);pointer-events:none}
#crop-confirm{position:absolute;bottom:8px;right:8px;background:#e8a87c;color:#000;border:none;border-radius:7px;padding:6px 14px;font-size:11px;font-weight:800;cursor:pointer;z-index:60;display:none}
#crop-cancel{position:absolute;bottom:8px;right:90px;background:rgba(255,255,255,0.1);color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:11px;font-weight:700;cursor:pointer;z-index:60;display:none}

/* ── INSTAGRAM PREVIEW ── */
#capture-root{
  width:390px;background:#000;
  display:flex;flex-direction:column;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  position:relative;
}

/* STORY */
.ig-story-block{padding:16px 14px 0;display:flex;flex-direction:row;align-items:stretch}
.ig-story-block.right{flex-direction:row-reverse}
.ig-story-side{display:flex;flex-direction:column;align-items:center;gap:6px;margin-right:10px;flex-shrink:0}
.ig-story-block.right .ig-story-side{margin-right:0;margin-left:10px}
.ig-story-side-av{width:30px;height:30px;border-radius:50%;overflow:hidden;background:#333;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ig-story-side-av img{width:100%;height:100%;object-fit:cover}
.ig-story-side-av svg{width:18px;height:18px;fill:#888}
.ig-story-vline{width:2px;flex:1;background:rgba(255,255,255,0.2);border-radius:2px;min-height:20px}
.ig-story-content{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0}
.ig-story-block.right .ig-story-content{align-items:flex-end}
.ig-replied-label{font-size:14px;color:rgba(255,255,255,0.5);font-weight:400}
.ig-story-img-wrap{width:155px;border-radius:12px;overflow:hidden;background:#1c1c1c}
.ig-story-img-wrap img{width:100%;display:block;object-fit:cover}

/* MESSAGES */
.ig-messages{padding:2px 12px 16px;display:flex;flex-direction:column;gap:4px}
.ig-row{display:flex;align-items:flex-end;gap:7px;min-width:0}
.ig-row.right{justify-content:flex-end}
.ig-row.left{justify-content:flex-start}
.ig-bubble{border-radius:22px;padding:12px 16px;min-width:0;word-break:break-word;overflow-wrap:anywhere}
.ig-bubble-txt{font-size:16px;color:#fff;line-height:1.4;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere}
.ig-bubble-txt.bold{font-weight:700}
.ig-img-bubble{border-radius:16px;overflow:hidden}
.ig-img-bubble img{width:100%;max-width:200px;display:block;object-fit:cover;border-radius:16px}

/* VIEW ONCE PHOTO BUBBLE */
.ig-viewonce-bbl{border-radius:22px;padding:12px 16px;display:flex;align-items:center;gap:4px}
.ig-viewonce-icon{width:20px;height:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
.ig-viewonce-txt{font-size:16px;color:#fff;font-weight:700}

/* REACTION — always bottom-left of the bubble */
.ig-bbl-wrap{position:relative;display:inline-block;max-width:74%}
.ig-bbl-wrap.has-react{margin-bottom:22px}
.ig-reaction{position:absolute;bottom:-13px;left:6px;display:inline-flex;align-items:center;justify-content:center;padding:3px 7px;border-radius:100px;background:#161616;border:2.5px solid #000;font-size:10px;line-height:1;overflow:visible;z-index:2;white-space:nowrap}

/* SEEN */
.ig-seen{font-size:12px;color:rgba(255,255,255,0.45);text-align:right;padding:4px 16px 10px;}

#loading{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:999;align-items:center;justify-content:center;flex-direction:column;gap:12px}
#loading.show{display:flex}
.spinner{width:34px;height:34px;border:3px solid rgba(255,255,255,0.15);border-top-color:#e8a87c;border-radius:50%;animation:spin .8s linear infinite}
.loading-text{font-size:12px;color:rgba(255,255,255,0.6)}
.loading-progress{font-size:11px;color:rgba(255,255,255,0.4);margin-top:4px}

/* Twemoji */
img.emoji{height:1em;width:1em;margin:0 .03em 0 .05em;vertical-align:-0.1em;display:inline}
.ig-reaction img.emoji{height:1.4em;width:1.4em;vertical-align:middle;margin:0}

/* ── RANGE PICKER MODAL ── */
#range-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:200;align-items:center;justify-content:center}
#range-modal.show{display:flex}
.range-box{background:#141416;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:20px;width:360px;max-height:80vh;display:flex;flex-direction:column;gap:12px}
.range-title{font-size:13px;font-weight:700;color:#fff}
.range-sub{font-size:11px;color:rgba(255,255,255,0.4)}
.range-list{overflow-y:auto;display:flex;flex-direction:column;gap:4px;flex:1}
.range-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);transition:all .15s;user-select:none}
.range-item:hover{background:rgba(255,255,255,0.08)}
.range-item.start{border-color:#4ade80;background:rgba(74,222,128,0.08)}
.range-item.end{border-color:#e8a87c;background:rgba(232,168,124,0.1)}
.range-item.in-range{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.12)}
.range-item.start.end{border-color:#8b5cf6;background:rgba(139,92,246,0.12)}
.ri-num{font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;width:16px;flex-shrink:0}
.ri-side{font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;flex-shrink:0}
.ri-side.left{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5)}
.ri-side.right{background:rgba(139,92,246,0.3);color:#c4b5fd}
.ri-side.story{background:rgba(232,168,124,0.2);color:#e8a87c}
.ri-text{font-size:11px;color:rgba(255,255,255,0.75);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ri-tag{font-size:9px;padding:2px 5px;border-radius:4px;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.35);flex-shrink:0}
.range-legend{display:flex;gap:10px;flex-wrap:wrap}
.range-legend span{font-size:10px;color:rgba(255,255,255,0.35);display:flex;align-items:center;gap:4px}
.range-legend b{display:inline-block;width:10px;height:10px;border-radius:2px;flex-shrink:0}
.range-actions{display:flex;gap:6px}
.range-actions button{flex:1;padding:9px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:opacity .15s}
.range-dl{background:linear-gradient(90deg,#e8a87c,#8b5cf6);color:#fff}
.range-dl:disabled{opacity:.35;cursor:default}
.range-cancel-btn{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.6)}

/* ── SLIDESHOW MODAL ── */
#slideshow-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:200;align-items:center;justify-content:center}
#slideshow-modal.show{display:flex}
.slideshow-box{background:#141416;border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:20px;width:420px;max-height:85vh;display:flex;flex-direction:column;gap:12px}
.slideshow-title{font-size:13px;font-weight:700;color:#fff}
.slideshow-sub{font-size:11px;color:rgba(255,255,255,0.4)}
.universal-timing{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px;display:flex;align-items:center;gap:8px}
.universal-timing label{font-size:11px;color:rgba(255,255,255,0.6);flex-shrink:0}
.universal-timing input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:5px;padding:5px 8px;font-size:11px;width:70px}
.universal-timing button{background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3);color:#c4b5fd;border-radius:5px;padding:5px 12px;font-size:10px;font-weight:600;cursor:pointer;transition:all .15s;margin-left:auto}
.universal-timing button:hover{background:rgba(139,92,246,0.3)}
.slideshow-list{overflow-y:auto;display:flex;flex-direction:column;gap:4px;flex:1;max-height:300px}
.slideshow-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);transition:all .15s}
.slideshow-item.selected{border-color:#4ade80;background:rgba(74,222,128,0.08)}
.slideshow-item input[type="checkbox"]{accent-color:#4ade80;width:14px;height:14px;cursor:pointer}
.si-num{font-size:10px;color:rgba(255,255,255,0.3);font-weight:700;width:16px;flex-shrink:0}
.si-side{font-size:9px;font-weight:700;padding:2px 5px;border-radius:4px;flex-shrink:0}
.si-side.left{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.5)}
.si-side.right{background:rgba(139,92,246,0.3);color:#c4b5fd}
.si-side.story{background:rgba(232,168,124,0.2);color:#e8a87c}
.si-text{font-size:11px;color:rgba(255,255,255,0.75);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.si-tag{font-size:9px;padding:2px 5px;border-radius:4px;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.35);flex-shrink:0}
.si-timing{display:flex;align-items:center;gap:4px;flex-shrink:0}
.si-timing input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:4px;padding:3px 6px;font-size:10px;width:45px;text-align:center}
.si-timing span{font-size:10px;color:rgba(255,255,255,0.3)}
.slideshow-options{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px}
.slideshow-option-row{display:flex;align-items:center;gap:8px}
.slideshow-option-row label{font-size:11px;color:rgba(255,255,255,0.6);flex:1}
.slideshow-option-row select{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:5px;padding:4px 8px;font-size:10px}
.slideshow-option-row input[type="checkbox"]{accent-color:#8b5cf6;width:14px;height:14px}
.slideshow-info{background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:6px;padding:8px;font-size:10px;color:rgba(255,255,255,0.7);line-height:1.5}
.slideshow-info strong{color:#c4b5fd}
.slideshow-actions{display:flex;gap:6px}
.slideshow-actions button{flex:1;padding:9px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:opacity .15s}
.slideshow-generate{background:linear-gradient(90deg,#e8a87c,#c45c8a,#8b5cf6);color:#fff}
.slideshow-generate:disabled{opacity:.35;cursor:default}
.slideshow-cancel{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.6)}
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/twemoji.min.js" crossorigin="anonymous"></script>
</head>
<body>

<div class="topbar">
  <span class="logo">Instagram DM</span>
  <div class="topbar-tabs">
    <button class="t-tab active" id="tab-builder" onclick="switchTab('builder')">Builder</button>
    <button class="t-tab" id="tab-code" onclick="switchTab('code')">Code Mode</button>
  </div>
</div>

<div class="main">
  <div class="lp">
    <div id="builder-panel">

      <div>
        <div class="sec-title">Profile</div>
        <div class="profile-row">
          <div class="avatar-upload" id="avatar-thumb" onclick="document.getElementById('avatar-file').click()">👤</div>
          <div style="flex:1;display:flex;flex-direction:column;gap:5px">
            <input class="fi" id="profile-name" value="Receiver" oninput="render()" placeholder="Display name...">
          </div>
        </div>
      </div>

      <div class="div"></div>

      <div>
        <div class="sec-title">Story Reply <span style="color:rgba(255,255,255,0.3);font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></div>
        <div class="story-box">
          <div class="story-row">
            <div class="story-thumb" id="story-thumb" onclick="document.getElementById('story-file').click()">🖼</div>
            <div class="story-meta">
              <div style="font-size:10px;color:rgba(255,255,255,0.3)">Click to upload story image</div>
              <input class="fi" id="replied-label" value="Replied to your story" oninput="render()" placeholder="Header label...">
              <div class="pos-row">
                <button class="pos-btn active" id="pos-left" onclick="setStoryPos('left')">◀ Left</button>
                <button class="pos-btn" id="pos-right" onclick="setStoryPos('right')">Right ▶</button>
                <button class="abtn red" style="font-size:9px;padding:3px 6px" onclick="clearStory()">✕</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="div"></div>

      <div>
        <div class="sec-title">Appearance</div>
        <div class="color-opts">
          <label class="radio-opt"><input type="radio" name="cmode" value="solid" onchange="render()"> Solid</label>
          <label class="radio-opt"><input type="radio" name="cmode" value="gradient" checked onchange="render()"> Gradient</label>
        </div>
        <div class="color-row">
          <input type="color" class="cswatch" id="c-r1" value="#6e49dd" onchange="syncHex('c-r1','h-r1');render()">
          <span class="chex" id="h-r1">#6E49DD</span><span class="clabel">Right bubble</span>
        </div>
        <div class="color-row" id="grad-row">
          <input type="color" class="cswatch" id="c-r2" value="#425ee6" onchange="syncHex('c-r2','h-r2');render()">
          <span class="chex" id="h-r2">#425EE6</span><span class="clabel">Gradient end</span>
        </div>
        <div class="color-row">
          <input type="color" class="cswatch" id="c-l" value="#262626" onchange="syncHex('c-l','h-l');render()">
          <span class="chex" id="h-l">#262626</span><span class="clabel">Left bubble</span>
        </div>
        <div class="color-row">
          <input type="color" class="cswatch" id="c-bg" value="#0c1014" onchange="syncHex('c-bg','h-bg');render()">
          <span class="chex" id="h-bg">#0C1014</span><span class="clabel">Background</span>
        </div>
        <label class="toggle-row" style="margin-top:2px">
          <input type="checkbox" id="bold-chk" onchange="render()">
          <span>Bold text</span>
        </label>
      </div>

      <div class="div"></div>

      <div>
        <div class="sec-title">Messages</div>
        <div class="msg-list" id="msg-list"></div>
        <div class="add-row">
          <button class="abtn" onclick="addMsg('left','text')">+ Left text</button>
          <button class="abtn" onclick="addMsg('right','text')">+ Right text</button>
          <button class="abtn" onclick="addMsg('left','image')">+ Left img</button>
          <button class="abtn" onclick="addMsg('right','image')">+ Right img</button>
          <button class="abtn" onclick="addMsg('right','viewonce')">① Photo</button>
          <button class="abtn red" onclick="clearMsgs()">✕ Clear</button>
        </div>

        <!-- SEEN -->
        <div class="seen-box" style="margin-top:6px">
          <label class="toggle-row">
            <input type="checkbox" id="seen-chk" onchange="render()">
            <span>Show seen text</span>
          </label>
          <input class="fi" id="seen-text" value="Seen just now" oninput="render()" placeholder="e.g. Seen just now, Seen · 2m...">
        </div>
      </div>

    </div>

    <!-- CODE MODE -->
    <div id="code-panel">
      <div class="sec-title">Script</div>
      <div class="code-hint">
        <b>1)</b> = Left &nbsp;|&nbsp; <b>2)</b> = Right<br>
        <b>2) IMAGE:</b> — image bubble (upload after)<br>
        <b>2) VIEWONCE:</b> — view-once photo bubble<br>
        <b>REACT:😤</b> — reaction on previous message<br>
        <b>SEEN:just now</b> — seen text at bottom
      </div>
      <div class="code-meta"><span id="char-cnt">0/1500 characters</span></div>
      <textarea id="code-ta" placeholder="2) STORY_REPLY:&#10;1) can u test my bf for me?&#10;2) ofc girly!&#10;2) She's jealous&#10;REACT:😤&#10;2) VIEWONCE:&#10;SEEN:just now" oninput="parseCode()" rows="10"></textarea>
      <button class="abtn" id="copy-script-btn" onclick="copyScript()" style="width:100%;text-align:center;padding:6px">📋 Copy Script</button>
    </div>

    <div class="bottom-btns">
      <button class="gbtn" onclick="copyHTML()" id="copy-html-btn">📋 Copy Preview HTML</button>
      <button class="gbtn sec" onclick="openRangePicker()">⬇ Download PNG</button>
      <button class="gbtn sec" onclick="openSlideshowModal()">🎬 Create Slideshow</button>
    </div>
  </div>

  <!-- RIGHT / PREVIEW -->
  <div class="rp">
    <div class="preview-hdr"><span class="pvbadge">Live Preview</span></div>
    <div class="preview-area" id="preview-area">
      <!-- crop overlay -->
      <div id="crop-overlay">
        <div class="crop-outside" id="co-top"></div>
        <div class="crop-outside" id="co-bottom"></div>
        <div class="crop-outside" id="co-left"></div>
        <div class="crop-outside" id="co-right"></div>
        <div id="crop-selection"></div>
      </div>
      <button id="crop-confirm" onclick="confirmCrop()">✓ Download</button>
      <button id="crop-cancel" onclick="cancelCrop()">Cancel</button>

      <div id="capture-root">
        <div id="ig-story-hdr"></div>
        <div class="ig-messages" id="ig-msgs"></div>
      </div>
    </div>
  </div>
</div>

<div id="loading">
  <div class="spinner"></div>
  <p class="loading-text">Generating...</p>
  <p class="loading-progress" id="loading-progress"></p>
</div>

<input type="file" id="avatar-file" accept="image/*" style="display:none" onchange="handleAvatar(event)">
<input type="file" id="story-file" accept="image/*" style="display:none" onchange="handleStory(event)">
<input type="file" id="msg-file" accept="image/*" style="display:none" onchange="handleMsgImg(event)">

<script>
let storyPos = 'left';
let storySrc = null;
let avatarSrc = null;
let pendingMsgIdx = -1;
let messages = [];
let suppressCodeSync = false;
let suppressBuilderSync = false;

// ── TAB ──
function switchTab(tab) {
  document.getElementById('tab-builder').classList.toggle('active', tab==='builder');
  document.getElementById('tab-code').classList.toggle('active', tab==='code');
  document.getElementById('builder-panel').style.display = tab==='builder' ? 'block' : 'none';
  document.getElementById('code-panel').style.display = tab==='code' ? 'flex' : 'none';
  if (tab === 'code') syncBuilderToCode();
}

// ── FILES ──
function handleAvatar(e) {
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{ avatarSrc=ev.target.result; document.getElementById('avatar-thumb').innerHTML=`<img src="${avatarSrc}">`; render(); };
  r.readAsDataURL(f); e.target.value='';
}
function handleStory(e) {
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{ storySrc=ev.target.result; document.getElementById('story-thumb').innerHTML=`<img src="${storySrc}">`; render(); syncBuilderToCode(); };
  r.readAsDataURL(f); e.target.value='';
}
function clearStory() { storySrc=null; document.getElementById('story-thumb').innerHTML='🖼'; render(); syncBuilderToCode(); }
function setStoryPos(p) {
  storyPos=p;
  document.getElementById('pos-left').classList.toggle('active',p==='left');
  document.getElementById('pos-right').classList.toggle('active',p==='right');
  render(); syncBuilderToCode();
}
function handleMsgImg(e) {
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=ev=>{ if(pendingMsgIdx>=0){messages[pendingMsgIdx].img=ev.target.result; renderMsgList(); render(); syncBuilderToCode(); pendingMsgIdx=-1;} };
  r.readAsDataURL(f); e.target.value='';
}

// ── HELPERS ──
function syncHex(inputId, spanId) {
  document.getElementById(spanId).textContent = document.getElementById(inputId).value.toUpperCase();
}
function getRightStyle() {
  const grad=document.querySelector('input[name="cmode"]:checked').value==='gradient';
  const c1=document.getElementById('c-r1').value, c2=document.getElementById('c-r2').value;
  return grad ? `background:linear-gradient(135deg,${c1},${c2})` : `background:${c1}`;
}

// ── BUILDER → CODE SYNC ──
function syncBuilderToCode() {
  if (suppressBuilderSync) return;
  suppressCodeSync = true;
  const lines = [];
  if (storySrc) lines.push(`${storyPos==='right'?'2':'1'}) STORY_REPLY:`);
  messages.forEach(m => {
    const n = m.side==='right' ? '2' : '1';
    if (m.type==='image') lines.push(`${n}) IMAGE:`);
    else if (m.type==='viewonce') lines.push(`${n}) VIEWONCE:`);
    else lines.push(`${n}) ${m.text||''}`);
    if (m.reaction) lines.push(`REACT:${m.reaction}`);
  });
  const seenChk = document.getElementById('seen-chk');
  const seenTxt = document.getElementById('seen-text');
  if (seenChk && seenChk.checked && seenTxt && seenTxt.value.trim()) {
    lines.push(`SEEN:${seenTxt.value.trim()}`);
  }
  document.getElementById('code-ta').value = lines.join('\n');
  document.getElementById('char-cnt').textContent = `${lines.join('\n').length}/1500 characters`;
  suppressCodeSync = false;
}

// ── CODE → BUILDER SYNC ──
function parseCode() {
  if (suppressCodeSync) return;
  suppressBuilderSync = true;
  const raw = document.getElementById('code-ta').value;
  document.getElementById('char-cnt').textContent = `${raw.length}/1500 characters`;
  messages = [];
  let foundStory = false;
  let seenText = null;

  raw.split('\n').filter(l=>l.trim()).forEach(line => {
    const trimmed = line.trim();

    // SEEN line
    if (/^SEEN:/i.test(trimmed)) {
      seenText = trimmed.replace(/^SEEN:/i, '').trim();
      return;
    }

    // REACT line — attaches to previous message
    if (/^REACT:/i.test(trimmed)) {
      const emoji = trimmed.replace(/^REACT:/i, '').trim();
      if (messages.length > 0) messages[messages.length-1].reaction = emoji;
      return;
    }

    const match = trimmed.match(/^([12])\)\s*(.*)$/);
    if (!match) return;
    const side = match[1]==='2' ? 'right' : 'left';
    const rest = match[2].trim();
    const upper = rest.toUpperCase();

    if (upper.startsWith('STORY_REPLY:')) {
      foundStory = true;
      storyPos = side==='right' ? 'right' : 'left';
      document.getElementById('pos-left').classList.toggle('active', storyPos==='left');
      document.getElementById('pos-right').classList.toggle('active', storyPos==='right');
    } else if (upper.startsWith('IMAGE:')) {
      messages.push({side, type:'image', text:'', img:null, reaction:null});
    } else if (upper.startsWith('VIEWONCE:')) {
      messages.push({side, type:'viewonce', text:'', img:null, reaction:null});
    } else {
      messages.push({side, type:'text', text:rest, img:null, reaction:null});
    }
  });

  // sync seen
  if (seenText !== null) {
    document.getElementById('seen-chk').checked = true;
    document.getElementById('seen-text').value = seenText;
  } else {
    document.getElementById('seen-chk').checked = false;
  }

  if (!foundStory && !storySrc) { /* keep */ }
  renderMsgList(); render();
  suppressBuilderSync = false;
}

// ── MSG LIST ──
function renderMsgList() {
  const list=document.getElementById('msg-list');
  list.innerHTML='';
  messages.forEach((m,i) => {
    const row=document.createElement('div');
    row.className='msg-row';

    let imgHtml='';
    if (m.type==='image') {
      imgHtml = m.img
        ? `<div style="margin-top:3px;position:relative;display:inline-block">
            <img src="${m.img}" style="width:44px;height:36px;border-radius:4px;object-fit:cover;display:block">
            <button onclick="messages[${i}].img=null;renderMsgList();render();syncBuilderToCode()" style="position:absolute;top:-3px;right:-3px;background:#E1306C;color:#fff;border:none;border-radius:50%;width:12px;height:12px;font-size:7px;cursor:pointer;line-height:1">✕</button>
           </div>`
        : `<button class="abtn" style="margin-top:3px;font-size:9px;padding:2px 6px" onclick="pendingMsgIdx=${i};document.getElementById('msg-file').click()">+ upload img</button>`;
    }

    const isViewonce = m.type === 'viewonce';
    const typeOptions = `
      <option value="text" ${m.type==='text'?'selected':''}>Text</option>
      <option value="image" ${m.type==='image'?'selected':''}>Image</option>
      <option value="viewonce" ${m.type==='viewonce'?'selected':''}>① Photo</option>
    `;

    const reactVal = (m.reaction||'').replace(/"/g,'&quot;');

    row.innerHTML=`
      <div class="msg-inner">
        <span class="mnum">${i+1}</span>
        <select onchange="messages[${i}].side=this.value;renderMsgList();render();syncBuilderToCode()">
          <option value="left" ${m.side==='left'?'selected':''}>Left</option>
          <option value="right" ${m.side==='right'?'selected':''}>Right</option>
        </select>
        <select onchange="messages[${i}].type=this.value;renderMsgList();render();syncBuilderToCode()">${typeOptions}</select>
        <input class="minput" value="${(m.text||'').replace(/"/g,'&quot;')}"
          oninput="messages[${i}].text=this.value;render();syncBuilderToCode()"
          ${m.type!=='text'?'disabled style="opacity:.3"':''}
          placeholder="Message...">
        <button class="delbtn" onclick="messages.splice(${i},1);renderMsgList();render();syncBuilderToCode()">✕</button>
      </div>
      <div class="react-row">
        <span class="react-lbl">React:</span>
        <input class="react-input" value="${reactVal}"
          oninput="messages[${i}].reaction=this.value.trim()||null;render();syncBuilderToCode()"
          placeholder="😤">
      </div>
      ${imgHtml}`;
    list.appendChild(row);
  });
}

function addMsg(side, type) {
  messages.push({side, type, text:'', img:null, reaction:null});
  renderMsgList(); render(); syncBuilderToCode();
}
function clearMsgs() { messages=[]; renderMsgList(); render(); syncBuilderToCode(); }

// ── RENDER ──
function render() {
  const isGrad=document.querySelector('input[name="cmode"]:checked').value==='gradient';
  document.getElementById('grad-row').style.display=isGrad?'flex':'none';
  const bg=document.getElementById('c-bg').value;
  const lc=document.getElementById('c-l').value;
  const rs=getRightStyle();
  const bold=document.getElementById('bold-chk').checked;

  document.getElementById('capture-root').style.background=bg;

  // STORY
  const sh=document.getElementById('ig-story-hdr');
  if (storySrc) {
    sh.innerHTML=''; sh.style.display='block';
    const block=document.createElement('div');
    block.className='ig-story-block'+(storyPos==='right'?' right':'');

    const sideCol=document.createElement('div');
    sideCol.className='ig-story-side';
    const vline=document.createElement('div'); vline.className='ig-story-vline';
    sideCol.appendChild(vline);

    const content=document.createElement('div'); content.className='ig-story-content';

    const lbl=document.createElement('div'); lbl.className='ig-replied-label';
    const defaultLeft='Replied to your story', defaultRight='You replied to their story';
    const cur=document.getElementById('replied-label').value.trim();
    let lblText=(cur===defaultLeft||cur===defaultRight||!cur)
      ? (storyPos==='right'?defaultRight:defaultLeft) : cur;
    document.getElementById('replied-label').value=lblText;
    lbl.textContent=lblText;
    content.appendChild(lbl);

    const imgWrap=document.createElement('div'); imgWrap.className='ig-story-img-wrap';
    const sImg=document.createElement('img'); sImg.src=storySrc;
    imgWrap.appendChild(sImg); content.appendChild(imgWrap);

    block.appendChild(sideCol); block.appendChild(content);
    sh.appendChild(block);
  } else { sh.style.display='none'; sh.innerHTML=''; }

  // MESSAGES
  const container=document.getElementById('ig-msgs');
  container.innerHTML='';
  container.style.paddingTop=storySrc?'2px':'4px';

  messages.forEach((m,i)=>{
    const prevSame=i>0&&messages[i-1].side===m.side;
    const nextSame=i<messages.length-1&&messages[i+1].side===m.side;
    const isFirst=!prevSame, isLast=!nextSame;
    const row=document.createElement('div');
    row.className=`ig-row ${m.side}`;

    // Wrapper for reaction absolute positioning
    const bblWrap=document.createElement('div');
    const hasReact=m.reaction&&m.reaction.trim();
    bblWrap.className='ig-bbl-wrap'+(hasReact?' has-react':'');

    if (m.type==='image'&&m.img) {
      const wrap=document.createElement('div'); wrap.className='ig-img-bubble';
      const img=document.createElement('img'); img.src=m.img;
      wrap.appendChild(img); bblWrap.appendChild(wrap);

    } else if (m.type==='viewonce') {
      const bbl=document.createElement('div'); bbl.className='ig-viewonce-bbl';
      bbl.style.cssText=m.side==='right'?rs:`background:${lc}`;
      let r;
      if (m.side==='right') {
        r=isFirst&&isLast?'22px 22px 4px 22px':isFirst?'22px 22px 4px 22px':isLast?'22px 4px 22px 22px':'22px 4px 4px 22px';
      } else {
        r=isFirst&&isLast?'22px 22px 22px 4px':isFirst?'22px 22px 22px 4px':isLast?'4px 22px 22px 22px':'4px 22px 22px 4px';
      }
      bbl.style.borderRadius=r;
      const icon=document.createElement('div'); icon.className='ig-viewonce-icon';
      icon.innerHTML=`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="8" stroke="#c4b2fd" stroke-width="1.8" stroke-dasharray="3.14 3.14" fill="none"/><text x="10" y="10" text-anchor="middle" dominant-baseline="central" fill="#c4b2fd" font-size="8" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,sans-serif">1</text></svg>`;
      const txt=document.createElement('div'); txt.className='ig-viewonce-txt'; txt.textContent='Photo';
      txt.style.cssText='color:#c4b2fd;font-size:16px;font-weight:700';
      bbl.appendChild(icon); bbl.appendChild(txt);
      bblWrap.appendChild(bbl);

    } else if (m.type==='image'&&!m.img) {
      const bbl=document.createElement('div'); bbl.className='ig-bubble';
      bbl.style.cssText=(m.side==='right'?rs:`background:${lc}`)+';opacity:0.4';
      bbl.style.borderRadius='22px';
      const txt=document.createElement('div'); txt.className='ig-bubble-txt'; txt.textContent='[Image]';
      bbl.appendChild(txt); bblWrap.appendChild(bbl);

    } else {
      const bbl=document.createElement('div'); bbl.className='ig-bubble';
      bbl.style.cssText=m.side==='right'?rs:`background:${lc}`;
      let r;
      if (m.side==='right') {
        r=isFirst&&isLast?'22px 22px 4px 22px':isFirst?'22px 22px 4px 22px':isLast?'22px 4px 22px 22px':'22px 4px 4px 22px';
      } else {
        r=isFirst&&isLast?'22px 22px 22px 4px':isFirst?'22px 22px 22px 4px':isLast?'4px 22px 22px 22px':'4px 22px 22px 4px';
      }
      bbl.style.borderRadius=r;
      const txt=document.createElement('div');
      txt.className='ig-bubble-txt'+(bold?' bold':'');
      txt.textContent=m.text;
      bbl.appendChild(txt); bblWrap.appendChild(bbl);
    }

    // REACTION — absolutely overlapping bottom-left of bubble
    if (hasReact) {
      const reactEl=document.createElement('div');
      reactEl.className='ig-reaction';
      reactEl.textContent=m.reaction.trim();
      bblWrap.appendChild(reactEl);
    }

    row.appendChild(bblWrap);
    container.appendChild(row);
  });

  // SEEN TEXT
  const seenChk = document.getElementById('seen-chk');
  const seenTxtEl = document.getElementById('seen-text');
  if (seenChk && seenChk.checked && seenTxtEl && seenTxtEl.value.trim()) {
    const seenDiv=document.createElement('div');
    seenDiv.className='ig-seen';
    seenDiv.textContent=seenTxtEl.value.trim();
    container.appendChild(seenDiv);
  }

  // Apply Twemoji
  if (typeof twemoji !== 'undefined') {
    twemoji.parse(document.getElementById('capture-root'), {
      folder:'svg', ext:'.svg',
      base:'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/'
    });
  }
}

// ── COPY ──
function copyScript() {
  navigator.clipboard.writeText(document.getElementById('code-ta').value).then(()=>{
    const b=document.getElementById('copy-script-btn');
    b.textContent='✓ Copied!'; setTimeout(()=>b.textContent='📋 Copy Script',2000);
  });
}
function copyHTML() {
  navigator.clipboard.writeText(document.getElementById('capture-root').outerHTML).then(()=>{
    const b=document.getElementById('copy-html-btn');
    b.textContent='✓ Copied!'; setTimeout(()=>b.textContent='📋 Copy Preview HTML',2000);
  });
}

// ── CROP / DOWNLOAD ──
let cropState = {active:false, dragging:false, x0:0, y0:0, x1:0, y1:0};

function startCrop() {
  cropState = {active:true, dragging:false, x0:0, y0:0, x1:0, y1:0};
  const ov=document.getElementById('crop-overlay');
  ov.classList.add('active');
  document.getElementById('crop-selection').style.cssText='display:none';
  document.getElementById('co-top').style.cssText='display:none';
  document.getElementById('co-bottom').style.cssText='display:none';
  document.getElementById('co-left').style.cssText='display:none';
  document.getElementById('co-right').style.cssText='display:none';
  document.getElementById('crop-confirm').style.display='none';
  document.getElementById('crop-cancel').style.display='block';
}

function cancelCrop() {
  document.getElementById('crop-overlay').classList.remove('active');
  document.getElementById('crop-confirm').style.display='none';
  document.getElementById('crop-cancel').style.display='none';
  cropState.active=false;
}

const ov=document.getElementById('crop-overlay');
ov.addEventListener('mousedown', e=>{
  if (!cropState.active) return;
  const r=ov.getBoundingClientRect();
  cropState.dragging=true;
  cropState.x0=e.clientX-r.left; cropState.y0=e.clientY-r.top;
  cropState.x1=cropState.x0; cropState.y1=cropState.y0;
  updateCropBox();
});
ov.addEventListener('mousemove', e=>{
  if (!cropState.dragging) return;
  const r=ov.getBoundingClientRect();
  cropState.x1=e.clientX-r.left; cropState.y1=e.clientY-r.top;
  updateCropBox();
});
ov.addEventListener('mouseup', e=>{
  if (!cropState.dragging) return;
  cropState.dragging=false;
  const w=Math.abs(cropState.x1-cropState.x0), h=Math.abs(cropState.y1-cropState.y0);
  if (w>10&&h>10) {
    document.getElementById('crop-confirm').style.display='block';
  }
});

function updateCropBox() {
  const x=Math.min(cropState.x0,cropState.x1), y=Math.min(cropState.y0,cropState.y1);
  const w=Math.abs(cropState.x1-cropState.x0), h=Math.abs(cropState.y1-cropState.y0);
  const ov=document.getElementById('crop-overlay');
  const ow=ov.offsetWidth, oh=ov.offsetHeight;
  const sel=document.getElementById('crop-selection');
  sel.style.cssText=`display:block;left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
  document.getElementById('co-top').style.cssText=`display:block;left:0;top:0;width:100%;height:${y}px`;
  document.getElementById('co-bottom').style.cssText=`display:block;left:0;top:${y+h}px;width:100%;height:${oh-y-h}px`;
  document.getElementById('co-left').style.cssText=`display:block;left:0;top:${y}px;width:${x}px;height:${h}px`;
  document.getElementById('co-right').style.cssText=`display:block;left:${x+w}px;top:${y}px;width:${ow-x-w}px;height:${h}px`;
}

function confirmCrop() {
  cancelCrop();
  const area=document.getElementById('preview-area');
  const root=document.getElementById('capture-root');
  const areaRect=area.getBoundingClientRect();
  const rootRect=root.getBoundingClientRect();

  const x=Math.min(cropState.x0,cropState.x1);
  const y=Math.min(cropState.y0,cropState.y1);
  const w=Math.abs(cropState.x1-cropState.x0);
  const h=Math.abs(cropState.y1-cropState.y0);

  const offX=rootRect.left-areaRect.left;
  const offY=rootRect.top-areaRect.top;
  const cropX=x-offX, cropY=y-offY;

  document.getElementById('loading').classList.add('show');
  html2canvas(root,{scale:3,useCORS:true,allowTaint:true,backgroundColor:null,logging:false})
  .then(canvas=>{
    const scale=3;
    const out=document.createElement('canvas');
    out.width=w*scale; out.height=h*scale;
    const ctx=out.getContext('2d');
    ctx.drawImage(canvas, cropX*scale, cropY*scale, w*scale, h*scale, 0, 0, w*scale, h*scale);
    const a=document.createElement('a');
    a.download='ig-dm-crop.png'; a.href=out.toDataURL('image/png'); a.click();
    document.getElementById('loading').classList.remove('show');
  }).catch(()=>{ document.getElementById('loading').classList.remove('show'); alert('Try Chrome.'); });
}

renderMsgList();
render();

// ── RANGE PICKER ──
let rangeStart = -1, rangeEnd = -1;

function openRangePicker() {
  rangeStart = -1; rangeEnd = -1;
  buildRangeList();
  document.getElementById('range-modal').classList.add('show');
}
function closeRangePicker() {
  document.getElementById('range-modal').classList.remove('show');
}

function buildRangeList() {
  const list = document.getElementById('range-list');
  list.innerHTML = '';

  const items = [];
  if (storySrc) items.push({id:'story', label:'Story reply header', side:'story', type:'story'});
  messages.forEach((m, i) => {
    items.push({
      id: i,
      label: m.type==='image' ? '[Image]' : m.type==='viewonce' ? '[① Photo]' : (m.text || '[empty]'),
      side: m.side,
      type: m.type
    });
  });

  if (items.length === 0) {
    list.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.3);padding:12px;text-align:center">No messages yet</div>';
    return;
  }

  items.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'range-item';
    el.dataset.idx = idx;

    const sideClass = item.side === 'story' ? 'story' : item.side;
    const sideLabel = item.side === 'story' ? 'STORY' : item.side.toUpperCase();
    const typeTag = item.type === 'image' ? '<span class="ri-tag">IMG</span>'
                  : item.type === 'viewonce' ? '<span class="ri-tag">① PHOTO</span>' : '';

    el.innerHTML = `
      <span class="ri-num">${idx+1}</span>
      <span class="ri-side ${sideClass}">${sideLabel}</span>
      <span class="ri-text">${item.label.replace(/</g,'&lt;').substring(0,60)}</span>
      ${typeTag}
    `;

    el.addEventListener('click', () => {
      if (rangeStart === -1 || (rangeStart !== -1 && rangeEnd !== -1)) {
        rangeStart = idx; rangeEnd = -1;
      } else if (idx < rangeStart) {
        rangeStart = idx; rangeEnd = -1;
      } else {
        rangeEnd = idx;
      }
      updateRangeUI(items.length);
    });

    list.appendChild(el);
  });

  window._rangeItems = items;
}

function updateRangeUI(total) {
  const items = document.querySelectorAll('.range-item');
  items.forEach((el, idx) => {
    el.classList.remove('start','end','in-range');
    if (idx === rangeStart && idx === rangeEnd) el.classList.add('start','end');
    else if (idx === rangeStart) el.classList.add('start');
    else if (idx === rangeEnd) el.classList.add('end');
    else if (rangeStart !== -1 && rangeEnd !== -1 && idx > rangeStart && idx < rangeEnd) el.classList.add('in-range');
  });
  const ready = rangeStart !== -1 && rangeEnd !== -1 && rangeEnd >= rangeStart;
  document.getElementById('range-dl-btn').disabled = !ready;
  if (rangeStart !== -1 && rangeEnd === -1) {
    document.getElementById('range-dl-btn').disabled = false;
  }
}

function getOffsetFromRoot(el, root) {
  let top = 0, cur = el;
  while (cur && cur !== root) { top += cur.offsetTop; cur = cur.offsetParent; }
  return top;
}

function doRangeDownload() {
  closeRangePicker();
  const end = rangeEnd === -1 ? rangeStart : rangeEnd;
  const s = Math.min(rangeStart, end), e = Math.max(rangeStart, end);

  const root = document.getElementById('capture-root');
  const storyHdr = document.getElementById('ig-story-hdr');
  const msgRows = Array.from(document.querySelectorAll('#ig-msgs > *'));

  let domEls = [];
  if (storySrc) domEls.push(storyHdr);
  msgRows.forEach(el => domEls.push(el));

  if (domEls.length === 0) return;

  const firstEl = domEls[Math.min(s, domEls.length-1)];
  const lastEl  = domEls[Math.min(e, domEls.length-1)];
  if (!firstEl || !lastEl) return;

  const pad = 20;
  const topPx    = Math.max(0, getOffsetFromRoot(firstEl, root) - pad);
  const bottomPx = getOffsetFromRoot(lastEl, root) + lastEl.offsetHeight + pad;
  const cropH    = bottomPx - topPx;

  if (cropH <= 0) return;

  document.getElementById('loading').classList.add('show');
  html2canvas(root, {scale:3, useCORS:true, allowTaint:true, backgroundColor:null, logging:false})
  .then(canvas => {
    const scale = 3;
    const sy = Math.round(topPx * scale);
    const sh = Math.round(cropH * scale);
    const clampedSy = Math.max(0, Math.min(sy, canvas.height - 1));
    const clampedSh = Math.min(sh, canvas.height - clampedSy);

    const out = document.createElement('canvas');
    out.width  = canvas.width;
    out.height = clampedSh;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, clampedSy, canvas.width, clampedSh, 0, 0, canvas.width, clampedSh);

    const a = document.createElement('a');
    a.download = 'ig-dm-range.png';
    a.href = out.toDataURL('image/png');
    a.click();
    document.getElementById('loading').classList.remove('show');
  }).catch(() => {
    document.getElementById('loading').classList.remove('show');
    alert('Try Chrome.');
  });
}

// ══════════════════════════════════════════════════════════════════════
// ── SLIDESHOW MAKER ──
// ══════════════════════════════════════════════════════════════════════

let slideshowItems = [];
let slideshowTimings = {};
let slideshowTransition = 'none';
let slideshowIncludeStory = true;

function openSlideshowModal() {
  buildSlideshowItems();
  document.getElementById('slideshow-modal').classList.add('show');
  updateSlideshowUI();
}

function closeSlideshowModal() {
  document.getElementById('slideshow-modal').classList.remove('show');
}

function buildSlideshowItems() {
  slideshowItems = [];
  slideshowTimings = {};
  
  // Load saved timings from localStorage
  const savedTimings = localStorage.getItem('slideshow_timings');
  if (savedTimings) {
    try {
      slideshowTimings = JSON.parse(savedTimings);
    } catch(e) {}
  }
  
  let idx = 0;
  if (storySrc) {
    slideshowItems.push({
      id: 'story',
      label: 'Story reply header',
      side: 'story',
      type: 'story',
      selected: true
    });
    if (!slideshowTimings['story']) slideshowTimings['story'] = 0.8;
    idx++;
  }
  
  messages.forEach((m, i) => {
    const itemId = `msg_${i}`;
    slideshowItems.push({
      id: itemId,
      label: m.type==='image' ? '[Image]' : m.type==='viewonce' ? '[① Photo]' : (m.text || '[empty]'),
      side: m.side,
      type: m.type,
      selected: true
    });
    if (!slideshowTimings[itemId]) slideshowTimings[itemId] = 0.8;
    idx++;
  });
  
  if (slideshowItems.length === 0) {
    alert('No messages to create slideshow');
    return;
  }
  
  renderSlideshowList();
}

function renderSlideshowList() {
  const list = document.getElementById('slideshow-list');
  list.innerHTML = '';
  
  if (slideshowItems.length === 0) {
    list.innerHTML = '<div style="font-size:11px;color:rgba(255,255,255,0.3);padding:12px;text-align:center">No messages yet</div>';
    return;
  }
  
  slideshowItems.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'slideshow-item';
    if (item.selected) el.classList.add('selected');
    
    const sideClass = item.side === 'story' ? 'story' : item.side;
    const sideLabel = item.side === 'story' ? 'STORY' : item.side.toUpperCase();
    const typeTag = item.type === 'image' ? '<span class="si-tag">IMG</span>'
                  : item.type === 'viewonce' ? '<span class="si-tag">① PHOTO</span>' : '';
    
    const timing = slideshowTimings[item.id] || 0.8;
    
    el.innerHTML = `
      <input type="checkbox" ${item.selected ? 'checked' : ''} onchange="toggleSlideshowItem(${idx})" />
      <span class="si-num">${idx+1}</span>
      <span class="si-side ${sideClass}">${sideLabel}</span>
      <span class="si-text">${item.label.replace(/</g,'&lt;').substring(0,50)}</span>
      ${typeTag}
      <div class="si-timing">
        <input type="number" step="0.1" min="0.1" max="10" value="${timing}" 
          onchange="updateSlideshowTiming('${item.id}', this.value)" />
        <span>s</span>
      </div>
    `;
    
    list.appendChild(el);
  });
  
  updateSlideshowUI();
}

function toggleSlideshowItem(idx) {
  slideshowItems[idx].selected = !slideshowItems[idx].selected;
  renderSlideshowList();
}

function updateSlideshowTiming(itemId, value) {
  const val = parseFloat(value);
  if (!isNaN(val) && val >= 0.1) {
    slideshowTimings[itemId] = val;
    // Save to localStorage
    localStorage.setItem('slideshow_timings', JSON.stringify(slideshowTimings));
    updateSlideshowUI();
  }
}

function applyUniversalTiming() {
  const input = document.getElementById('universal-timing-input');
  const val = parseFloat(input.value);
  if (!isNaN(val) && val >= 0.1) {
    slideshowItems.forEach(item => {
      slideshowTimings[item.id] = val;
    });
    localStorage.setItem('slideshow_timings', JSON.stringify(slideshowTimings));
    renderSlideshowList();
  }
}

function updateSlideshowUI() {
  const selectedItems = slideshowItems.filter(item => item.selected);
  const totalTime = selectedItems.reduce((sum, item) => sum + (slideshowTimings[item.id] || 0.8), 0);
  
  document.getElementById('slideshow-duration').textContent = `Estimated Duration: ${totalTime.toFixed(1)} seconds`;
  document.getElementById('slideshow-generate-btn').disabled = selectedItems.length === 0;
}

async function generateSlideshow() {
  const selectedItems = slideshowItems.filter(item => item.selected);
  if (selectedItems.length === 0) {
    alert('Please select at least one item');
    return;
  }

  closeSlideshowModal();

  const root = document.getElementById('capture-root');
  const storyHdr = document.getElementById('ig-story-hdr');
  const msgRows = Array.from(document.querySelectorAll('#ig-msgs > *'));

  const allElements = [];
  if (storySrc) allElements.push({ el: storyHdr, id: 'story', nat: 'block' });
  messages.forEach((m, i) => {
    if (msgRows[i]) allElements.push({ el: msgRows[i], id: `msg_${i}`, nat: 'flex' });
  });

  const selected = allElements.filter(item =>
    selectedItems.find(si => si.id === item.id)
  );

  if (selected.length === 0) return;

  const bgColor = document.getElementById('c-bg').value;
  const frames = [];
  const durations = [];

  document.getElementById('loading').classList.add('show');

  try {
    // Hide every element in the conversation
    allElements.forEach(item => { item.el.style.display = 'none'; });

    // Capture one canvas per step, revealing cumulatively
    for (let i = 0; i < selected.length; i++) {
      document.getElementById('loading-progress').textContent =
        `Capturing frame ${i + 1} / ${selected.length}…`;

      for (let j = 0; j <= i; j++) {
        selected[j].el.style.display = selected[j].nat;
      }

      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(root, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bgColor,
        logging: false
      });

      frames.push(canvas);
      durations.push(slideshowTimings[selected[i].id] || 0.8);
    }

    // Restore original visibility
    allElements.forEach(item => { item.el.style.display = ''; });

    document.getElementById('loading-progress').textContent = 'Encoding video…';
    await createVideoFromFrames(frames, durations);

  } catch (err) {
    allElements.forEach(item => { item.el.style.display = ''; });
    console.error(err);
    alert('Failed to generate slideshow. Please try Chrome or Edge.');
  }

  document.getElementById('loading').classList.remove('show');
  document.getElementById('loading-progress').textContent = '';
}

function createVideoFromFrames(frames, durations) {
  return new Promise((resolve) => {
    const fps = 30;

    // Use native capture width — no downscaling, pure quality.
    // Height = width × 16/9 so the canvas is always 9:16 (TikTok).
    // Content is shorter than the canvas on early frames → black bars shrink
    // as each new message appears, giving the organic "growing" reveal effect.
    const videoW = frames[0].width;                     // e.g. 390×4 = 1560 px
    const videoH = Math.round(videoW * 16 / 9);         // e.g. 2773 px

    const videoCanvas = document.createElement('canvas');
    videoCanvas.width  = videoW;
    videoCanvas.height = videoH;
    const ctx = videoCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const bgColor = document.getElementById('c-bg').value;

    let currentIdx = 0;
    let frameStart  = null;
    let rafId       = null;

    function drawCurrent() {
      const frame = frames[currentIdx];
      // Letterbox is always black regardless of chat background color.
      // Content is centered; as messages grow the block rises naturally.
      const dy = Math.round((videoH - frame.height) / 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, videoW, videoH);
      ctx.drawImage(frame, 0, dy);
    }

    const stream = videoCanvas.captureStream(fps);

    // Prefer MP4 so it plays natively on Mac / iPhone / Windows.
    const mimeTypes = [
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    const mimeType = mimeTypes.find(mt => {
      try { return MediaRecorder.isTypeSupported(mt); } catch(e) { return false; }
    }) || 'video/webm';
    const ext = mimeType.startsWith('video/mp4') ? 'mp4' : 'webm';

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 25_000_000   // 25 Mbps — lossless-looking at this res
    });
    const chunks = [];
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    mediaRecorder.onstop = () => {
      cancelAnimationFrame(rafId);
      const blob = new Blob(chunks, { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `ig-dm-slideshow.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      resolve();
    };

    // RAF loop keeps the canvas stream alive between frame transitions.
    function loop(ts) {
      if (!frameStart) frameStart = ts;
      if (ts - frameStart >= (durations[currentIdx] || 0.8) * 1000) {
        currentIdx++;
        if (currentIdx >= frames.length) {
          mediaRecorder.stop();
          return;
        }
        frameStart = ts;
      }
      drawCurrent();
      rafId = requestAnimationFrame(loop);
    }

    drawCurrent();
    mediaRecorder.start(100);  // flush encoded data every 100 ms
    rafId = requestAnimationFrame(loop);
  });
}
</script>

<!-- RANGE PICKER MODAL -->
<div id="range-modal">
  <div class="range-box">
    <div>
      <div class="range-title">Select screenshot range</div>
      <div class="range-sub">Click a start point, then an end point</div>
    </div>
    <div class="range-legend">
      <span><b style="background:#4ade80"></b> Start</span>
      <span><b style="background:#e8a87c"></b> End</span>
      <span><b style="background:rgba(255,255,255,0.12)"></b> In range</span>
    </div>
    <div class="range-list" id="range-list"></div>
    <div class="range-actions">
      <button class="range-dl" id="range-dl-btn" onclick="doRangeDownload()" disabled>⬇ Download</button>
      <button class="range-cancel-btn" onclick="closeRangePicker()">Cancel</button>
    </div>
  </div>
</div>

<!-- SLIDESHOW MODAL -->
<div id="slideshow-modal">
  <div class="slideshow-box">
    <div>
      <div class="slideshow-title">Create Slideshow Video</div>
      <div class="slideshow-sub">Each item reveals one at a time — exports as .webm video</div>
    </div>
    
    <div class="universal-timing">
      <label>Universal Delay:</label>
      <input type="number" id="universal-timing-input" step="0.1" min="0.1" max="10" value="0.8" />
      <span style="font-size:10px;color:rgba(255,255,255,0.3)">seconds</span>
      <button onclick="applyUniversalTiming()">Apply to All</button>
    </div>
    
    <div class="slideshow-list" id="slideshow-list"></div>
    
    <div class="slideshow-options">
      <div class="slideshow-option-row">
        <label>Transition Effect:</label>
        <select id="slideshow-transition" onchange="slideshowTransition=this.value">
          <option value="none">None (Instant)</option>
          <option value="fade">Fade</option>
          <option value="slide">Slide Down</option>
        </select>
      </div>
      <div class="slideshow-option-row">
        <label>Include Story Header:</label>
        <input type="checkbox" id="slideshow-story-chk" checked onchange="slideshowIncludeStory=this.checked" />
      </div>
    </div>
    
    <div class="slideshow-info" id="slideshow-duration">
      <strong>Estimated Duration:</strong> 0.0 seconds
    </div>
    
    <div class="slideshow-actions">
      <button class="slideshow-generate" id="slideshow-generate-btn" onclick="generateSlideshow()" disabled>🎬 Generate Video</button>
      <button class="slideshow-cancel" onclick="closeSlideshowModal()">Cancel</button>
    </div>
  </div>
</div>

</body>
</html>
