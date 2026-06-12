#!/bin/bash
# use only via npm run mig:revert
npm run typeorm migration:revert -- -d ./apps/netweave-api/src/app/db/db.data-source.ts