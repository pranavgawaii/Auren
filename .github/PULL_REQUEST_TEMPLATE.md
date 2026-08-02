## Summary

<!-- What does this PR do? One paragraph. -->

## Motivation

<!-- Why is this change needed? Link to the issue it closes if applicable. -->

Closes #

## Changes

<!-- List the files changed and what each change does. -->

- 
- 

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Security fix (addresses a vulnerability — tag a maintainer)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation / chore (no runtime behavior change)

## Testing

<!-- How did you test this change? -->

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run lint` passes
- [ ] Tested manually in a local dev environment
- [ ] Screenshots attached (for UI changes)

## Security checklist (for any change touching auth, DB, or webhooks)

- [ ] No hardcoded secrets, user IDs, or API keys
- [ ] No `DEMO_USER_ID` in database writes — using `await getUserId()` instead
- [ ] No client-supplied `userId` trusted in Server Actions
- [ ] Input is validated before use in database queries or regex
- [ ] Error messages don't expose internal stack traces to the client

## Screenshots / recordings (if applicable)

<!-- Drag and drop images or videos here -->
