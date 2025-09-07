// UI helpers: ripples and tooltips
(function(global){
  function attachButtonRipples(){
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = `${size}px`;
        const x = e.clientX - rect.left - size/2;
        const y = e.clientY - rect.top - size/2;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }

  function showTooltipOn(el, text){
    if (!el) return;
    document.querySelectorAll('.tooltip').forEach(t => t.remove());
    const tip = document.createElement('span');
    tip.className = 'tooltip';
    tip.textContent = text;
    document.body.appendChild(tip);
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    tip.style.left = `${cx}px`;
    tip.style.top = `${rect.top}px`;
    const remove = () => tip.remove();
    tip.addEventListener('animationend', remove, { once: true });
    setTimeout(() => { if (tip.isConnected) remove(); }, 1200);
  }

  global.UI = { attachButtonRipples, showTooltipOn };
})(window);
