## Phase: Product Ownership Lifecycle Data Model Decisions

**Date:** 2026-03-09

### Scope
- **Identity Key:** Both `_id` and `walletAddress` will be maintained, but `_id` will be the primary source of truth for relationships since email-only users need robust tracking. However, *every user must have a wallet address* because blockchain will be integrated using MetaMask.
- **Stage Skipping:** No product can skip a stage. The supply chain is strictly enforced: Manufacturer → Distributor → Retailer → Consumer.

### Approach
- **Chose:** Option A (Explicit Role Fields) + Simple History Tracking (Checkpoints). The `Product` schema will be updated to explicitly track `manufacturer_id`, `distributor_id`, `retailer_id`, and `consumer_id`.
- **Reason:** This approach allows for insanely fast and easy queries while continuing to provide a detailed temporal history of the product's movements using the existing `checkpoints` structure.
- **Data Domain:** All seed data, examples, and sample records will use **medical/pharmaceutical products** instead of generic ones to reflect the actual business use cases.

### Constraints
- Must ensure that legacy or smart contract references mapping strictly to `walletAddress` are updated or kept synchronized.
- Seed data needs to reflect real-world medical items (e.g., Paracetamol Tablets, Insulin Injections).
