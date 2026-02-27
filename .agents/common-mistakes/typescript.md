# TypeScript Mistakes

### Using `any` instead of typed payloads

**Wrong:**

```ts
function process_data(payload: any) {
  return payload.items.map((item: any) => item.name)
}
```

**Correct:**

```ts
interface ItemPayload {
  items: Array<{ name: string; id: string }>;
}

function process_data(payload: ItemPayload) {
  return payload.items.map((item) => item.name);
}
```

**Why:** `any` disables compile-time guarantees and hides runtime failures.
