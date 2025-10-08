# docs/conf.py — Infocyph Docs Hub (Sphinx 8.x / Python 3.13)
from __future__ import annotations
import os, datetime
from subprocess import Popen, PIPE

# --- Project information -----------------------------------------------------
project   = "Infocyph Docs Hub"
author    = "A. B. M. Mahmudul Hasan (Infocyph)"
year_now  = datetime.date.today().strftime("%Y")
copyright = f"2021-{year_now}, Infocyph"

def get_version() -> str:
    """Prefer RTD version label; fall back to current git branch or 'latest'."""
    if os.environ.get("READTHEDOCS") == "True":
        v = os.environ.get("READTHEDOCS_VERSION")
        if v:
            return v
    try:
        pipe = Popen("git rev-parse --abbrev-ref HEAD", stdout=PIPE, shell=True, universal_newlines=True)
        v = (pipe.stdout.read() or "").strip()
        return v or "latest"
    except Exception:
        return "latest"

version = get_version()
release = version
language = "en"

# Sphinx 8 root document
root_doc = "index"

# --- Syntax highlighting (PHP is handy for cross-project snippets) ----------
from pygments.lexers.web import PhpLexer
from sphinx.highlighting import lexers
highlight_language = "php"
lexers["php"]             = PhpLexer(startinline=True)
lexers["php-annotations"] = PhpLexer(startinline=True)

# --- Extensions --------------------------------------------------------------
extensions = [
    "myst_parser",
    "sphinx.ext.autodoc",
    "sphinx.ext.todo",
    "sphinx.ext.napoleon",
    "sphinx.ext.autosectionlabel",
    "sphinx.ext.intersphinx",
    "sphinx_copybutton",
    "sphinx_design",
    "sphinxcontrib.phpdomain",
    "sphinx.ext.extlinks",
    "sphinxcontrib.datatemplates",
    "sphinx_icons",
]

# MyST (Markdown) settings
myst_enable_extensions = [
    "colon_fence",
    "deflist",
    "attrs_block",
    "attrs_inline",
    "tasklist",
    "fieldlist",
    "linkify",    # requires linkify-it-py
]
myst_heading_anchors = 3

# Autodoc/Napoleon
autodoc_default_options = {
    "members": True,
    "undoc-members": True,
    "show-inheritance": True,
}
napoleon_google_docstring = True
napoleon_numpy_docstring  = False

# Intersphinx (add subprojects here as you publish them)
intersphinx_mapping = {
    "python": ("https://docs.python.org/3", None),
    # Example: "webrick": ("https://docs.infocyph.dev/projects/router/en/latest/", None),
}

# extlinks shortcut for PHP manual
extlinks = {
    "php": ("https://www.php.net/%s", "%s"),
}

# TODOs visible in HTML
todo_include_todos = True

# --- HTML output (Furo) ------------------------------------------------------
html_theme = "furo"
html_theme_options = {
    "sidebar_hide_name": False,
    "navigation_with_keys": True,
    # Optional footer icons:
    "footer_icons": [
        {
            "name": "GitHub",
            "url": "https://github.com/infocyph/docs-hub",
            "html": """
                <svg stroke="currentColor" fill="currentColor" stroke-width="0"
                     viewBox="0 0 16 16" height="1.1em" width="1.1em"
                     xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd"
                        d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38
                           0-.19-.01-.82-.01-1.49-2 .37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                           -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87
                           2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                           0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
                           .64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82
                           .44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95
                           .29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8
                           c0-4.42-3.58-8-8-8z"></path>
                </svg>
            """,
            "class": "",
        }
    ],
}
templates_path   = ["_templates"]
html_static_path = ["_static"]
html_css_files   = ["theme.css"]
html_title       = f"Infocyph Docs Hub — {version}"
html_show_sourcelink = True
html_show_sphinx    = False
html_last_updated_fmt = "%Y-%m-%d"

# LaTeX/PDF (optional; RTD handles builder)
latex_engine = "xelatex"
latex_elements = {
    "papersize": "a4paper",
    "pointsize": "11pt",
    "preamble": "",
    "figure_align": "H",
}

# GitHub context (for RTD “View source” links)
html_context = {
    "display_github": False,
    "github_user": "infocyph",
    "github_repo": "docs-hub",
    "github_version": version,
    "conf_py_path": "/docs/",
}

# Substitution for current year
rst_prolog = f"""
.. |current_year| replace:: {year_now}
"""
