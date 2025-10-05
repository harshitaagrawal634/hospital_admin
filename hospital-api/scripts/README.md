Create admin user (development)
================================

This folder contains helper scripts for development. Use the `createAdmin.js` script to create a local admin user if you haven't registered any users yet.

Usage (PowerShell):

```powershell
cd "C:\Users\HP\front+back hospital management\hospital-api"
# Optionally override defaults:
$env:CREATE_ADMIN_EMAIL = 'admin@local'
$env:CREATE_ADMIN_USERNAME = 'admin'
$env:CREATE_ADMIN_PASSWORD = 'Admin123!'
node scripts/createAdmin.js
```

Defaults used by the script when env vars are not provided:
- email: admin@local
- username: admin
- password: Admin123!

The script will not create a duplicate user if the email already exists.
