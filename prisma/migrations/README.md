# Migrations

- `000000000000_init` is the **baseline**: generated from `schema.prisma` with
  `prisma migrate diff --from-empty`. It exactly matches the schema the live database already had
  via `prisma db push` (verified drift-free before baselining).
- The live DB was marked as applied with `npx prisma migrate resolve --applied 000000000000_init`
  — no DDL was run against production.
- `deploy.sh` now runs `npx prisma migrate deploy` instead of `db push`.

## Adding a schema change

1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <change>` against a DEV database (never production).
3. Commit the generated folder; deploy runs `migrate deploy` on production.
4. Keep changes additive where possible; destructive changes need a data-preservation plan.
