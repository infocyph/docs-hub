(function () {
    const grid   = document.getElementById('docGrid');
    const search = document.getElementById('searchInput');

    // ---------- SVG initials badge ----------
    function initialsBadgeDataURI(text, opts = {}) {
        const {
            size = 48,
            radius = 10,
            shape = "rounded",            // "rounded" | "circle"
            fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif",
            fontWeight = 700,
            bgStyle = "glass",            // "flat" | "glass"
            contrastStroke = true,
        } = opts;

        const t = ("" + (text || "")).trim().toUpperCase().slice(0, 2) || "?";

        // deterministic hues from letters
        const h = [...t].reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0) >>> 0;
        const hueA = h % 360;
        const hueB = (hueA + 40 + (h % 60)) % 360;
        const c1 = `hsl(${hueA} 75% 55%)`;
        const c2 = `hsl(${hueB} 75% 55%)`;

        const fontSize = (t.length === 1 ? 0.58 : 0.46) * size;

        const bg = (shape === "circle")
            ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)"/>`
            : `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#grad)"/>`;

        const glass = (bgStyle === "glass")
            ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${shape==='circle'?size/2:radius}" ry="${shape==='circle'?size/2:radius}"
           fill="url(#shine)" opacity="0.40"/>`
            : "";

        const letterStroke = contrastStroke
            ? `paint-order: stroke; stroke: rgba(0,0,0,.25); stroke-width: ${Math.max(1, size*0.02)}px`
            : "";

        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${t} badge">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#ffffff00" />
    </linearGradient>
    <style>
      :root { color-scheme: light dark; }
      .txt { fill: #ffffff; ${letterStroke} }
      @media (prefers-color-scheme: dark) {
        .txt { fill: #eef3ff; stroke: rgba(0,0,0,.55); }
      }
    </style>
  </defs>
  ${bg}
  ${glass}
  <text class="txt"
        x="50%" y="50%"
        font-family="${fontFamily}" font-weight="${fontWeight}"
        font-size="${fontSize}"
        dominant-baseline="middle" text-anchor="middle">
    ${t}
  </text>
</svg>`.trim();

        return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    }

    // Render all placeholders with a generated SVG
    function applyInitialsBadges(scope = document) {
        const nodes = scope.querySelectorAll('.js-initials[data-initials]');
        nodes.forEach(img => {
            const letters = (img.getAttribute('data-initials') || '').trim().toUpperCase().slice(0, 2);
            const uri = initialsBadgeDataURI(letters, { size: 48, shape: "rounded", bgStyle: "glass" });
            img.src = uri;
            img.style.borderRadius = '12px'; // visually match card icon radius
            img.decoding = 'async';
        });
    }

    // If grid already has server-rendered cards, just wire interactions.
    function allCards() {
        return Array.from(grid.querySelectorAll('.doc-card'));
    }

    // Toggle expand on click (delegate to handle server-rendered markup)
    grid.addEventListener('click', function (e) {
        const card = e.target.closest('.doc-card');
        if (!card) return;

        // Let links and the button row navigate without toggling
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
        grid.innerHTML = window.INF_PROJECTS.map((p, idx) => {
            // derive initials if not supplied
            const title = p.title || '';
            const words = title.trim().split(/\s+/);
            const fallback = (words[0]?.slice(0,1) || '') + (words[1]?.slice(0,1) || '');
            const initials = (p.icon || fallback).toUpperCase().slice(0,2);

            return `
      <div class="doc-card" id="card-${idx}"
           data-title="${(title||'').replace(/"/g,'&quot;')}"
           data-desc="${(p.description||'').replace(/"/g,'&quot;')}">
        <div class="doc-card-header">
          <div class="doc-card-icon-wrapper">
            <div class="doc-card-icon">
              <img class="js-initials" width="48" height="48" alt="${title} logo" data-initials="${initials}">
            </div>
            <h3>${title || 'Untitled'}</h3>
            <svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <p>${p.description || ''}</p>
        </div>
        <div class="doc-card-content">
          <div class="doc-card-content-inner">
            <h4>Details</h4>
            ${(p.details || '')}
          </div>
        </div>
        <div class="doc-card-links">
          ${p.docs ? `
          <a href="${p.docs}" class="btn btn-primary">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13"></path>
            </svg>
            Documentation
          </a>` : '' }
          ${p.repo ? `
          <a href="${p.repo}" class="btn btn-outline">
            <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387..."></path>
            </svg>
            Repository
          </a>` : '' }
        </div>
      </div>`;
        }).join('');

        // after injecting, generate icons
        applyInitialsBadges(grid);
    } else {
        // server-rendered cards: just generate icons
        applyInitialsBadges(document);
    }
})();
