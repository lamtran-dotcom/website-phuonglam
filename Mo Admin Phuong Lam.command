#!/bin/zsh

cd "$(dirname "$0")" || exit 1

ADMIN_URL="http://127.0.0.1:8000/admin-upload.html"
HEALTH_URL="http://127.0.0.1:8000/"
LOCAL_NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"

if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
elif [ -x "$LOCAL_NODE" ]; then
  NODE_BIN="$LOCAL_NODE"
else
  echo "Khong tim thay Node.js de chay admin local."
  echo "Hay cai Node.js hoac bao Codex kiem tra lai moi truong may."
  echo
  read "?Nhan Enter de dong cua so..."
  exit 1
fi

if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
  echo "Admin local dang chay san. Dang mo trang admin..."
  open "$ADMIN_URL"
  exit 0
fi

(
  for i in {1..40}; do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      open "$ADMIN_URL"
      exit 0
    fi
    sleep 0.25
  done
  open "$ADMIN_URL"
) &

echo "Dang khoi dong admin local..."
echo "Neu muon tat admin local, dong cua so Terminal nay hoac bam Ctrl+C."
echo

"$NODE_BIN" tools/local_admin_server.js
