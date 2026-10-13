#!/usr/bin/env bash
#
# Deploy the static site to production: https://code-alongsi.de
#
#   bash scripts/deploy.sh [--dry-run] [--skip-tests] [--allow-dirty] [--quarantine-legacy]
#
# Design
#   - Ships exactly what is committed (git archive of HEAD), restricted to an
#     allow-list of paths. Dev files (tests, node_modules, *.md, .github ...)
#     never leave the repository.
#   - The remote docroot is shared with other apps (wp, meteo-rss, ...), so the
#     script never deletes or mirrors anything on the server.
#   - The host has no rsync. Transfer is tar over SSH into an incoming
#     directory, then per-file rename (atomic), HTML last.
#   - Existing files are backed up on the server before they are replaced.
#   - Result is verified with SHA-256 checksums and an HTTPS smoke test.
#
# Environment overrides: DEPLOY_HOST (ssh alias), DEPLOY_DIR, SITE_URL.

set -euo pipefail

HOST="${DEPLOY_HOST:-code-alongsi.de}"
REMOTE_DIR="${DEPLOY_DIR:-httpdocs}"
SITE_URL="${SITE_URL:-https://code-alongsi.de}"
BACKUP_DIR=".deploy-backups"
KEEP_BACKUPS=10

# Allow-list. Add new top-level pages or directories here.
PATHS=(index.html impressum.html datenschutz.html robots.txt sitemap.xml llms.txt css js media .well-known)

# Dev files of this repository that an earlier git-based deployment left in the
# public docroot. Reported on every run, only moved away with --quarantine-legacy.
LEGACY=(package.json package-lock.json playwright.config.js tests .gitmodules .gitignore .github .kilocode .antigravitycli instructions)

DRY_RUN=0
SKIP_TESTS=0
ALLOW_DIRTY=0
QUARANTINE=0

log()  { printf '\033[32m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[33m[deploy] WARNING:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m[deploy] ERROR:\033[0m %s\n' "$*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --skip-tests) SKIP_TESTS=1 ;;
    --allow-dirty) ALLOW_DIRTY=1 ;;
    --quarantine-legacy) QUARANTINE=1 ;;
    -h|--help) sed -n '2,/^set -euo/p' "$0" | sed '$d' | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) die "unknown option: $1" ;;
  esac
  shift
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
git rev-parse --git-dir >/dev/null 2>&1 || die "not inside a git repository"

TS="$(date -u +%Y%m%dT%H%M%SZ)"
SSH=(ssh -o BatchMode=yes -o ConnectTimeout=15 "$HOST")

# ---------------------------------------------------------------- preflight
for p in "${PATHS[@]}"; do
  git cat-file -e "HEAD:$p" 2>/dev/null || die "'$p' is not committed on HEAD (git add + commit first, or fix PATHS)"
done

if [[ $ALLOW_DIRTY -eq 0 ]] && [[ -n "$(git status --porcelain -- "${PATHS[@]}")" ]]; then
  git status --short -- "${PATHS[@]}" >&2
  die "uncommitted changes in deployable paths; commit them (only HEAD is deployed) or pass --allow-dirty"
fi

log "source: $(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)"
log "target: ${HOST}:${REMOTE_DIR}  ->  ${SITE_URL}"

# Warn about stale sitemap dates and an expiring security.txt.
while read -r page; do
  [[ -z "$page" ]] && continue
  loc="$SITE_URL/"; [[ "$page" != "index.html" ]] && loc="$SITE_URL/$page"
  last_commit="$(git log -1 --format=%cs -- "$page")"
  lastmod="$(grep -A1 "<loc>${loc}</loc>" sitemap.xml | sed -n 's#.*<lastmod>\(.*\)</lastmod>.*#\1#p')"
  if [[ -n "$last_commit" && -n "$lastmod" && "$last_commit" > "$lastmod" ]]; then
    warn "sitemap.xml lastmod for ${page} is ${lastmod}, but the page changed on ${last_commit}"
  fi
done < <(printf '%s\n' index.html impressum.html datenschutz.html)

expires="$(sed -n 's/^Expires: //p' .well-known/security.txt || true)"
if [[ -n "$expires" ]]; then
  exp_s="$(date -u -d "$expires" +%s 2>/dev/null || echo 0)"
  now_s="$(date -u +%s)"
  if (( exp_s - now_s < 30*86400 )); then
    warn "security.txt expires ${expires} (less than 30 days left, renew it)"
  fi
fi

# ---------------------------------------------------------------- tests
if [[ $DRY_RUN -eq 1 ]]; then
  log "dry run: skipping test suite"
