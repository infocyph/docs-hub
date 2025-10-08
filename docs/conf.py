# docs/conf.py — Infocyph Docs Hub (single-page, Sphinx basic theme)
from __future__ import annotations
import os, datetime, json
from pathlib import Path
from subprocess import Popen, PIPE

# --- Project info -----------------------------------------------------------
project   = "Infocyph Docs Hub"
author    = "A. B. M. Mahmudul Hasan (Infocyph)"
year_now  = datetime.date.today().strftime("%Y")
copyright = f"2021-{year_now}, Infocyph"

def get_version() -> str:
    if os.environ.get("READTHEDOCS") == "True":
        v = os.environ.get("READTHEDOCS_VERSION")
        if v:
            return v
    try:
        v = Popen(
            "git rev-parse --abbrev-ref HEAD",
            stdout=PIPE, shell=True, universal_newlines=True
        ).stdout.read().strip()
        return v or "latest"
    except Exception:
        return "latest"

version = release = get_version()
language = "en"
root_doc = "index"   # keep for non-HTML builders (future-proof)

# --- Extensions (lean) -----------------------------------------------------
extensions = [
    "myst_parser",
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx.ext.intersphinx",
]

myst_enable_extensions = [
    "colon_fence", "deflist", "attrs_block", "attrs_inline",
    "tasklist", "fieldlist", "linkify",
]
myst_heading_anchors = 3

intersphinx_mapping = {"python": ("https://docs.python.org/3", None)}

# --- Load projects.json for landing template --------------------------------
_here = Path(__file__).parent
_projects_json = _here / "data" / "projects.json"
try:
    with _projects_json.open("r", encoding="utf-8") as f:
        projects = json.load(f)
except Exception:
    projects = []

# --- HTML (basic theme + custom page) ---------------------------------------
html_theme = "basic"
templates_path   = ["_templates"]
html_static_path = ["_static"]
html_css_files   = ["app.css"]            # your CSS
html_title       = f"Infocyph Docs Hub — {version}"
html_show_sourcelink = False
html_last_updated_fmt = "%Y-%m-%d"

# Render our custom landing at /
html_additional_pages = {
    "index": "landing.html",             # _templates/landing.html
}

# Make data available to Jinja
html_context = {
    "current_year": year_now,
    "projects": projects,
    "version_label": version,
}

# Substitution for current year (used only if you export to other formats)
rst_prolog = f"""
.. |current_year| replace:: {year_now}
"""
