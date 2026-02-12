#!/usr/bin/env bash
set -euo pipefail

# Wizard Coherence Audit — ia-exec-motor (post v0.5.6)
# Ejecutar desde la raíz del repo.

ROOT="$(pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m"

pass() { echo -e "${GREEN}PASS${NC} - $*"; }
fail() { echo -e "${RED}FAIL${NC} - $*" >&2; exit 1; }
warn() { echo -e "${YELLOW}WARN${NC} - $*" >&2; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Falta comando requerido: $1"
}

section() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

assert_file() {
  local p="$1"
  [[ -f "$p" ]] || fail "No existe archivo: $p"
}

assert_dir() {
  local p="$1"
  [[ -d "$p" ]] || fail "No existe directorio: $p"
}

assert_contains() {
  local file="$1"
  local needle="$2"
  grep -Fq "$needle" "$file" || fail "No contiene '$needle' en $file"
}

assert_not_exists() {
  local p="$1"
  [[ ! -e "$p" ]] || fail "NO debería existir pero existe: $p"
}

# ------------------------
# Preflight
# ------------------------
section "0) Preflight"
require_cmd node
require_cmd npm
require_cmd git
echo "Root: $ROOT"
echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"

# ------------------------
# 1) Working tree limpio (opcional estricto)
# ------------------------
section "1) Git clean (recomendado)"
if [[ -n "$(git status --porcelain)" ]]; then
  warn "Working tree NO está limpio. Recomiendo commit/stash antes de auditar formalmente."
  git status --porcelain
else
  pass "Working tree limpio"
fi

# ------------------------
# 2) Gate base: tests repo
# ------------------------
section "2) Gate base: npm test"
npm test
pass "npm test OK"

# ------------------------
# 3) Wizard no-interactivo (no debe pedir stdin)
# ------------------------
section "3) Wizard no-interactivo (flags completas, exit 0)"
npm run cli -- wizard \
  --project-name "audit-noinput-${STAMP}" \
  --stack node-ts \
  --profile Standard \
  --desc "audit" \
  --visibility public \
  --license MIT \
  --author "Audit Author" \
  --codeowners "@Caprini,@Fabio" >/dev/null
pass "Wizard no-interactivo ejecuta sin bloquear"

TARGET_NOINPUT="../audit-noinput-${STAMP}"
assert_dir "$TARGET_NOINPUT"
pass "Se creó carpeta destino: $TARGET_NOINPUT"

# ------------------------
# 4) Contrato: archivos mínimos esperados (cuando license MIT y codeowners no vacío)
# ------------------------
section "4) Artefactos mínimos (caso MIT + codeowners)"
assert_file "$TARGET_NOINPUT/blueprint/project.json"
assert_file "$TARGET_NOINPUT/.cursorrules"
assert_file "$TARGET_NOINPUT/ROADMAP.md"
assert_dir  "$TARGET_NOINPUT/context"
assert_dir  "$TARGET_NOINPUT/docs"
assert_dir  "$TARGET_NOINPUT/.github"
assert_dir  "$TARGET_NOINPUT/.github/ISSUE_TEMPLATE"
assert_file "$TARGET_NOINPUT/.github/pull_request_template.md"
assert_file "$TARGET_NOINPUT/.github/ISSUE_TEMPLATE/config.yml"

# Condicionales (deben existir aquí)
assert_file "$TARGET_NOINPUT/LICENSE"
assert_file "$TARGET_NOINPUT/CODEOWNERS"

pass "Artefactos base + condicionales presentes"

# Contenido mínimo en cursorrules
assert_contains "$TARGET_NOINPUT/.cursorrules" "SCOPE-01"
assert_contains "$TARGET_NOINPUT/.cursorrules" "Prompt Anatomy"
assert_contains "$TARGET_NOINPUT/.cursorrules" "No-regression"
assert_contains "$TARGET_NOINPUT/.cursorrules" "Context anchoring"
assert_contains "$TARGET_NOINPUT/.cursorrules" "Perfil de este proyecto:"
pass ".cursorrules contiene secciones clave"

# ROADMAP hardening
assert_contains "$TARGET_NOINPUT/ROADMAP.md" "Definition of v1.0.0"
assert_contains "$TARGET_NOINPUT/ROADMAP.md" "Stack decisions"
assert_contains "$TARGET_NOINPUT/ROADMAP.md" "Fuera de alcance"
assert_contains "$TARGET_NOINPUT/ROADMAP.md" "No inventar dependencias"
pass "ROADMAP hardening OK"

# Blueprint incluye campos v0.2 (mínimo)
assert_contains "$TARGET_NOINPUT/blueprint/project.json" "\"version\""
assert_contains "$TARGET_NOINPUT/blueprint/project.json" "\"license\""
assert_contains "$TARGET_NOINPUT/blueprint/project.json" "\"author\""
assert_contains "$TARGET_NOINPUT/blueprint/project.json" "\"codeowners\""
pass "project.json incluye campos license/author/codeowners"

# LICENSE y CODEOWNERS reflejan blueprint
assert_contains "$TARGET_NOINPUT/LICENSE" "MIT License"
assert_contains "$TARGET_NOINPUT/LICENSE" "Audit Author"
assert_contains "$TARGET_NOINPUT/CODEOWNERS" "@Caprini"
assert_contains "$TARGET_NOINPUT/CODEOWNERS" "@Fabio"
pass "LICENSE y CODEOWNERS reflejan author/owners"

