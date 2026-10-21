# Security update, 2026-10-21

Pin Node.js 22.23.4 and upgrade Next.js 14 to patched 15.5.28. Upgrade Firebase client to 13.1.0 and Admin to 14.5.0, refresh compatible dependencies and constrain PostCSS and gRPC to patched releases. Commit a lockfile so the reviewed dependency graph can be reproduced with npm ci.

Validation: npm audit reports zero vulnerabilities, down from 20 after the initial compatible patch pass. The production build and TypeScript validation pass. Firebase and Supabase requests against live accounts were not exercised. These Firebase major updates need integration acceptance before production deployment.

No deployment performed.
