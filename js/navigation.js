// ═══════════════════════════════════════════
//  Navigation & Page Switching System
// ═══════════════════════════════════════════

(function() {
  'use strict';
  
  const DEFAULT_PAGE = 'home';
  let pages = null;
  let navLinks = null;
  let currentPage = DEFAULT_PAGE;
  
  function init() {
    pages = document.querySelectorAll('.page');
    navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      link.addEventListener('click', handleNavClick);
    });
    
    window.addEventListener('hashchange', handleHashChange);
    
    const hash = window.location.hash.replace('#', '') || DEFAULT_PAGE;
    showPage(hash, false);
  }
  
  function handleNavClick(e) {
    e.preventDefault();
    const targetPage = this.getAttribute('data-page');
    if (targetPage && targetPage !== currentPage) {
      showPage(targetPage, true);
      history.pushState(null, null, `#${targetPage}`);
    }
  }
  
  function handleHashChange() {
    const hash = window.location.hash.replace('#', '') || DEFAULT_PAGE;
    if (hash !== currentPage) showPage(hash, true);
  }
  
  function showPage(pageId, animate = true) {
    const targetPage = document.getElementById(`page-${pageId}`);
    if (!targetPage) {
      console.warn(`Page '${pageId}' not found`);
      showPage(DEFAULT_PAGE, animate);
      return;
    }
    
    if (pageId === currentPage && targetPage.classList.contains('active')) return;
    
    if (currentPage) {
      const currentEl = document.getElementById(`page-${currentPage}`);
      if (currentEl) currentEl.classList.remove('active');
    }
    
    setTimeout(() => {
      targetPage.classList.add('active');
      currentPage = pageId;
      
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) link.classList.add('active');
      });
      
      const cardMain = document.querySelector('.card-main');
      if (cardMain && animate) cardMain.scrollTo({ top: 0, behavior: 'smooth' });
    }, animate ? 50 : 0);
  }
  
  window.NavigationSystem = { showPage, getCurrentPage: () => currentPage };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();