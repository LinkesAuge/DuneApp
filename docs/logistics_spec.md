# Logistics System – Functional Specification

_Last updated: {{DATE}}_

## 1. Purpose
Provide guild-level tooling to track base inventories, manage resource tasks, record deliveries and integrate the workflow with a Discord bot.

## 2. Domain Glossary
| Term | Meaning |
|------|---------|
| **Base / Outpost** | Physical location players maintain; owns its own inventory, tasks, deliveries. |
| **Inventory Row** | Tuple *(base_id, entity_id, qty)* indicating how many of an entity are stored at the base. |
| **Task** | Request for materials. Can be open-ended or have a target quantity. |
| **Participant** | Player who "joins" a task to signal they are working on it. Multiple allowed. |
| **Delivery** | Player-reported hand-in of materials. Requires verification. |
| **Fee** | % of delivered amount retained by the guild. Uses default global value unless task overrides. |
| **Low-stock Alert** | Optional per-entity threshold. If enabled and qty < threshold, alert event fired. |

## 3. Roles & Permissions
| Role | CRUD Bases | CRUD Tasks | CRUD Deliveries | Adjust Inventory | Delete Anything | Settings |
|------|-----------|-----------|-----------------|------------------|-----------------|----------|
| **CLO** | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| **LA** | ─ | ✔ (no delete) | ✔ (no delete) | ✔ | ─ | ─ |
| **Member** | ─ | Create, join | Create | ─ | ─ | ─ |

Roles are stored in `profiles.logistics_role` with values **CLO**, **LA**, **NONE**.

## 4. Data Model Overview
```
bases 1───n inventories n──1 entities
bases 1───n tasks 1───n task_participants
bases 1───n deliveries 1───n delivery_lines
```
Full DDL lives in migration `20250702_logistics_core_tables.sql`.

## 5. Workflow Lifecycles
### Task State Machine
```
[pending] ->(approved) [active] ->(join) [claimed] ->(all items delivered) [fulfilled] ->(verified) [completed]
                                            |->(cancel) [cancelled]
```
* Quantities editable at any state (audit trail recorded).
* Delete allowed only for CLO.

### Delivery State Machine
```
[reported] ->(verify) [verified]
```
* Verification calls `verify_delivery()` which may adjust quantities and updates inventory (unless override box unchecked).

## 6. Business Rules
1. **Fee logic**  
   * Global default fee stored in `logistics_settings.default_fee_pct`.  
   * Task-specific `fee_pct` overrides default.  
   * Fee quantity = `target_qty * fee_pct`.  
   * Fee retained in a hidden "Global Stock" base (`bases.is_global_stock = TRUE`).
2. **Low-stock**  
   * Configured per entity in `entity_settings`.  
   * pg_cron job `low_stock_scan` emits event if `inventories.qty < threshold`.
3. **Snapshots & Retention**  
   * Nightly job `daily_snapshot` saves JSON of each base inventory.  
   * Keep 14 days; older rolled into weekly aggregates.
4. **Unique Entities**  
   * `entities.is_schematic = TRUE` ⇒ capped to qty ≤ 1 everywhere.

## 7. Discord Integration
### Slash Commands (prefix `/logi`)
| Command | Description |
|---------|-------------|
| `base list` | List bases. |
| `inv show <base>` | Show inventory table. |
| `task new <base> <entity> <qty> [fee]` | Create task (member). |
| `task join <taskId>` | Join task. |
| `task done <taskId> [qty]` | Mark deliverable quantities (member). |
| `delivery report <base>` | Interactive modal for multi-entity delivery. |
| `delivery verify <id>` | LA/CLO verify. |
| `fee pay <taskId> <member> <entity> <qty>` | Record fee payout. |
| `role sync` | Admin-only, sync Discord roles to `logistics_role`. |

Bot consumes SSE feed of `logistics_events` and posts embeds on:
* Task fulfilled / completed
* Delivery verified
* Low-stock alert
* Inventory zeroed

## 8. Q&A / Decision Log
| # | Question | Decision |
|---|----------|----------|
|1| Multi-guild needed? | **No** – single guild only. |
|2| Quantity units? | Single numeric qty; uniqueness handled via `is_schematic`. |
|3| LA vs CLO difference? | CLO may delete anything; LA may edit but not delete. |
|4| Fee defaults? | Global default + per-task override, enabled via checkbox. |
|5| Claim wording? | "Join Task" chosen for UX and commands. |
|6| Zero inventory? | CLO-only button, audited. |
|7| Snapshot retention? | 14 days raw, weekly aggregates afterwards. |
|8| Low-stock threshold config? | Per entity, optional; managed on Settings page. |
|9| Fee payouts per participant? | Yes – individual `fee_payments` rows, no inventory impact. |
|10| Bulk toggle for low-stock? | Not required MVP. |

## 9. Open Risks / Pending Tasks
* Decide NUMERIC vs BIGINT precision for `qty`.  
* Evaluate soft-delete vs hard-delete for audit purists.

---
_This spec should be kept in sync with `tasks/logistics_plan.md` implementation plan._ 