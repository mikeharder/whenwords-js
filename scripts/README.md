# Performance History Scripts

## fetch-perf-history.js

This script fetches historical performance test results from GitHub Actions workflow runs and generates a JSON file for visualization.

### Prerequisites

- GitHub CLI (`gh`) must be installed and authenticated
- Run `gh auth login` to authenticate if needed

### Usage

```bash
# Fetch performance history from last 50 runs on main branch
pnpm run perf:fetch-history

# Or run directly
node scripts/fetch-perf-history.js
```

### Output

The script generates `web/perf-history.json` containing:

- Run ID and date for each workflow run
- Performance metrics (latency in nanoseconds) for each test case
- Data sorted chronologically (oldest to newest)

### Configuration

Edit `scripts/fetch-perf-history.js` to change:

- `MAX_RUNS`: Number of workflow runs to fetch (default: 50)
- `WORKFLOW_NAME`: Workflow file name (default: 'perf.yaml')
- `BRANCH`: Branch to fetch runs from (default: 'main')

## Automation

The `update-perf-charts.yaml` workflow automatically updates the performance history:

- Runs after each successful perf workflow on main
- Runs daily at 00:00 UTC
- Can be manually triggered via workflow_dispatch

The updated data is automatically deployed to GitHub Pages via the `pages.yaml` workflow.
