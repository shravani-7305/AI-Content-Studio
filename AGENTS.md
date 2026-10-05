<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Agent rules
- AI calls go through `src/lib/ai-service.ts` only — so swapping demo output for a real AI API touches one file.
- Persistence (history, user) goes through `src/lib/store.ts` — localStorage now, replaceable by a database without UI changes.
- App chrome (sidebar nav) lives in `src/components/app-shell.tsx`, rendered by `__root.tsx` around the Outlet.
