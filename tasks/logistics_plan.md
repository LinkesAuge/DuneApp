# Logistics System – Detailed Implementation Plan

> Status: **PLANNING**  
> Last updated: {{DATE}}

This document converts the approved high-level architecture into concrete, ordered tasks.  Each task block lists its goal, requirements that must be satisfied, deliverables, and notes on testing/acceptance.

---

## 🔍 Code-Level Breakdown

Below each phase is exploded into concrete engineering tasks with file names, migration stubs, and test hooks.  Use these as the authoritative TODO list when opening PRs.

### PHASE-0  •  Foundations & Prep  
_(branch name suggestion: `logistics/phase0-foundations`)_

| # | Task | Code Artifacts |
|---|------|----------------|
|0.1| **Audit existing DB** – verify `entities` columns (`id,name,is_schematic,tier,icon_url`) | none – add notes to `docs/technical.md#entities`
|0.2| **Extend profiles** – add `logistics_role` ENUM | migration: `supabase/migrations/20250701_add_logistics_role.sql`  
  • `ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'CLO';` (repeat for LA, NONE)  
  • Update RLS in `supabase/policies/profiles.update.sql`
|0.3| **Seed data** – set existing admins to CLO | same migration file: simple `UPDATE profiles SET logistics_role='CLO' WHERE is_admin=true;`

Unit-Test: pgTAP `tests/00_foundations.sql` asserting new column exists & ENUM values present.

---

### PHASE-1  •  Database Schema & Security  
_(branch: `logistics/phase1-schema`)_

#### 1.1  Core Tables
Create single migration `20250702_logistics_core_tables.sql` containing **exact DDL**.  Skeleton:
```sql
CREATE TABLE bases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_global_stock BOOLEAN NOT NULL DEFAULT FALSE,
  created_by uuid REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- repeat for other tables
```
Specifics:
• `inventories.qty` NUMERIC(12,2)  – precision chosen over BIGINT for potential decimals.  
• `status` columns use domain types:  
  `CREATE TYPE task_status AS ENUM('pending','active','claimed','fulfilled','completed','cancelled');`

#### 1.2  RLS Policies
Policies live under `supabase/policies/logistics/`.  One file per table; each file defines policy for `SELECT`, `INSERT`, `UPDATE`, `DELETE` (where applicable).  Example pattern for `inventories`:
```sql
CREATE POLICY select_inventories ON inventories FOR SELECT USING ( true );
CREATE POLICY update_inventories_la ON inventories FOR UPDATE USING (
  auth.jwt()->>'logistics_role' IN ('LA','CLO')
);
```
Include `tests/10_rls_inventories.sql` verifying access matrix via pgTAP roles.

#### 1.3  DB Functions
Directory `supabase/functions/sql/`:
* `verify_delivery.sql` (SECURITY DEFINER) – wraps all logic, returns JSON `{success bool, updated_rows int}`
* `fulfil_task.sql`
* `zero_inventory.sql`
* Trigger function `log_event()` – attached via `AFTER INSERT OR UPDATE OR DELETE` on core tables.

Tests: `tests/20_functions.sql` call each function under different roles.

---

### PHASE-2  •  Backend Edge Functions  
_(branch: `logistics/phase2-edge`)_

| Endpoint | File | HTTP Verb | Notes |
|----------|------|-----------|-------|
| `/logistics/delivery/:id/verify` | `supabase/functions/verify_delivery/index.ts` | POST | Body: `{adjustments: DeliveryLineInput[]}` |
| `/logistics/task/:id/fulfil` | `supabase/functions/fulfil_task/index.ts` | POST | |
| `/logistics/inventory/zero` | `supabase/functions/zero_inventory/index.ts` | POST | CLO only |

Edge function template includes:
```ts
import { serve } from 'std/server'
import { verifyDelivery } from './lib/db';
serve(async (req) => { /* ... */ });
```

Unit tests: Vitest in `functions/tests/*.test.ts` hitting local supabase emulator.

---

### PHASE-3  •  Web Front-End  
_(branch: `logistics/phase3-web`)_

1. **Routing**: update `src/routes.tsx` – lazy-load `LogisticsPage`.
2. **Layout**: `src/pages/logistics/LogisticsPage.tsx` – Shell + `<Sidebar /> <Outlet/>`.
3. **Sidebar**: `Sidebar.tsx` – drag-and-drop ordering with `@dnd-kit/core` – persist via PATCH `/bases/order`.
4. **Tabs**:
   * InventoryTab.tsx  – uses `DataTable` component; editable cells component `QuantityCellEditor.tsx`.
   * TasksTab.tsx  – `TaskRow.tsx` with `<JoinButton/>`.
   * SettingsPage.tsx – `<EntityLowStockTable/>` connecting to `entity_settings`.
5. **Realtime Hook**: `useLogisticsEvents.ts` subscribes via `supabase.channel('logistics_events')`.
6. **Global Overview** pages placed under `src/pages/logistics/overview/`.

Storybook stories for new components in `stories/logistics/`.

---

### PHASE-4  •  Discord Bot  
_(branch: `logistics/phase4-bot`)_

Code lives in `discord-bot/` (already part of repo).

1. **Command Registry** update `commands/index.ts` – add new slash commands.
2. **Command Handlers** under `commands/logistics/*` mapping to Edge endpoints.
3. **SSE Listener** `services/eventFeed.ts` – uses `eventsource-parser` to stream events.
4. **Role Sync** script in `scripts/syncRoles.ts`.
5. Integration tests with `jest` + `discord.js-mock`.

---

### PHASE-5  •  Snapshots & Analytics  
_(branch: `logistics/phase5-analytics`)_

1. Chart component `InventoryTrendChart.tsx` using `recharts`.
2. Low-stock banner `LowStockAlert.tsx`.
3. Cron job script `aggregate_snapshot_weeks.sql`.

---

### PHASE-6  •  QA, CI & Deployment

* Extend GitHub Actions: 
  * `ci-sql.yml` – run pgTAP tests against supabase docker.
  * `ci-web.yml` – lint + Cypress.
  * `ci-functions.yml` – type-check Edge functions.
* Release checklist in `RELEASE.md`.

---

## 📋 Acceptance Matrix
| Feature | Unit Tests | E2E Tests | Manual Checklist |
|---------|------------|-----------|------------------|
| RLS | ✅ | – | – |
| Delivery Verification | ✅ | ✅ | Inventory updated correctly |
| Low-Stock Alert | ✅ | ✅ | Discord embed fired |
| Settings Page | – | ✅ | Values persist & affect alerts |

---

## Next Immediate Tasks
1. Draft and commit `20250702_logistics_core_tables.sql` migration.  
2. Write pgTAP tests for RLS skeleton.  
3. Prototype `verify_delivery` PL/pgSQL function.

---

## Retention / Cleanup Rules
* Snapshots older than 14 days aggregated and raw rows deleted.
* `logistics_events` older than 90 days archived to cold storage.

---

## Non-Goals for MVP
* Bulk toggle of low-stock alerts.
* Template Tasks.
* CSV/JSON export.
* Kanban display.
* Base-merge tool.

---

## Open Risks / TODOs Before Coding
1. Confirm naming conventions (singular vs plural) in existing DB.
2. Decide on numeric precision for quantities (NUMERIC vs BIGINT).
3. Determine if we need soft-delete (`deleted_at`) instead of hard delete.
4. Align colour tokens & icons for new UI pages with Dune theme.

---

_End of plan._ 