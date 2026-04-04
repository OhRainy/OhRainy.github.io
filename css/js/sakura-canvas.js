(function() {
  const c = document.getElementById('sakura-canvas');
  const ctx = c.getContext('2d');
  let petals = [];
  
  function resize() { c.width = innerWidth; c.height = innerHeight; }
  
  function petal(x, y, sz, rot, a) { 
    ctx.save(); 
    ctx.translate(x, y); 
    ctx.rotate(rot); 
    ctx.globalAlpha = a; 
    ctx.beginPath(); 
    ctx.moveTo(0, 0); 
    ctx.bezierCurveTo(sz*0.4,-sz*0.6,sz,-sz*0.4,sz*0.5,sz*0.1); 
    ctx.bezierCurveTo(sz*0.2,sz*0.5,-sz*0.1,sz*0.3,0,0); 
    ctx.fillStyle = `rgba(255,183,213,${a})`; 
    ctx.fill(); 
    ctx.globalAlpha = 1; 
    ctx.restore(); 
  }
  
  function mk() { 
    return { 
      x: Math.random()*c.width, 
      y: -20-Math.random()*60, 
      sz: Math.random()*10+7, 
      sy: Math.random()*0.8+0.4, 
      sx: Math.random()*0.6-0.1, 
      rot: Math.random()*Math.PI*2, 
      rs: (Math.random()-0.5)*0.02, 
      a: Math.random()*0.4+0.2, 
      wp: Math.random()*Math.PI*2, 
      ws: Math.random()*0.02+0.01 
    }; 
  }
  
  function init() { 
    petals = []; 
    for (let i=0;i<28;i++) { 
      const p=mk(); 
      p.y=Math.random()*c.height; 
      petals.push(p); 
    } 
  }
  
  function anim() { 
    ctx.clearRect(0,0,c.width,c.height); 
    for (let i=0;i<petals.length;i++) { 
      const p=petals[i]; 
      p.wp+=p.ws; 
      p.x+=p.sx+Math.sin(p.wp)*0.5; 
      p.y+=p.sy; 
      p.rot+=p.rs; 
      petal(p.x,p.y,p.sz,p.rot,p.a); 
      if (p.y>c.height+30||p.x>c.width+30||p.x<-30) petals[i]=mk(); 
    } 
    requestAnimationFrame(anim); 
  }
  
  resize(); init(); requestAnimationFrame(anim); 
  addEventListener('resize', resize);
})();