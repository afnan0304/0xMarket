# Deployment Runbook Pack

## Preflight
- Confirm the release branch is green.
- Verify environment variables are present.
- Back up the current build artifacts.

## Release Steps
1. Deploy to staging first.
2. Smoke test login, checkout, and asset download.
3. Promote to production when the health probe passes.

## Rollback
- Restore the previous build artifact.
- Revert the last migration if one was applied.
- Clear any stale CDN cache entries.
