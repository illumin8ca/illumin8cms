#!/bin/bash
# This script deletes all admin users from the D1 database to force the setup wizard.

set -e

DB_NAME="illumin8cms_db" # Change this to your actual D1 database name if different

echo "Deleting all admin users from D1 database: $DB_NAME..."
npx wrangler d1 execute $DB_NAME --command "DELETE FROM users WHERE role = 'admin';"
echo "All admin users deleted. Reload the admin UI to see the setup wizard." 