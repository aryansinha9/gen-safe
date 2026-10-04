#!/usr/bin/env bash
# Creates a test admin in the LOCAL Supabase (supabase start) and saves the login to .env.local.
# Local development only: uses Supabase's standard local service key.
set -euo pipefail
cd "$(dirname "$0")/.."

SERVICE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
EMAIL='admin@safegen.test'
if [ -f .env.local ] && grep -q '^LOCAL_TEST_PASSWORD=' .env.local; then
  PASSWORD=$(grep '^LOCAL_TEST_PASSWORD=' .env.local | cut -d= -f2)
else
  PASSWORD=$(openssl rand -base64 12 | tr -d '/+=')
  printf '# Local Supabase test login (local dev only)\nLOCAL_ADMIN_EMAIL=%s\nLOCAL_TEST_PASSWORD=%s\n' "$EMAIL" "$PASSWORD" > .env.local
fi

curl -s -o /dev/null -X POST http://127.0.0.1:54321/auth/v1/admin/users \
  -H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true}"
docker exec "supabase_db_$(basename "$PWD")" psql -U postgres -qc \
  "insert into public.admins (user_id) select id from auth.users where email = '$EMAIL' on conflict do nothing;"
echo "Local admin ready: $EMAIL (password in .env.local)"
