# Talk With Vince — Queue System

A simple two-column queue board backed by Supabase.

- **`index.html`** — the public **display board** (e.g. on a TV). Read-only. Auto-refreshes
  from Supabase every ~2.5s and rings a bell when someone is newly called. No input controls.
- **`queue_input.html`** — the **operator control panel** (use on a phone/laptop). Add names,
  call them, send them back, remove them, and clear everyone served.
- **`config.js`** — the one file you edit: Supabase URL, anon key, table name, poll interval.
- **`supabase.js`** — shared data helpers (plain `fetch`, no libraries).

The data lives in the Supabase table **`talkwithvince`** with columns `id`, `name`, and
`serving` (a **boolean**: `false` = in queue, `true` = now serving).

---

## ⚠️ Required one-time setup (writes won't work without this)

The table has Row Level Security (RLS) enabled but **no policy allowing writes**, so adding or
moving names is blocked until you add one. The control page will show
*"Write blocked by Supabase…"* until you do this.

1. Open your Supabase project → **SQL Editor** → **New query**.
2. Paste and **Run**:

   ```sql
   -- Internal/trusted use: allow the public anon key full read+write on this table.
   alter table talkwithvince enable row level security;  -- already on; harmless to repeat
   create policy "anon full access" on talkwithvince
     for all to anon using (true) with check (true);
   ```

3. Reload `queue_input.html` and add a name — it should work immediately.

> **Note on security:** this gives anyone with the page (and therefore the anon key) full
> read/write on the table. That's fine for an internal/trusted screen on a private network,
> which is the chosen setup. If this board ever becomes public-facing, harden it (read-only
> anon key for the board + writes behind a Supabase Edge Function). **Never** put the database
> password or the `service_role` key in any of these browser files.

---

## Running it

These are plain static files — no build step.

- **Simplest:** double-click `index.html` / `queue_input.html` to open them in a browser
  (works directly from `file://` because Supabase allows cross-origin requests).
- **Or serve them** (lets a TV and a phone reach the same address on your network):

  ```powershell
  python -m http.server 8000
  ```

  Then open `http://<this-computer-ip>:8000/` (board) and
  `http://<this-computer-ip>:8000/queue_input.html` (control) on any device on the network.

### Enabling the bell on the TV
Browsers block audio until someone interacts with the page. When you open the board, tap the
**"Tap anywhere to enable sound"** overlay once. If the TV browser reloads, tap it again.

---

## Changing settings
Edit **`config.js`**:
- `SUPABASE_ANON` — the anon **public** key from Supabase → Project Settings → API (not the DB password).
- `POLL_INTERVAL_MS` — how often the pages refresh (default 2500 ms).
