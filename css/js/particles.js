(function() {
  const container = document.getElementById('preParticles');
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'pre-particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 7 + 5) + 's';
    p.style.animationDelay = (Math.random() * 7) + 's';
    p.style.width = p.style.height = (Math.random() * 2 + 1) + 'px';
    container.appendChild(p);
  }
})();