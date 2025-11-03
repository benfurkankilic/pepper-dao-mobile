## Governance (Aragon) — Feature Specification

### Objective
Enable users to browse proposals, view details, and cast votes via Aragon SDK on Chiliz.

### Data
- Proposals: id, title, description, status, start/end, quorum, turnout, options, tally.
- User voting power at snapshot (if applicable by Aragon config).

### Integrations
- Aragon SDK (custom chain registration if needed for Chiliz 88888).
- Fallback: direct contract reads for proposals and manual vote tx encoding if SDK gaps occur.

### List View
- Cards: status chip (Active/Executed/Failed), time remaining, turnout bar, title.
- Filters: All / Active / Passed / Failed.

### Detail View
- Sections: description (rich text/links), options with progress bars, your voting power, timeline (created → end → executed).
- Actions: Cast vote (when connected, eligible, not closed).

### Voting Flow
1) Connect wallet and ensure chain = 88888.
2) Select option → confirm in wallet.
3) Show pending, then success or failure with explorer link.
4) Refresh tally and show “You voted X”.

### Acceptance Criteria
- Read-only works without wallet; voting gated by eligibility.
- Accurate status and time remaining; archive renders correctly.
- Clear pending/success/error states with retry when safe.

### Error Handling
- Ineligible (no voting power), already voted, proposal closed → disabled CTA with reason.
- RPC/SDK failures → informative banner + retry.

### Security
- Strict chain guard; display destination chain and contract addresses.
- Never craft tx to unknown addresses; verify ABI/function selectors.

### Telemetry
- `proposals_list_viewed` {filter}
- `proposal_detail_viewed` {id}
- `vote_cast_success` {id, option}
- `vote_cast_failure` {id, code}

### Performance
- Pagination / infinite scroll for proposals list.
- Cache proposal details; refetch on focus or after vote.

### Tests
- Proposal pagination, status transitions, countdown correctness.
- Vote eligibility logic and closed-state handling.
- Vote submission on correct chain; tally refresh post-confirmation.

### Dependencies
- Aragon SDK, Chiliz RPC 88888

### Out of Scope (MVP)
- Proposal creation from the app

### Future Enhancements
- Delegation flows (delegate/undelegate)
- Rich attachments (IPFS/Arweave) rendering


