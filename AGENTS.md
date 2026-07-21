<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

PERSISTENT RULES FOR THIS PROJECT — DO NOT MODIFY WITHOUT EXPLICIT INSTRUCTION

1. This project is called Planet Sorted. The product is Sorted Lab. Never use "SOR7ED", "sor7ed", or "GET IT SOR7ED" anywhere in generated code, copy, or comments. The CTA button is always labelled "GET IT SORTED".

2. The single source of truth for all naming, branding, database schema, and command structure is docs/planet-sorted-master.md. Read it before every task.

3. Categories use the one-word taxonomy: Mind, Wealth, Body, Tech, Connection, Impression, Growth. These are stored in a column called `category`. Never use the column name `branch`. Never use the descriptive names Keep Going, Spend Smart, Feel Good, Plan Ahead, Be Connected, Be Yourself, Level Up as database values or code structure.

4. Auth is magic link only. No passwords anywhere in the codebase.

5. Once created, the following 8 files are final and immutable. Never modify, rewrite, overwrite, or refactor them unless explicitly told to:
   - lib/whatsapp/crisis.ts
   - lib/whatsapp/parseCommand.ts
   - lib/whatsapp/send.ts
   - app/api/whatsapp/webhook/route.ts
   - components/buttons/GetSortedButton.tsx
   - components/SaveToPhoneButton.tsx
   - app/api/save-to-phone/route.ts
   - app/api/cron/sync-notion/route.ts

6. Build one thing at a time. Stop and confirm after every task. Never proceed to the next task without being asked.

7. Never expose raw error codes to users. All user-facing errors must be plain English.

8. planetsorted.com is the primary domain. Never use sor7ed.com as a primary URL in any code or copy.
