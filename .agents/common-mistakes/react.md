# React Mistakes

### Fetching in multiple nested components without coordination

**Wrong:** each nested component fetches independently and causes waterfalls.

**Correct:** fetch at a higher boundary or parallelize requests with `Promise.all` in a server component.

**Why:** request waterfalls increase latency and make loading states harder to reason about.