elif [[ $SKIP_TESTS -eq 0 ]]; then
  [[ -d node_modules ]] || die "node_modules missing; run 'npm install' (or pass --skip-tests)"
  if [[ -z "${PLAYWRIGHT_CHROMIUM_PATH:-}" ]]; then
    expected="$(node -e "console.log(require('@playwright/test').chromium.executablePath())" 2>/dev/null || true)"
    if [[ -n "$expected" && ! -x "$expected" ]]; then
      fallback="$(ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux/chrome 2>/dev/null | sort -V | tail -1 || true)"
      if [[ -n "$fallback" && -x "$fallback" ]]; then
        export PLAYWRIGHT_CHROMIUM_PATH="$fallback"
        log "using cached Chromium: $fallback"
      fi
    fi
  fi
  log "running test suite"
  npm test --silent || die "tests failed, nothing was deployed"
else
  warn "tests skipped"
fi

# ---------------------------------------------------------------- stage + manifest
mkdir -p "$ROOT/.scratch"
STAGE="$(mktemp -d "$ROOT/.scratch/deploy-stage.XXXXXX")"
MANIFEST="${STAGE}.sha256"
trap 'rm -rf "$STAGE" "$MANIFEST"' EXIT

git archive --format=tar HEAD -- "${PATHS[@]}" | tar -x -C "$STAGE"
(cd "$STAGE" && find . -type f -print0 | sort -z | xargs -0 sha256sum) > "$MANIFEST"
FILE_COUNT="$(wc -l < "$MANIFEST")"
log "staged ${FILE_COUNT} files from HEAD"

# Never ship secrets or dev leftovers by accident.
if (cd "$STAGE" && find . \( -name '*.md' -o -name '.env*' -o -name '*.pem' -o -name '*.key' -o -name 'node_modules' -o -name '.git' \) | grep -q .); then
  die "staging area contains files that must not be published (md/.env/keys/node_modules)"
fi

verify_remote() {  # prints names of files whose remote checksum differs or is missing
  local out
  # sha256sum exits 1 on mismatch; the trailing "true" keeps ssh's own exit code
  # (255 = connection problem) distinguishable from that.
  out="$("${SSH[@]}" "cd '$REMOTE_DIR' || exit 97; sha256sum -c --quiet 2>&1; true" < "$MANIFEST")" \
    || die "cannot reach ${HOST}:${REMOTE_DIR} over ssh"
  printf '%s\n' "$out" | sed -n 's#^\(.*\): FAILED.*#\1#p' | sort -u
}

CHANGED="$(verify_remote)"
CHANGED_COUNT="$(printf '%s' "$CHANGED" | grep -c . || true)"

# ---------------------------------------------------------------- legacy report
LEGACY_PRESENT="$("${SSH[@]}" "cd '$REMOTE_DIR' && for p in ${LEGACY[*]}; do [ -e \"\$p\" ] || [ -L \"\$p\" ] && echo \"\$p\"; done" || true)"
if [[ -n "$LEGACY_PRESENT" ]]; then
  warn "dev files from an earlier deployment are publicly reachable on the server:"
  printf '           %s\n' $LEGACY_PRESENT >&2
  warn "move them out of the docroot (reversible) with: bash scripts/deploy.sh --quarantine-legacy"
fi

# ---------------------------------------------------------------- dry run
if [[ $DRY_RUN -eq 1 ]]; then
  if [[ "$CHANGED_COUNT" -eq 0 ]]; then
    log "dry run: server already matches HEAD, nothing to upload"
  else
    log "dry run: ${CHANGED_COUNT} of ${FILE_COUNT} files would be created or updated:"
    printf '           %s\n' $CHANGED
  fi
  exit 0
fi

# ---------------------------------------------------------------- upload
if [[ "$CHANGED_COUNT" -gt 0 ]]; then
  log "backing up replaced files on the server (${BACKUP_DIR}/${TS}.tar)"
  "${SSH[@]}" bash -s -- "$REMOTE_DIR" "$BACKUP_DIR" "$TS" "$KEEP_BACKUPS" $CHANGED <<'REMOTE'
set -euo pipefail
dir="$1"; backup="$2"; ts="$3"; keep="$4"; shift 4
mkdir -p "$backup"
existing=""
for f in "$@"; do [ -e "$dir/$f" ] && existing="$existing$f"$'\n'; done
if [ -n "$existing" ]; then
  printf '%s' "$existing" | tar -C "$dir" -cf "$backup/$ts.tar" -T -
