# Pip's Dream Passport — test plan

Run these checks on the feature branch before merging; confirm again on the deployed website.

| Test | Expected |
| --- | --- |
| Fresh browser data | 0 of 3, three unstamped tasks, no award |
| Record two notes, replay | No stamp |
| Record at least three notes, enable Sound, replay to completion | Melody stamp once |
| Stop replay early or mute | No new melody stamp |
| Re-select same mood | No lantern stamp |
| Change the lantern from current mood | Lantern stamp once |
| Begin delivery and cancel via destination change | No delivery stamp |
| Successfully deliver any package to any destination | Delivery stamp once |
| Repeat completed tasks | No duplicate stamps |
| Finish all three tasks | Award, story invitation and optional name field appear |
| Name empty | Award and PNG use Little Dreamer |
| Enter a short name, save PNG | File downloads; correct name in image |
| Reload the page | Existing progress restored with localStorage |
| Block localStorage | In-memory session progression still works |
| Reset and decline confirm | No changes |
| Reset and accept confirm | Returns to 0/3; award disappears |
| Keyboard and reduced motion | Links, controls and award operate without hover-dependent behavior |

The passport creates no shared visitor statistics or official side-quest claims.

**Deployment:** make repository public and verify GitHub Pages from main / (root). After merging, retest the live link on real phones before submitting.
