// ============================================================================
//  Talk With Vince — shared Supabase helpers (plain fetch, no libraries)
//  Loaded AFTER config.js by both index.html and queue_input.html.
//  Serving status is a BOOLEAN column: false = "in queue", true = "now serving".
//  (Callers may pass 0/1; it is coerced to a boolean before sending.)
// ============================================================================

const REST = `${SUPABASE_URL}/rest/v1/${TABLE}`;

const HEADERS = {
  apikey: SUPABASE_ANON,
  Authorization: "Bearer " + SUPABASE_ANON,
  "Content-Type": "application/json",
};

// Read every row in one snapshot, ordered oldest-first (FIFO by primary key).
// A single read means a row can never appear in both lists due to a race
// between two separate requests.
async function fetchRows() {
  const res = await fetch(`${REST}?select=id,name,serving&order=id.asc`, {
    headers: HEADERS,
    cache: "no-store",
  });
  if (!res.ok) throw new Error("read failed: HTTP " + res.status);
  return res.json();
}

// Add a new customer to the queue (serving = false).
async function addCustomer(name) {
  const res = await fetch(REST, {
    method: "POST",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify({ name: name, serving: false }),
  });
  if (!res.ok) throw new Error("add failed: HTTP " + res.status);
}

// Move a customer between states: setServing(id, 1) = call, setServing(id, 0) = send back.
// value is coerced to a boolean to match the column type.
async function setServing(id, value) {
  const res = await fetch(`${REST}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify({ serving: !!value }),
  });
  if (!res.ok) throw new Error("update failed: HTTP " + res.status);
}

// Rename a single row (used internally by reorderNames).
async function updateName(id, name) {
  const res = await fetch(`${REST}?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...HEADERS, Prefer: "return=minimal" },
    body: JSON.stringify({ name: name }),
  });
  if (!res.ok) throw new Error("reorder failed: HTTP " + res.status);
}

// Reorder the queue by rotating NAMES across rows. Display order is fixed
// (id asc, no position column), so moving a name from one slot to another
// means every row between the two slots takes the next name over. rows must
// be the queue rows in display order. If a write fails partway, the rows
// already renamed are reverted so no name is lost or duplicated.
async function reorderNames(rows, from, to) {
  if (from === to) return;
  const names = rows.map(r => r.name);
  const [moved] = names.splice(from, 1);
  names.splice(to, 0, moved);
  const changed = [];
  try {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].name !== names[i]) {
        await updateName(rows[i].id, names[i]);
        changed.push(i);
      }
    }
  } catch (e) {
    for (const i of changed) {
      try { await updateName(rows[i].id, rows[i].name); } catch (_) {}
    }
    throw e;
  }
}

// Remove a single customer entirely.
async function removeRow(id) {
  const res = await fetch(`${REST}?id=eq.${id}`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error("delete failed: HTTP " + res.status);
}

// Remove everyone currently being served (end-of-session cleanup).
// The serving=eq.true filter is required — PostgREST rejects an unfiltered DELETE.
async function clearServed() {
  const res = await fetch(`${REST}?serving=eq.true`, {
    method: "DELETE",
    headers: HEADERS,
  });
  if (!res.ok) throw new Error("clear failed: HTTP " + res.status);
}