# ------------------------
# 5) Reglas condicionales: license None => NO LICENSE
# ------------------------
section "5) Condicional: license=None => NO LICENSE"
TARGET_NOLICENSE="../audit-nolicense-${STAMP}"
rm -rf "$TARGET_NOLICENSE" || true

npm run cli -- wizard \
  --project-name "audit-nolicense-${STAMP}" \
  --stack node-ts \
  --profile Standard \
  --desc "audit" \
  --visibility public \
  --license None \
  --codeowners "@Caprini" >/dev/null

assert_dir "$TARGET_NOLICENSE"
assert_not_exists "$TARGET_NOLICENSE/LICENSE"
pass "license=None no genera LICENSE"

# ------------------------
# 6) Reglas condicionales: codeowners vacío => NO CODEOWNERS
# ------------------------
section "6) Condicional: codeowners vacío => NO CODEOWNERS"
TARGET_NOCO="../audit-noco-${STAMP}"
rm -rf "$TARGET_NOCO" || true

npm run cli -- wizard \
  --project-name "audit-noco-${STAMP}" \
  --stack node-ts \
  --profile Standard \
  --desc "audit" \
  --visibility public \
  --license MIT \
  --author "Audit Author" \
  --codeowners "" >/dev/null

assert_dir "$TARGET_NOCO"
assert_not_exists "$TARGET_NOCO/CODEOWNERS"
pass "codeowners vacío no genera CODEOWNERS"

# ------------------------
# 7) Colisión: sin --force => exit 1
# ------------------------
section "7) Colisión: sin --force debe abortar (exit 1)"
TARGET_COLLISION="../audit-collision-${STAMP}"
rm -rf "$TARGET_COLLISION" || true
mkdir -p "$TARGET_COLLISION"

set +e
npm run cli -- wizard \
  --project-name "audit-collision-${STAMP}" \
  --stack node-ts \
  --profile Standard \
  --desc "audit" \
  --visibility public \
  --license MIT \
  --author "Audit Author" \
  --codeowners "@Caprini" >/dev/null 2>&1
CODE=$?
set -e

[[ "$CODE" -eq 1 ]] || fail "Esperaba exit 1 en colisión sin --force, pero fue $CODE"
pass "Colisión sin --force aborta (exit 1)"

# ------------------------
# 8) Colisión: con --force => exit 0
# ------------------------
section "8) Colisión: con --force debe sobrescribir (exit 0)"
npm run cli -- wizard \
  --project-name "audit-collision-${STAMP}" \
  --stack node-ts \
  --profile Standard \
  --desc "audit" \
  --visibility public \
  --license MIT \
  --author "Audit Author" \
  --codeowners "@Caprini" \
  --force >/dev/null

pass "Colisión con --force ejecuta (exit 0)"

# ------------------------
# 9) Determinismo: mismo input => mismos bytes
# ------------------------
section "9) Determinismo: same answers => same output"
A="../audit-det-a-${STAMP}"
B="../audit-det-b-${STAMP}"
rm -rf "$A" "$B" || true

npm run cli -- wizard \
  --project-name "audit-det-a-${STAMP}" \
  --stack nextjs \
  --profile Strict \
  --desc "det" \
  --visibility public \
  --license MIT \
  --author "Det Author" \
  --codeowners "@A,@B" >/dev/null

npm run cli -- wizard \
  --project-name "audit-det-b-${STAMP}" \
  --stack nextjs \
  --profile Strict \
  --desc "det" \
  --visibility public \
  --license MIT \
  --author "Det Author" \
  --codeowners "@A,@B" >/dev/null

diff -u "$A/.cursorrules" "$B/.cursorrules" >/dev/null && pass "Determinismo: .cursorrules"
diff -u "$A/blueprint/project.json" "$B/blueprint/project.json" >/dev/null && pass "Determinismo: project.json"
diff -u "$A/context/STACK.md" "$B/context/STACK.md" >/dev/null && pass "Determinismo: context/STACK.md"

# ------------------------
# 10) Determinismo por normalización: mismo set owners distinto orden => mismo output
# ------------------------
section "10) Determinismo owners: @B,@A vs @A,@B => mismo output"
C="../audit-owners-c-${STAMP}"
D="../audit-owners-d-${STAMP}"
rm -rf "$C" "$D" || true

npm run cli -- wizard \
  --project-name "audit-owners-c-${STAMP}" \
  --stack node-ts \
  --profile Standard \
  --desc "owners" \
  --visibility public \
  --license MIT \
  --author "Owner Author" \
  --codeowners "@B,@A" >/dev/null

npm run cli -- wizard \
  --project-name "audit-owners-d-${STAMP}" \
  --stack node-ts \
  --profile Standard \
  --desc "owners" \
  --visibility public \
  --license MIT \
  --author "Owner Author" \
  --codeowners "@A,@B" >/dev/null

diff -u "$C/blueprint/project.json" "$D/blueprint/project.json" >/dev/null && pass "Owners determinismo: project.json"
diff -u "$C/CODEOWNERS" "$D/CODEOWNERS" >/dev/null && pass "Owners determinismo: CODEOWNERS"

section "DONE"
echo "Artefactos audit creados en ../audit-*-${STAMP}"
echo "Puedes borrar con: rm -rf ../audit-*-${STAMP}"
