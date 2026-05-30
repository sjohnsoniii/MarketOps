# MarketOps Review Queue QA Report v0.1

Generated: 2026-05-29T19:51:11.796Z

**Result:** PASS
**Checks Passed:** 105 / 105

## Check Details

| Check | Passed | Detail |
|---|---|---|
| Queue JSON exists | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/review/review-queue-v0.1.json |
| Events JSON exists | PASS | /home/sjohnsoniii/Projects/MarketOps/Data/review/review-events-v0.1.json |
| Queue JSON is valid | PASS | Parsed successfully |
| Events JSON is valid | PASS | Parsed successfully |
| Queue has schema field | PASS | review-queue-v0.1 |
| Queue has proposals array | PASS | object |
| Queue has metadata object | PASS | object |
| Queue metadata has totalProposals | PASS | 5 |
| Proposal prop-risk-001 is valid | PASS | Valid |
| Proposal prop-risk-001 autoApply is false | PASS | false |
| Proposal prop-risk-001 reviewHistory is array | PASS | object |
| Proposal prop-risk-002 is valid | PASS | Valid |
| Proposal prop-risk-002 autoApply is false | PASS | false |
| Proposal prop-risk-002 reviewHistory is array | PASS | object |
| Proposal rec-risk-002 is valid | PASS | Valid |
| Proposal rec-risk-002 autoApply is false | PASS | false |
| Proposal rec-risk-002 reviewHistory is array | PASS | object |
| Proposal rec-risk-003 is valid | PASS | Valid |
| Proposal rec-risk-003 autoApply is false | PASS | false |
| Proposal rec-risk-003 reviewHistory is array | PASS | object |
| Proposal rec-risk-001 is valid | PASS | Valid |
| Proposal rec-risk-001 autoApply is false | PASS | false |
| Proposal rec-risk-001 reviewHistory is array | PASS | object |
| Pending proposals list works | PASS | Found 2 pending |
| listByStatus returns object | PASS | object |
| listByStatus count matches total | PASS | 5 === 5 |
| Queue does not reference sj3labs paths | PASS | No sj3labs references in queue |
| No NaN/Infinity in queue | PASS | All finite |
| No secrets in queue | PASS | API key: false, Secret key: false, Password: false |
| Events has schema field | PASS | review-events-v0.1 |
| Events has events array | PASS | object |
| Event evt-1779243165159-8kdlcm has eventId | PASS | evt-1779243165159-8kdlcm |
| Event evt-1779243165159-8kdlcm has action | PASS | imported |
| Event evt-1779243165159-8kdlcm has actorId | PASS | system |
| Event evt-1779243165159-8kdlcm has createdAt | PASS | 2026-05-20T02:12:45.159Z |
| Event evt-1779243165159-8kdlcm has previousStatus | PASS | null |
| Event evt-1779243165159-8kdlcm has newStatus | PASS | pending_review |
| Event evt-1779243165159-mvpaq3 has eventId | PASS | evt-1779243165159-mvpaq3 |
| Event evt-1779243165159-mvpaq3 has action | PASS | imported |
| Event evt-1779243165159-mvpaq3 has actorId | PASS | system |
| Event evt-1779243165159-mvpaq3 has createdAt | PASS | 2026-05-20T02:12:45.159Z |
| Event evt-1779243165159-mvpaq3 has previousStatus | PASS | null |
| Event evt-1779243165159-mvpaq3 has newStatus | PASS | pending_review |
| Event evt-1779243165159-agsgqb has eventId | PASS | evt-1779243165159-agsgqb |
| Event evt-1779243165159-agsgqb has action | PASS | imported |
| Event evt-1779243165159-agsgqb has actorId | PASS | system |
| Event evt-1779243165159-agsgqb has createdAt | PASS | 2026-05-20T02:12:45.159Z |
| Event evt-1779243165159-agsgqb has previousStatus | PASS | null |
| Event evt-1779243165159-agsgqb has newStatus | PASS | pending_review |
| Event evt-1779243165159-wefdm0 has eventId | PASS | evt-1779243165159-wefdm0 |
| Event evt-1779243165159-wefdm0 has action | PASS | imported |
| Event evt-1779243165159-wefdm0 has actorId | PASS | system |
| Event evt-1779243165159-wefdm0 has createdAt | PASS | 2026-05-20T02:12:45.159Z |
| Event evt-1779243165159-wefdm0 has previousStatus | PASS | null |
| Event evt-1779243165159-wefdm0 has newStatus | PASS | pending_review |
| Event evt-1779243172860-oolk8o has eventId | PASS | evt-1779243172860-oolk8o |
| Event evt-1779243172860-oolk8o has action | PASS | approve |
| Event evt-1779243172860-oolk8o has actorId | PASS | sam |
| Event evt-1779243172860-oolk8o has createdAt | PASS | 2026-05-20T02:12:52.860Z |
| Event evt-1779243172860-oolk8o has previousStatus | PASS | pending_review |
| Event evt-1779243172860-oolk8o has newStatus | PASS | approved_by_admin |
| Event evt-1779243177065-cjc1ct has eventId | PASS | evt-1779243177065-cjc1ct |
| Event evt-1779243177065-cjc1ct has action | PASS | reject |
| Event evt-1779243177065-cjc1ct has actorId | PASS | sam |
| Event evt-1779243177065-cjc1ct has createdAt | PASS | 2026-05-20T02:12:57.065Z |
| Event evt-1779243177065-cjc1ct has previousStatus | PASS | pending_review |
| Event evt-1779243177065-cjc1ct has newStatus | PASS | rejected_by_admin |
| Event evt-1779243177704-n9ue16 has eventId | PASS | evt-1779243177704-n9ue16 |
| Event evt-1779243177704-n9ue16 has action | PASS | try_again |
| Event evt-1779243177704-n9ue16 has actorId | PASS | sam |
| Event evt-1779243177704-n9ue16 has createdAt | PASS | 2026-05-20T02:12:57.704Z |
| Event evt-1779243177704-n9ue16 has previousStatus | PASS | pending_review |
| Event evt-1779243177704-n9ue16 has newStatus | PASS | needs_revision |
| Event evt-1780063279046-s2hdnw has eventId | PASS | evt-1780063279046-s2hdnw |
| Event evt-1780063279046-s2hdnw has action | PASS | imported |
| Event evt-1780063279046-s2hdnw has actorId | PASS | system |
| Event evt-1780063279046-s2hdnw has createdAt | PASS | 2026-05-29T14:01:19.046Z |
| Event evt-1780063279046-s2hdnw has previousStatus | PASS | null |
| Event evt-1780063279046-s2hdnw has newStatus | PASS | pending_review |
| No NaN/Infinity in events | PASS | All finite |
| Empty queue has 0 proposals | PASS | Empty |
| Empty queue schema correct | PASS | review-queue-v0.1 |
| Empty events has 0 events | PASS | Empty |
| listPending on empty queue returns [] | PASS | Empty |
| Add valid proposal succeeds | PASS | OK |
| Proposal was added to queue | PASS | 1 proposal |
| Proposal ID matches | PASS | TEST-PROP-001 |
| Duplicate proposal is rejected | PASS | Duplicate proposalId: TEST-PROP-001 |
| Invalid proposal is rejected | PASS | Invalid |
| Approve succeeds | PASS | OK |
| Approve changes status | PASS | approved_by_admin |
| Approve creates event | PASS | 1 events |
| Approve does not auto-apply changes | PASS | Proposal approved but no changes were auto-applied. |
| Reject succeeds | PASS | OK |
| Reject changes status | PASS | rejected_by_admin |
| Reject stores reason | PASS | Not enough evidence |
| Request revision succeeds | PASS | OK |
| Revision changes status to needs_revision | PASS | needs_revision |
| Revision stores feedback | PASS | Need more data |
| Import succeeds | PASS | Imported 2 |
| Imported proposals are pending_review | PASS | All pending_review |
| Import records events | PASS | 2 events |
| Imported proposals have source paths | PASS | Has source paths |
| Imported proposals autoApply false | PASS | autoApply false |
| Duplicate import skipped | PASS | Skipped 1 |
