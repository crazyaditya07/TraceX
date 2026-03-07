export const mockProducts = [
  {
    id: '0x7a3f...8e2d',
    tokenId: 1001,
    name: 'Organic Green Tea',
    description: 'Premium organic green tea from Himalayan farms',
    manufacturer: 'Himalayan Tea Co.',
    currentOwner: 'Global Distributors Ltd.',
    status: 'in_transit',
    createdAt: '2026-02-10T08:30:00Z',
    journey: [
      {
        stage: 'manufactured',
        actor: 'Himalayan Tea Co.',
        location: 'Darjeeling, India',
        timestamp: '2026-02-10T08:30:00Z',
        verified: true,
      },
      {
        stage: 'shipped',
        actor: 'Himalayan Tea Co.',
        location: 'Kolkata Port, India',
        timestamp: '2026-02-12T14:20:00Z',
        verified: true,
      },
      {
        stage: 'received',
        actor: 'Global Distributors Ltd.',
        location: 'Singapore Hub',
        timestamp: '2026-02-15T09:45:00Z',
        verified: true,
      },
    ],
    metadata: {
      batchNumber: 'BT-2026-0210',
      expiryDate: '2027-02-10',
      certifications: ['USDA Organic', 'Fair Trade'],
    },
  },
  {
    id: '0x9b2c...4f1a',
    tokenId: 1002,
    name: 'Artisan Coffee Beans',
    description: 'Single-origin Ethiopian Arabica coffee beans',
    manufacturer: 'Ethiopian Coffee Collective',
    currentOwner: 'Metro Retail Chain',
    status: 'at_retailer',
    createdAt: '2026-02-05T10:00:00Z',
    journey: [
      {
        stage: 'manufactured',
        actor: 'Ethiopian Coffee Collective',
        location: 'Addis Ababa, Ethiopia',
        timestamp: '2026-02-05T10:00:00Z',
        verified: true,
      },
      {
        stage: 'shipped',
        actor: 'Ethiopian Coffee Collective',
        location: 'Djibouti Port',
        timestamp: '2026-02-07T16:30:00Z',
        verified: true,
      },
      {
        stage: 'received',
        actor: 'Global Distributors Ltd.',
        location: 'Dubai Hub',
        timestamp: '2026-02-10T11:20:00Z',
        verified: true,
      },
      {
        stage: 'transferred',
        actor: 'Metro Retail Chain',
        location: 'London, UK',
        timestamp: '2026-02-14T08:00:00Z',
        verified: true,
      },
    ],
    metadata: {
      batchNumber: 'EC-2026-0205',
      expiryDate: '2026-08-05',
      certifications: ['Rainforest Alliance', 'Direct Trade'],
    },
  },
  {
    id: '0x3d8e...7c5b',
    tokenId: 1003,
    name: 'Handcrafted Leather Wallet',
    description: 'Genuine Italian leather wallet, handmade',
    manufacturer: 'Florence Leatherworks',
    currentOwner: '0x742d...3f9a',
    status: 'sold',
    createdAt: '2026-01-20T09:15:00Z',
    journey: [
      {
        stage: 'manufactured',
        actor: 'Florence Leatherworks',
        location: 'Florence, Italy',
        timestamp: '2026-01-20T09:15:00Z',
        verified: true,
      },
      {
        stage: 'shipped',
        actor: 'Florence Leatherworks',
        location: 'Milan Distribution Center',
        timestamp: '2026-01-22T14:00:00Z',
        verified: true,
      },
      {
        stage: 'received',
        actor: 'EU Fashion Distributors',
        location: 'Paris, France',
        timestamp: '2026-01-25T10:30:00Z',
        verified: true,
      },
      {
        stage: 'transferred',
        actor: 'Luxury Boutique Paris',
        location: 'Paris, France',
        timestamp: '2026-01-28T09:00:00Z',
        verified: true,
      },
      {
        stage: 'sold',
        actor: '0x742d...3f9a',
        location: 'Paris, France',
        timestamp: '2026-02-01T15:45:00Z',
        verified: true,
      },
    ],
    metadata: {
      batchNumber: 'FL-2026-0120',
      expiryDate: null,
      certifications: ['Made in Italy', 'Genuine Leather'],
    },
  },
  {
    id: '0x5f1a...9e4d',
    tokenId: 1004,
    name: 'Organic Honey',
    description: 'Raw wildflower honey from New Zealand',
    manufacturer: 'NZ Honey Farms',
    currentOwner: 'Asia Pacific Distributors',
    status: 'in_transit',
    createdAt: '2026-02-14T07:00:00Z',
    journey: [
      {
        stage: 'manufactured',
        actor: 'NZ Honey Farms',
        location: 'Canterbury, New Zealand',
        timestamp: '2026-02-14T07:00:00Z',
        verified: true,
      },
      {
        stage: 'shipped',
        actor: 'NZ Honey Farms',
        location: 'Auckland Port',
        timestamp: '2026-02-16T11:30:00Z',
        verified: true,
      },
    ],
    metadata: {
      batchNumber: 'NZH-2026-0214',
      expiryDate: '2028-02-14',
      certifications: ['UMF Certified', 'Organic NZ'],
    },
  },
]

export const mockStats = {
  totalProducts: 1247,
  verifiedProducts: 1189,
  activeTransfers: 156,
  totalParticipants: 89,
}

export const mockActivities = [
  {
    id: 1,
    type: 'product_created',
    product: 'Organic Green Tea',
    actor: 'Himalayan Tea Co.',
    timestamp: '2026-02-10T08:30:00Z',
  },
  {
    id: 2,
    type: 'ownership_transferred',
    product: 'Artisan Coffee Beans',
    actor: 'Global Distributors Ltd.',
    timestamp: '2026-02-14T08:00:00Z',
  },
  {
    id: 3,
    type: 'product_verified',
    product: 'Handcrafted Leather Wallet',
    actor: '0x742d...3f9a',
    timestamp: '2026-02-01T15:45:00Z',
  },
  {
    id: 4,
    type: 'product_created',
    product: 'Organic Honey',
    actor: 'NZ Honey Farms',
    timestamp: '2026-02-14T07:00:00Z',
  },
  {
    id: 5,
    type: 'ownership_transferred',
    product: 'Premium Olive Oil',
    actor: 'Mediterranean Exports',
    timestamp: '2026-02-13T16:20:00Z',
  },
]

export const roleBadges = {
  manufacturer: { color: 'bg-blue-500', label: 'Manufacturer' },
  distributor: { color: 'bg-purple-500', label: 'Distributor' },
  retailer: { color: 'bg-orange-500', label: 'Retailer' },
  consumer: { color: 'bg-green-500', label: 'Consumer' },
  admin: { color: 'bg-red-500', label: 'Admin' },
}

export const supplyChainStages = [
  { id: 'manufactured', label: 'Manufactured', icon: 'Factory', color: 'blue' },
  { id: 'shipped', label: 'Shipped', icon: 'Truck', color: 'purple' },
  { id: 'received', label: 'Received', icon: 'PackageCheck', color: 'orange' },
  { id: 'transferred', label: 'Transferred', icon: 'ArrowRightLeft', color: 'cyan' },
  { id: 'sold', label: 'Sold', icon: 'ShoppingCart', color: 'green' },
]
