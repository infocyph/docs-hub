(function () {
  const grid   = document.getElementById('docGrid');
  const search = document.getElementById('searchInput');

  // ---------- Color Generation ----------
  function generateColorPair(text) {
    const t = ("" + (text || "")).trim().toUpperCase().slice(0, 2) || "?";
    const h = [...t].reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0) >>> 0;
    const hueA = h % 360;
    const hueB = (hueA + 40 + (h % 60)) % 360;
    return {
      color1: `hsl(${hueA} 75% 55%)`,
      color2: `hsl(${hueB} 75% 55%)`,
    };
  }

  // ---------- SVG Generation ----------
  function createSVGDefs(color1, color2) {
    return `
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"  stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="70%" stop-color="#ffffff00" />
    </linearGradient>
    <style>
      :root { color-scheme: light dark; }
      .txt { fill: #ffffff; ${createStrokeStyle()} }
      @media (prefers-color-scheme: dark) {
        .txt { fill: #eef3ff; stroke: rgba(0,0,0,.55); }
      }
    </style>
  </defs>`;
  }

  function createStrokeStyle(size = 48, contrastStroke = true) {
    if (!contrastStroke) return "";
    const strokeWidth = Math.max(1, size * 0.02);
    return `paint-order: stroke; stroke: rgba(0,0,0,.25); stroke-width: ${strokeWidth}px`;
  }

  function createBackgroundShape(size, radius, shape) {
    if (shape === "circle") {
      return `<circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="url(#grad)"/>`;
    }
    return `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#grad)"/>`;
  }

  function createGlassEffect(size, radius, shape, bgStyle) {
    if (bgStyle !== "glass") return "";
    const r = shape === 'circle' ? size/2 : radius;
    return `<rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}"
           fill="url(#shine)" opacity="0.40"/>`;
  }

  function createTextElement(text, size, fontFamily, fontWeight, letterStroke) {
    const fontSize = (text.length === 1 ? 0.58 : 0.46) * size;
    return `
  <text class="txt"
        x="50%" y="50%"
        font-family="${fontFamily}" font-weight="${fontWeight}"
        font-size="${fontSize}"
        dominant-baseline="middle" text-anchor="middle">
    ${text}
  </text>`;
  }

  // ---------- Main SVG Badge Generator ----------
  function initialsBadgeDataURI(text, opts = {}) {
    const {
      size = 48,
      radius = 10,
      shape = "rounded",
      fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Helvetica Neue, Arial, sans-serif",
      fontWeight = 700,
      bgStyle = "glass",
      contrastStroke = true,
    } = opts;

    const displayText = ("" + (text || "")).trim().toUpperCase().slice(0, 2) || "?";
    const colors = generateColorPair(text);
    const letterStroke = createStrokeStyle(size, contrastStroke);

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${displayText} badge">
  ${createSVGDefs(colors.color1, colors.color2)}
  ${createBackgroundShape(size, radius, shape)}
  ${createGlassEffect(size, radius, shape, bgStyle)}
  ${createTextElement(displayText, size, fontFamily, fontWeight, letterStroke)}
</svg>`.trim();

    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // ---------- Badge Rendering ----------
  function applyInitialsBadges(scope = document) {
    const nodes = scope.querySelectorAll('.js-initials[data-initials]');
    nodes.forEach(img => {
      const letters = (img.getAttribute('data-initials') || '').trim().toUpperCase().slice(0, 2);
      const uri = initialsBadgeDataURI(letters, {
        size: 48,
        shape: "rounded",
        bgStyle: "glass"
      });
      img.src = uri;
      img.style.borderRadius = '12px';
      img.decoding = 'async';
    });
  }

  // ---------- Card Management ----------
  function getAllCards() {
    return Array.from(grid.querySelectorAll('.doc-card'));
  }

  function deriveInitials(title, icon) {
    if (icon) return icon.toUpperCase().slice(0, 2);
    const words = title.trim().split(/\s+/);
    return ((words[0]?.slice(0, 1) || '') + (words[1]?.slice(0, 1) || '')).toUpperCase().slice(0, 2);
  }

  // ---------- Search Functionality ----------
  function extractSearchableContent(card) {
    // Extract all data attributes for comprehensive search
    return {
      title: (card.getAttribute('data-title') || '').toLowerCase(),
      description: (card.getAttribute('data-desc') || '').toLowerCase(),
      details: (card.getAttribute('data-details') || '').toLowerCase(),
      repo: (card.getAttribute('data-repo') || '').toLowerCase(),
      docs: (card.getAttribute('data-docs') || '').toLowerCase(),
      icon: (card.getAttribute('data-icon') || '').toLowerCase(),
    };
  }

  function matchesSearch(searchableContent, query) {
    // Search across all fields
    return Object.values(searchableContent).some(value =>
      value.includes(query)
    );
  }

  function setupSearch() {
    if (!search) return;

    search.addEventListener('input', function (e) {
      const query = (e.target.value || '').toLowerCase().trim();

      getAllCards().forEach(card => {
        if (!query) {
          // Show all cards if search is empty
          card.style.display = '';
          return;
        }

        const content = extractSearchableContent(card);
        const matches = matchesSearch(content, query);
        card.style.display = matches ? '' : 'none';
      });
    });
  }

  // ---------- Card Interaction ----------
  function setupCardInteraction() {
    grid.addEventListener('click', function (e) {
      const card = e.target.closest('.doc-card');
      if (!card) return;

      // Don't toggle if clicking links or buttons
      if (e.target.closest('a') || e.target.closest('.doc-card-links')) return;

      card.classList.toggle('expanded');
    });
  }

  // ---------- Card HTML Generation ----------
  function createCardHTML(project, index) {
    const title = project.title || 'Untitled';
    const initials = deriveInitials(title, project.icon);
    const escapedTitle = (title || '').replace(/"/g, '&quot;');
    const escapedDesc = (project.description || '').replace(/"/g, '&quot;');

    // Strip HTML tags from details for search
    const detailsText = (project.details || '').replace(/<[^>]*>/g, '');
    const escapedDetails = detailsText.replace(/"/g, '&quot;');
    const escapedRepo = (project.repo || '').replace(/"/g, '&quot;');
    const escapedDocs = (project.docs || '').replace(/"/g, '&quot;');
    const escapedIcon = (initials || '').replace(/"/g, '&quot;');

    return `
      <div class="doc-card" id="card-${index}"
           data-title="${escapedTitle}"
           data-desc="${escapedDesc}"
           data-details="${escapedDetails}"
           data-repo="${escapedRepo}"
           data-docs="${escapedDocs}"
           data-icon="${escapedIcon}">
        <div class="doc-card-header">
          <div class="doc-card-icon-wrapper">
            <div class="doc-card-icon">
              <img class="js-initials" width="48" height="48" alt="${title} logo" data-initials="${initials}">
            </div>
            <h3>${title}</h3>
            <svg class="expand-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
          <p>${project.description || ''}</p>
        </div>
        <div class="doc-card-content">
          <div class="doc-card-content-inner">
            <h4>Details</h4>
            ${project.details || ''}
          </div>
        </div>
        <div class="doc-card-links">
          ${createDocLink(project.docs)}
          ${createRepoLink(project.repo)}
        </div>
      </div>`;
  }

  function createDocLink(docsUrl) {
    if (!docsUrl) return '';
    return `
          <a href="${docsUrl}" class="btn btn-primary">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13"></path>
            </svg>
            Documentation
          </a>`;
  }

  function createRepoLink(repoUrl) {
    if (!repoUrl) return '';
    return `
          <a href="${repoUrl}" class="btn btn-outline">
            <svg fill="currentColor" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
            </svg>
            Repository
          </a>`;
  }

  // ---------- Progressive Enhancement ----------
  function renderClientSideCards() {
    if (!Array.isArray(window.INF_PROJECTS)) return false;

    grid.innerHTML = window.INF_PROJECTS
      .map((project, index) => createCardHTML(project, index))
      .join('');

    applyInitialsBadges(grid);
    return true;
  }

  // ---------- Initialization ----------
  function initialize() {
    setupCardInteraction();
    setupSearch();

    // Progressive enhancement: client-side render if no server-rendered cards
    if (!getAllCards().length) {
      renderClientSideCards();
    } else {
      // Server-rendered cards: just generate icons
      applyInitialsBadges(document);
    }
  }

  // Start the app
  initialize();
})();