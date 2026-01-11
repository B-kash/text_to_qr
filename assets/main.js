(function(){
  window.UI.attachButtonRipples();
  window.Generator.initGenerator();
  window.Scanner.initScanner();
  // Register Service Worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/assets/sw.js').catch(()=>{});
  }

  // Mode switcher: show one pane at a time
  const modeSel = document.getElementById('mode');
  const genWrap = document.getElementById('genWrap');
  const scanWrap = document.getElementById('scanWrap');

  function setMode(mode){
    const isGen = mode !== 'scan';
    if (isGen) {
      genWrap.classList.remove('hidden');
      scanWrap.classList.add('hidden');
    } else {
      genWrap.classList.add('hidden');
      scanWrap.classList.remove('hidden');
    }
    // If leaving scan mode, stop the camera if running
    if (isGen) {
      const stopBtn = document.getElementById('stopScan');
      if (stopBtn && !stopBtn.disabled) stopBtn.click();
    }
    // Focus a sensible control
    if (isGen) {
      const note = document.getElementById('note');
      if (note) note.focus();
    } else {
      const start = document.getElementById('startScan');
      if (start) start.focus();
    }
  }

  if (modeSel && genWrap && scanWrap){
    // Default to generator view
    setMode(modeSel.value || 'gen');
    modeSel.addEventListener('change', (e)=> setMode(e.target.value));
  }
})();
