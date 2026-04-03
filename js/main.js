function enterSite() {
  document.getElementById('prePage').classList.add('leaving');
  document.getElementById('mainContent').classList.add('visible');
  setTimeout(() => { document.getElementById('prePage').classList.add('gone'); }, 900);
}

document.querySelectorAll('.tag').forEach(t => { 
  t.addEventListener('mouseenter', function() { this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'; }); 
  t.addEventListener('mouseleave', function() { this.style.transition = 'all 0.3s ease'; }); 
});

console.log('✦ Edd\'s website loaded successfully!');