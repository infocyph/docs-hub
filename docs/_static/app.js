(function () {
    const grid   = document.getElementById('docGrid');
    const search = document.getElementById('searchInput');

    // If grid already has server-rendered cards, just wire interactions.
    function allCards() {
        return Array.from(grid.querySelectorAll('.doc-card'));
    }

    // Toggle expand on click (delegate to handle server-rendered markup)
    grid.addEventListener('click', function (e) {
        const card = e.target.closest('.doc-card');
        if (!card) return;

        // If the click is on any link or inside the button row, let it navigate
        if (e.target.closest('a') || e.target.closest('.doc-card-links')) return;

        card.classList.toggle('expanded');
    });


    // Live search filters the SSR cards using data attributes
    if (search) {
        search.addEventListener('input', function (e) {
            const q = (e.target.value || '').toLowerCase();
            allCards().forEach(card => {
                const title = (card.getAttribute('data-title') || '').toLowerCase();
                const desc  = (card.getAttribute('data-desc')  || '').toLowerCase();
                const match = title.includes(q) || desc.includes(q);
                card.style.display = match ? '' : 'none';
            });
        });
    }

    // Progressive enhancement: if there were NO cards for some reason,
    // fall back to client-side render using window.INF_PROJECTS.
    if (!allCards().length && Array.isArray(window.INF_PROJECTS)) {
        grid.innerHTML = window.INF_PROJECTS.map((p, idx) => `
      <div class="doc-card" id="card-${idx}" data-title="${(p.title||'').replace(/"/g,'&quot;')}" data-desc="${(p.description||'').replace(/"/g,'&quot;')}">
        <div class="doc-card-header">
          <div class="doc-card-icon-wrapper">
            <div class="doc-card-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13M7.5 5C5.754 5 4.168 5.477 3 6.253v13M16.5 5c1.747 0 3.332.477 4.5 1.253v13"/>
              </svg>
            </div>
            <h3>${p.title || 'Untitled'}</h3>
            <svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <p>${p.description || ''}</p>
        </div>
        <div class="doc-card-content">
          <div class="doc-card-content-inner">
            <h4>Quick Links</h4>
            <ul>
              <li>Read the documentation</li>
              ${p.repo ? '<li>Browse the source on GitHub</li>' : ''}
            </ul>
          </div>
        </div>
        <div class="doc-card-links">
          <a href="${p.docs || '#'}" class="btn btn-primary">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13"/>
            </svg>
            Documentation
          </a>
          ${p.repo ? `
            <a href="${p.repo}" class="btn btn-outline">
              <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387..."></path>
              </svg>
              Repository
            </a>` : ''}
        </div>
      </div>
    `).join('');
    }
})();
