#!/bin/bash
# use only via npm run mig:generate <name>
npm run typeorm migration:generate -- ./apps/netweave-api/src/app/db/migrations/$1 -d ./apps/netweave-api/src/app/db/db.data-source.ts