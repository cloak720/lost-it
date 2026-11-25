#!/usr/bin/env bash
# Runs once, when a Codespace is created:
#   1. installs the Python and React packages
#   2. writes backend/.env (pointing Flask at the MySQL container)
#   3. creates the database tables and the demo data + admin account
set -e
cd "$(dirname "$0")/.."

echo "📦 Installing Python packages..."
python -m pip install --user --quiet -r backend/requirements.txt

echo "📦 Installing React packages..."
(cd frontend && npm ci --no-fund --no-audit)

if [ ! -f backend/.env ]; then
  echo "📝 Writing backend/.env ..."
  # Use the ADMIN_PASSWORD Codespaces secret if you added one, otherwise make a random password.
  ADMIN_PW="${ADMIN_PASSWORD:-}"
  if [ -z "$ADMIN_PW" ]; then
    ADMIN_PW="admin-$(python -c 'import secrets; print(secrets.token_hex(4))')"
  fi
  cat > backend/.env <<EOF
MYSQL_HOST=db
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=lostit-dev
MYSQL_DATABASE=lost_it
SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')
ADMIN_NAME=${ADMIN_NAME:-admin1}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin1@campus.edu}
ADMIN_PASSWORD=$ADMIN_PW
EOF
fi

cd backend

echo "🗄️  Waiting for MySQL to start..."
for _ in $(seq 1 60); do
  if python -c "from db import connect; connect(use_database=False).close()" 2>/dev/null; then
    break
  fi
  sleep 2
done

# Only build the tables the first time, so a rebuilt Codespace keeps its data.
if python - 2>/dev/null <<'PY'
from db import connect
cur = connect().cursor()
cur.execute("SHOW TABLES LIKE 'users'")
raise SystemExit(0 if cur.fetchone() else 1)
PY
then
  echo "Database already set up, keeping existing data."
else
  python init_db.py
fi
python seed.py

echo ""
echo "✅ Lost-It is ready! The website opens on port 5173."
echo "   Students:  asha@campus.edu / rahul@campus.edu / fathima@campus.edu / arjun@campus.edu  (password: demo1234)"
echo "   Admin:     $(grep '^ADMIN_EMAIL=' .env | cut -d= -f2)  (password: $(grep '^ADMIN_PASSWORD=' .env | cut -d= -f2-))"
