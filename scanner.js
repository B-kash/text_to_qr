// QR scanner module
(function(global){
  const { showTooltipOn } = global.UI;
  const $id = (id) => document.getElementById(id);
  const isValidURL = (s) => { try { new URL(s); return true; } catch { return false; } };

  const scan = {
    startBtn: $id('startScan'),
    stopBtn: $id('stopScan'),
    video: $id('cam'),
    canvas: $id('scanCanvas'),
    result: $id('scanResult'),
    actions: $id('scanActions'),
    copyBtn: $id('copyResult'),
    openLink: $id('openResult'),
    imgInput: $id('imgInput'),
    stream: null,
    rafId: null
  };

  function setOpenLink(text){
    if (isValidURL(text)){
      scan.openLink.href = text;
      scan.openLink.removeAttribute('aria-disabled');
      scan.openLink.removeAttribute('tabindex');
      scan.openLink.style.pointerEvents = 'auto';
    } else {
      scan.openLink.href = '#';
      scan.openLink.setAttribute('aria-disabled','true');
      scan.openLink.setAttribute('tabindex','-1');
      scan.openLink.style.pointerEvents = 'none';
    }
  }

  async function startScan(){
    try{
      scan.result.value = 'Requesting camera...';
      const constraints = { video: { facingMode: 'environment' } };
      scan.stream = await navigator.mediaDevices.getUserMedia(constraints);
      scan.video.srcObject = scan.stream;
      scan.video.style.display = 'block';
      await scan.video.play();
      scan.startBtn.disabled = true;
      scan.stopBtn.disabled = false;
      scan.result.value = 'Point the camera at a QR code...';
      tick();
    }catch(err){
      scan.result.value = 'Camera unavailable or permission denied. You can also decode from an image.';
    }
  }

  function stopScan(){
    if(scan.rafId) cancelAnimationFrame(scan.rafId);
    scan.rafId = null;
    if(scan.stream){
      scan.stream.getTracks().forEach(t=>t.stop());
      scan.stream = null;
    }
    scan.video.pause();
    scan.video.srcObject = null;
    scan.video.style.display = 'none';
    scan.startBtn.disabled = false;
    scan.stopBtn.disabled = true;
  }

  function showResult(text){
    scan.result.value = text;
    scan.actions.style.display = 'flex';
    setOpenLink(text);
  }

  function tick(){
    if(!scan.video.videoWidth){ scan.rafId = requestAnimationFrame(tick); return; }
    const c = scan.canvas;
    const w = scan.video.videoWidth;
    const h = scan.video.videoHeight;
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(scan.video, 0, 0, w, h);
    const img = ctx.getImageData(0,0,w,h);
    const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
    if(code && code.data){
      showResult(code.data);
      stopScan();
      return;
    }
    scan.rafId = requestAnimationFrame(tick);
  }

  async function decodeFromImage(file){
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=>{
      const c = scan.canvas; const ctx = c.getContext('2d');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      ctx.drawImage(img,0,0);
      const data = ctx.getImageData(0,0,c.width,c.height);
      const code = jsQR(data.data, c.width, c.height);
      if(code && code.data) showResult(code.data); else scan.result.value = 'No QR found in image.';
      URL.revokeObjectURL(url);
    };
    img.onerror = ()=>{ scan.result.value = 'Could not read image.'; URL.revokeObjectURL(url); };
    img.src = url;
  }

  function initScanner(){
    scan.startBtn.addEventListener('click', startScan);
    scan.stopBtn.addEventListener('click', stopScan);
    scan.copyBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(scan.result.value || '');
        showTooltipOn(scan.copyBtn, 'Copied!!');
      }catch{
        showTooltipOn(scan.copyBtn, 'Copy failed');
      }
    });
    scan.imgInput.addEventListener('change', (e)=>{ const file = e.target.files && e.target.files[0]; if(file) decodeFromImage(file); });
  }

  global.Scanner = { initScanner };
})(window);
