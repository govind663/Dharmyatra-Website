#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-$HOME/Desktop/Abhishek/React Projects/DivyaDhara-Website/divyadhara-website}"
BUNDLE_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "Project directory not found: $PROJECT_DIR" >&2
  exit 1
fi

cd "$PROJECT_DIR"

echo "[1/7] Installing SweetAlert2..."
npm install sweetalert2

echo "[2/7] Creating directories..."
mkdir -p server/routes src/lib src/pages

echo "[3/7] Backing up integration files..."
cp server/index.ts "server/index.ts.bak-pandit-$(date +%Y%m%d%H%M%S)"
cp src/App.tsx "src/App.tsx.bak-pandit-$(date +%Y%m%d%H%M%S)"

echo "[4/7] Copying Pandit module files..."
cp "$BUNDLE_DIR/server/routes/pandit.ts" server/routes/pandit.ts
cp "$BUNDLE_DIR/src/lib/panditApi.ts" src/lib/panditApi.ts
cp "$BUNDLE_DIR/src/lib/swal.ts" src/lib/swal.ts
cp "$BUNDLE_DIR/src/pages/PanditDashboard.tsx" src/pages/PanditDashboard.tsx

echo "[5/7] Registering Pandit API route..."
python3 - <<'PY'
from pathlib import Path
p = Path('server/index.ts')
s = p.read_text()

if 'import panditRoutes from "./routes/pandit.ts";' not in s:
    marker = 'import adminRoutes from "./routes/admin.ts";'
    if marker not in s:
        raise SystemExit('Could not find adminRoutes import in server/index.ts')
    s = s.replace(marker, marker + '\nimport panditRoutes from "./routes/pandit.ts";', 1)

if 'app.use("/api/pandit", panditRoutes);' not in s:
    marker = 'app.use("/api/admin", adminRoutes);'
    if marker not in s:
        raise SystemExit('Could not find admin route registration in server/index.ts')
    s = s.replace(marker, marker + '\napp.use("/api/pandit", panditRoutes);', 1)

p.write_text(s)
PY

echo "[6/7] Registering Pandit dashboard route..."
python3 - <<'PY'
from pathlib import Path
p = Path('src/App.tsx')
s = p.read_text()

if 'import PanditDashboard from "./pages/PanditDashboard";' not in s:
    marker = 'import AdminDashboard from "./pages/AdminDashboard";'
    if marker not in s:
        raise SystemExit('Could not find AdminDashboard import in src/App.tsx')
    s = s.replace(marker, marker + '\nimport PanditDashboard from "./pages/PanditDashboard";', 1)

route = '''<Route
  path="pandit/dashboard"
  element={
    <RequireRole roles={["pandit"]}>
      <PanditDashboard />
    </RequireRole>
  }
/>
'''

if 'path="pandit/dashboard"' not in s:
    marker = '<Route\n  path="admin/dashboard"'
    idx = s.find(marker)
    if idx == -1:
        raise SystemExit('Could not find admin dashboard route in src/App.tsx')
    s = s[:idx] + route + s[idx:]

p.write_text(s)
PY

echo "[7/7] Type-checking and building..."
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.node.json
npm run build

echo
echo "Pandit module integration completed."
echo "Route: /pandit/dashboard"
echo "API:   /api/pandit/*"
