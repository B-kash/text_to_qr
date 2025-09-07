// Note -> QR generator module (classic script)
(function(global){
  const $id = (id) => document.getElementById(id);

  const el = {
    note: $id('note'),
    gen: $id('gen'),
    dl: $id('download'),
    copyPng: $id('copyPng'),
    copySvg: $id('copySvg'),
    share: $id('shareBtn'),
    clear: $id('clear'),
    box: $id('qr'),
    size: $id('size'),
    sizeVal: $id('sizeVal'),
    ecc: $id('ecc'),
    template: $id('template'),
    useTemplate: $id('useTemplate')
  };

  let currentQR = null;
  let lastGeneratedText = null;

  const eccVal = (v) => ({
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H
  }[v] || QRCode.CorrectLevel.M);

  function updateControls(){
    const text = (el.note.value || '').trim();
    el.clear.disabled = text.length === 0;
    const hasCurrent = !!(currentQR && lastGeneratedText === text);
    el.dl.disabled = !hasCurrent;
    el.copyPng.disabled = !hasCurrent;
    el.copySvg.disabled = !hasCurrent;
    el.share.disabled = !hasCurrent || !(navigator.share || (navigator.canShare && navigator.canShare()));
  }

  function generate(){
    const text = el.note.value.trim();
    const size = parseInt(el.size.value,10) || 256;
    const ec = eccVal(el.ecc.value);
    el.sizeVal.textContent = size;
    if(!text){
      el.box.innerHTML = '<div class="muted">Type something above and hit Generate.</div>';
      currentQR = null;
      lastGeneratedText = null;
      updateControls();
      return;
    }
    el.box.innerHTML = '';
    currentQR = new QRCode(el.box, { text, width: size, height: size, correctLevel: ec });
    lastGeneratedText = text;
    setTimeout(updateControls, 50);
  }

  function downloadPNG(){
    if(!currentQR) return;
    const img = el.box.querySelector('img');
    const canvas = el.box.querySelector('canvas');
    let dataURL;
    if(canvas){ dataURL = canvas.toDataURL('image/png'); }
    else if(img){
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      dataURL = c.toDataURL('image/png');
    }
    if(!dataURL) return;
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'text-qr.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function canvasOrImage(){
    const img = el.box.querySelector('img');
    const canvas = el.box.querySelector('canvas');
    return { img, canvas };
  }

  function canvasToBlob(canvas){
    return new Promise((res)=> canvas.toBlob(res, 'image/png'));
  }

  async function getPngBlob(){
    const { img, canvas } = canvasOrImage();
    if(canvas){ return await canvasToBlob(canvas); }
    if(img){
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return await canvasToBlob(c);
    }
    return null;
  }

  async function copyPNG(){
    try{
      const blob = await getPngBlob();
      if(!blob) return;
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
    }catch{}
  }

  async function getSvgBlob(){
    // Wrap PNG data in an SVG container so we can offer an SVG clipboard item
    const blob = await getPngBlob();
    if(!blob) return null;
    const dataUrl = await new Promise((res)=>{
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(blob);
    });
    const size = parseInt(el.size.value, 10) || 256;
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n  <image href="${dataUrl}" x="0" y="0" width="${size}" height="${size}"/>\n</svg>`;
    return new Blob([svg], { type: 'image/svg+xml' });
  }

  async function copySVG(){
    try{
      const blob = await getSvgBlob();
      if(!blob) return;
      const item = new ClipboardItem({ 'image/svg+xml': blob });
      await navigator.clipboard.write([item]);
    }catch{}
  }

  async function shareImage(){
    if(!navigator.share) return;
    try{
      const png = await getPngBlob();
      if(!png) return;
      const file = new File([png], 'text-qr.png', { type: 'image/png' });
      if(navigator.canShare && !navigator.canShare({ files: [file] })){
        await navigator.share({ title: 'Text → QR', text: (el.note.value || '').trim() });
        return;
      }
      await navigator.share({ title: 'Text → QR', text: (el.note.value || '').trim(), files: [file] });
    }catch{}
  }

  function promptWiFi(){
    const ssid = prompt('Wi‑Fi SSID:') || '';
    if(!ssid) return;
    const auth = prompt('Security (WEP/WPA/nopass):', 'WPA') || 'WPA';
    const pass = auth.toLowerCase() === 'nopass' ? '' : (prompt('Password:') || '');
    const hidden = prompt('Hidden? (true/false):', 'false') || 'false';
    const payload = `WIFI:T:${auth};S:${ssid};P:${pass};H:${hidden};;`;
    el.note.value = payload;
  }

  function promptVCard(){
    const first = prompt('First name:') || '';
    const last = prompt('Last name:') || '';
    const phone = prompt('Phone:') || '';
    const email = prompt('Email:') || '';
    const org = prompt('Organization (optional):', '') || '';
    const v = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${last};${first};;;`,
      `FN:${first} ${last}`.trim(),
      org ? `ORG:${org}` : '',
      phone ? `TEL;TYPE=CELL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');
    el.note.value = v;
  }

  function promptVCal(){
    const title = prompt('Event title:') || 'Event';
    const start = prompt('Start (YYYYMMDDThhmmssZ):', '') || '';
    const end = prompt('End (YYYYMMDDThhmmssZ):', '') || '';
    const where = prompt('Location (optional):', '') || '';
    const desc = prompt('Description (optional):', '') || '';
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      start ? `DTSTART:${start}` : '',
      end ? `DTEND:${end}` : '',
      where ? `LOCATION:${where}` : '',
      desc ? `DESCRIPTION:${desc}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\n');
    el.note.value = lines;
  }

  function insertTemplate(){
    const val = el.template.value;
    if(val === 'wifi') return promptWiFi();
    if(val === 'vcard') return promptVCard();
    if(val === 'vcal') return promptVCal();
  }

  function clearAll(){
    el.note.value = '';
    el.box.innerHTML = '<div class="muted">Cleared.</div>';
    currentQR = null;
    lastGeneratedText = null;
    el.note.focus();
    updateControls();
  }

  function initGenerator(){
    el.gen.addEventListener('click', generate);
    el.dl.addEventListener('click', downloadPNG);
    el.copyPng.addEventListener('click', copyPNG);
    el.copySvg.addEventListener('click', copySVG);
    el.share.addEventListener('click', shareImage);
    el.clear.addEventListener('click', clearAll);
    el.size.addEventListener('input', () => { el.sizeVal.textContent = el.size.value; });
    el.note.addEventListener('input', updateControls);
    el.useTemplate.addEventListener('click', insertTemplate);
    document.addEventListener('keydown', (e)=>{ if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ generate(); } });
    el.box.innerHTML = '<div class="muted">Type your text above and click <b>Generate QR</b>.</div>';
    updateControls();
  }

  global.Generator = { initGenerator };
})(window);
