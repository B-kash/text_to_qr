// Note -> QR generator module (classic script)
(function(global){
  const $id = (id) => document.getElementById(id);

  const el = {
    note: $id('note'),
    gen: $id('gen'),
    dl: $id('download'),
    clear: $id('clear'),
    box: $id('qr'),
    size: $id('size'),
    sizeVal: $id('sizeVal'),
    ecc: $id('ecc')
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
    el.dl.disabled = !(currentQR && lastGeneratedText === text);
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
    a.download = 'note-qr.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
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
    el.clear.addEventListener('click', clearAll);
    el.size.addEventListener('input', () => { el.sizeVal.textContent = el.size.value; });
    el.note.addEventListener('input', updateControls);
    document.addEventListener('keydown', (e)=>{ if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ generate(); } });
    el.box.innerHTML = '<div class="muted">Type your note above and click <b>Generate QR</b>.</div>';
    updateControls();
  }

  global.Generator = { initGenerator };
})(window);

