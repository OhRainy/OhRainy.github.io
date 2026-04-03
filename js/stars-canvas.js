(function() {
  const c = document.getElementById('stars-canvas');
  const ctx = c.getContext('2d');
  let stars = [];
  
  function resize() { c.width = innerWidth; c.height = innerHeight; }
  function make() { 
    stars = []; 
    for (let i = 0; i < 160; i++) 
      stars.push({ 
        x: Math.random() * c.width, 
        y: Math.random() * c.height, 
        r: Math.random() * 1.4 + 0.3, 
        sp: Math.random() * 0.008 + 0.003, 
        ph: Math.random() * Math.PI * 2 
      }); 
  }
  
  function draw(t) { 
    ctx.clearRect(0, 0, c.width, c.height); 
    for (const s of stars) { 
      const tw = 0.4 + 0.6 * Math.sin(t * s.sp + s.ph); 
      ctx.beginPath(); 
      ctx.arc(s.x, s.y, Math.max(0.1, s.r), 0, Math.PI * 2); 
      ctx.fillStyle = `rgba(220,210,255,${tw})`; 
      ctx.fill(); 
    } 
    requestAnimationFrame(draw); 
  }
  
  resize(); make(); requestAnimationFrame(draw); 
  addEventListener('resize', () => { resize(); make(); });
})();