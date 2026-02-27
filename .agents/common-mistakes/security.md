# Security Mistakes

### Accepting unvalidated input at external boundaries

**Wrong:** use request payloads directly in database queries or third-party API calls.

**Correct:** validate and narrow input schemas first (for example with Zod), then pass validated data downstream.

**Why:** input validation at boundaries prevents injection and malformed payload bugs.
