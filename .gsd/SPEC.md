# Product Ownership Lifecycle Specification
STATUS: FINALIZED

## Goal
Design the correct data structure and logic so that:
- Each product has a unique lifecycle.
- Ownership transfers through roles (Manufacturer -> Distributor -> Retailer -> Consumer).
- Users only see products relevant to them based on their roles.
- Seed data uses medical/pharmaceutical products.

## Functional Requirements
1. `Product` Model must explicitly track `manufacturer_id`, `distributor_id`, `retailer_id`, and `consumer_id`.
2. Both `_id` and `walletAddress` will be maintained on users.
3. Every user must have a wallet address (supported by MetaMask).
4. The system represents a pharmaceutical supply chain (medical products).
5. Strict enforcement of supply chain stages (No skipping).
6. The dashboard data loaded via the API endpoints should filter data correctly based on explicit role mapping.
