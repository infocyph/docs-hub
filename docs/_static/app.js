(function () {
    const grid = document.getElementById('docGrid');
    const search = document.getElementById('searchInput');

    // Projects from Sphinx context
    const projects = Array.isArray(window.INF_PROJECTS) ? window.INF_PROJECTS : [];

    // Minimal icon set (can expand later)
    const icons = {
        bookOpen:
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>',
        github:
            '<svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
        chevron:
            '<svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>',
        docCard:
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13M7.5 5C5.754 5 4.168 5.477 3 6.253v13M16.5 5c1.747 0 3.332.477 4.5 1.253v13"/></svg>',
    };

    function render(list) {
        grid.innerHTML = list.map((p, idx) => {
            const title = p.title || "Untitled";
            const desc  = p.description || "";
            const docs  = p.docs || "#";
            const repo  = p.repo || null;

            return `
        <div class="doc-card" id="card-${idx}" onclick="(function(){var el=document.getElementById('card-${idx}');el.classList.toggle('expanded');})();">
          <div class="doc-card-header">
            <div class="doc-card-icon-wrapper">
              <div class="doc-card-icon">${icons.docCard}</div>
              <h3>${title}</h3>
              ${icons.chevron}
            </div>
            <p>${desc}</p>
          </div>

          <div class="doc-card-content">
            <div class="doc-card-content-inner">
              <h4>Quick Links</h4>
              <ul>
                <li>Read the documentation</li>
                ${repo ? '<li>Browse the source on GitHub</li>' : ''}
              </ul>
            </div>
          </div>

          <div class="doc-card-links">
            <a href="${docs}" class="btn btn-primary" onclick="event.stopPropagation()">
              ${icons.bookOpen} Documentation
            </a>
            ${repo ? `
              <a href="${repo}" class="btn btn-outline" onclick="event.stopPropagation()">
                ${icons.github} Repository
              </a>
            ` : ''}
          </div>
        </div>
      `;
        }).join('');
    }

    // Initial render
    render(projects);

    // Search
    if (search) {
        search.addEventListener('input', function(e) {
            const q = (e.target.value || '').toLowerCase();
            const filtered = projects.filter(p =>
                (p.title || '').toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q)
            );
            render(filtered);
        });
    }
})();
