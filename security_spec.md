# Security Specification - CrazyGuiscripts

## Data Invariants
1. **User Profiles**: Every user can only manage their own profile. email_verified must be true for most writes.
2. **Scripts**: Scripts belong to their author (authorId). Only the author or an admin can update or delete them.
3. **Ratings**: A user can only rate a script once (or overwrite their existing rating). Ratings must be between 1 and 5.
4. **Admins**: Admin list is controlled by existing admins or hardcoded safe emails for initial setup.
5. **Executors & Config**: Only admins can manage these.

## The "Dirty Dozen" Payloads (Denial Expected)

1. **Identity Spoofing (Scripts)**: Create a script with `authorId` pointing to another user.
2. **State Shortcutting (Scripts)**: Update a script's `isPremium` status as a normal user.
3. **Resource Poisoning (IDs)**: Use a 1.5KB string as a script document ID.
4. **Shadow Update (Config)**: Add a `maliciousField: true` to the site config.
5. **PII Leakage (Users)**: Reading `users/{userId}` as a non-authenticated user (profiles should be private or explicitly public).
6. **Query Scraping (Scripts)**: Listing all scripts without authentication (if restricted).
7. **Relational Orphan (Ratings)**: Rate a script that doesn't exist.
8. **Rating Injection**: Setting a rating of 99.
9. **Admin Escalation**: Create a document in `/admins/` as a normal user.
10. **Timestamp Fraud**: Setting `createdAt` to a future date instead of `request.time`.
11. **Immutability Breach**: Changing `authorId` on a script update.
12. **Ghost Field Update**: Updating a script and adding `verified: true`.

## Test Runner (Draft Plan)
A `firestore.rules.test.ts` would be used in a local emulator environment to verify these. Since we are in AI Studio, we rely on the Red Team Audit and `firestore.rules` hardening.