fi
# keep only the newest N backups of this tool
{ ls -1t "$backup"/*.tar 2>/dev/null || true; } | tail -n +"$((keep + 1))" | xargs -r rm -f
REMOTE

  log "uploading ${CHANGED_COUNT} changed files"
  # Upload only changed files, extract to an incoming dir, then rename into place.
  (cd "$STAGE" && printf '%s\n' $CHANGED | tar -cf - -T -) \
    | "${SSH[@]}" bash -s -- "$REMOTE_DIR" "$TS" <<'REMOTE' || die "upload failed; restore with: ssh $HOST \"tar -C $REMOTE_DIR -xf $BACKUP_DIR/$TS.tar\""
set -euo pipefail
dir="$1"; ts="$2"
incoming="$dir/.deploy-incoming-$ts"
trap 'rm -rf "$incoming"' EXIT
mkdir -p "$incoming"
tar -xf - -C "$incoming" --no-same-owner
cd "$incoming"
move() { while IFS= read -r f; do mkdir -p "../$(dirname "$f")"; mv -f "$f" "../$f"; done; }
find . -type f ! -name '*.html' | sort | move   # assets first
find . -type f -name '*.html'   | sort | move   # pages last
REMOTE
else
  log "server already matches HEAD, nothing to upload"
fi

# ---------------------------------------------------------------- legacy quarantine (opt-in)
if [[ $QUARANTINE -eq 1 && -n "$LEGACY_PRESENT" ]]; then
  log "moving legacy dev files to ${BACKUP_DIR}/legacy-${TS}/ (reversible)"
  "${SSH[@]}" bash -s -- "$REMOTE_DIR" "$BACKUP_DIR" "$TS" $LEGACY_PRESENT <<'REMOTE'
set -euo pipefail
dir="$1"; backup="$2"; ts="$3"; shift 3
mkdir -p "$backup/legacy-$ts"
for f in "$@"; do mv "$dir/$f" "$backup/legacy-$ts/"; done
REMOTE
fi

# ---------------------------------------------------------------- verify
STILL_DIFFERENT="$(verify_remote)"
if [[ -n "$STILL_DIFFERENT" ]]; then
  printf '           %s\n' $STILL_DIFFERENT >&2
  die "checksum mismatch after upload (backup: ${BACKUP_DIR}/${TS}.tar)"
fi
log "checksums: all ${FILE_COUNT} files on the server match HEAD"

fail=0
check() {  # path, expected substring in body ("" = reachability only), expected substring in content-type (optional)
  local path="$1" needle="$2" ctype="${3:-}" headers body=""
  headers="$(mktemp)"
  if [[ -z "$needle" ]]; then
    curl -fsS -m 20 -A 'code-alongsi-deploy-check' -o /dev/null -D "$headers" "${SITE_URL}${path}?deploy=${TS}" \
      || { warn "smoke: ${path} not reachable"; fail=1; rm -f "$headers"; return; }
  else
    body="$(curl -fsS -m 20 -A 'code-alongsi-deploy-check' -D "$headers" "${SITE_URL}${path}?deploy=${TS}")" \
      || { warn "smoke: ${path} not reachable"; fail=1; rm -f "$headers"; return; }
    grep -q -- "$needle" <<<"$body" || { warn "smoke: ${path} does not contain '${needle}'"; fail=1; }
  fi
  if [[ -n "$ctype" ]] && ! grep -qi "^content-type:.*${ctype}" "$headers"; then
    warn "smoke: ${path} content-type is '$(grep -i '^content-type:' "$headers" | tr -d '\r')', expected ${ctype}"; fail=1
  fi
  rm -f "$headers"
}

log "smoke test against ${SITE_URL}"
check "/"                          "Code-Alongside"              "text/html"
check "/impressum.html"            "Impressum"                   "text/html"
check "/datenschutz.html"          "Datenschutz"                 "text/html"
check "/robots.txt"                "Sitemap: ${SITE_URL}/sitemap.xml" "text/plain"
check "/sitemap.xml"               "<urlset"                     "xml"
check "/llms.txt"                  "# Code-Alongside"            "text/plain"
check "/.well-known/security.txt"  "Contact:"                    "text/plain"
check "/css/styles.css"            "Bioluminescent Night"        "text/css"
check "/media/fonts/inter-latin-400-normal.woff2" ""

[[ $fail -eq 0 ]] || die "deployed, but the smoke test reported problems (see warnings above)"
log "done: ${SITE_URL} is live at $(git rev-parse --short HEAD)"
