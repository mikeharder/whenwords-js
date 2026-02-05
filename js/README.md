# whenwords for JavaScript

Human-friendly time formatting and parsing for JavaScript.

## Overview

This is the JavaScript implementation of the [whenwords](https://github.com/dbreunig/whenwords) library. It provides five core functions for working with time in a human-friendly way:

- **timeago** — Converts timestamps to relative time strings ("3 hours ago", "in 2 days")
- **duration** — Formats seconds as human-readable durations ("1 hour, 30 minutes" or "1h 30m")
- **parseDuration** — Parses duration strings like "2h 30m" into seconds
- **humanDate** — Returns contextual date strings ("Today", "Yesterday", "Last Tuesday")
- **dateRange** — Formats smart date ranges ("March 5–7, 2024")

## Installation

### Setup pnpm (one-time)

This project uses [pnpm](https://pnpm.io/) via [corepack](https://nodejs.org/api/corepack.html).

```bash
# Enable corepack
corepack enable
```

Then install dependencies:

```bash
pnpm install
```

## Quick Start

```javascript
import {
  timeago,
  duration,
  parseDuration,
  humanDate,
  dateRange,
} from './index.js';

const now = Math.floor(Date.now() / 1000);
const yesterday = now - 86400;

console.log(timeago(yesterday, now)); // "1 day ago"
console.log(duration(3661)); // "1 hour, 1 minute"
console.log(parseDuration('2h 30m')); // 9000
console.log(humanDate(yesterday, now)); // "Yesterday"
```

## Documentation

For complete API documentation, examples, and error handling details, see **[usage.md](usage.md)**.

## Interactive Playground

Try out the library in your browser with the **[interactive playground](web/index.html)**. The playground demonstrates all five APIs with live, working examples including:

- Relative time formatting with `timeago()`
- Duration formatting with `duration()` (compact mode, max units)
- Parsing duration strings with `parseDuration()`
- Contextual dates with `humanDate()`
- Smart date ranges with `dateRange()`

To use the playground locally, serve the `js` directory with any HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js http-server
npx http-server

# Then open http://localhost:8000/web/index.html
```

## Development

```bash
# Run tests
pnpm test

# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Run all checks
pnpm run check
```

## Specification Compliance

This implementation follows the [whenwords specification](../spec/SPEC.md) and passes all tests defined in [tests.yaml](../spec/tests.yaml).
