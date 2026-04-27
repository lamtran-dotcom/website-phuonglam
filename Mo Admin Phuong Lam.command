#!/bin/zsh

cd "$(dirname "$0")" || exit 1

ADMIN_URL="http://127.0.0.1:8000/admin-upload.html"
HEALTH_URL="http://127.0.0.1:8000/"
PID_FILE="/tmp/phuonglam_admin.pid"
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

# Kill server cu neu dang chay (de load lai code moi nhat)
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "Dang tat server cu (PID $OLD_PID) de khoi dong lai voi code moi nhat..."
    kill "$OLD_PID" 2>/dev/null
    sleep 0.5
  fi
  rm -f "$PID_FILE"
fi

# Tat theo port neu van con
if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
  RUNNING_PID=$(lsof -ti tcp:8000 2>/dev/null | head -1)
  if [ -n "$RUNNING_PID" ]; then
    echo "Tat process dang chiem port 8000 (PID $RUNNING_PID)..."
    kill "$RUNNING_PID" 2>/dev/null
    sleep 0.5
  fi
fi

# Mo browser khi server san sang
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

echo "======================================"
echo "  Phuong Lam Admin - Quan ly website"
echo "======================================"
echo "  URL: $ADMIN_URL"
echo "  De tat: dong cua so nay hoac Ctrl+C"
echo "======================================"
echo

"$NODE_BIN" tools/local_admin_server.js &
SERVER_PID=$!
echo $SERVER_PID > "$PID_FILE"
wait $SERVER_PID
rm -f "$PID_FILE"
