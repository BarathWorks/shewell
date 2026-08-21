# Why `regions` is pinned

Functions run in **bom1** (Mumbai).

This must match the database region. Measured from a machine in India against the
current Supabase project in `ap-southeast-2` (Sydney):

- **333 ms** just to open a TCP connection
- **~790 ms** for a bare `SELECT 1`

A page issuing a handful of sequential queries therefore spends *seconds* waiting on
the network alone, before any real work happens.

`bom1` is correct once the database is also in `ap-south-1` (Mumbai). If the database
stays in Sydney, change this to `syd1` so the functions sit next to it instead — what
matters is that the two are in the same place, not which place.
