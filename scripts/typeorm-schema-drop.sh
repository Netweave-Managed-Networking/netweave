#!/bin/bash
# use only via npm run schema:drop
npm run typeorm schema:drop -- -d ./apps/netweave-api/src/app/db/db.data-source.ts
