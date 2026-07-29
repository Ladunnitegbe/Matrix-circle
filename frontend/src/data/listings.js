// Sample surplus listings used across the demo screens.
// In production this would come from the discovery-feed API (Goal 2).

export const listings = [
  {
    id: 1,
    vendor: "Mama Bisi's Kitchen",
    item: 'Jollof rice & grilled chicken trays',
    qty: '6 portions',
    category: 'Prepared meals',
    distanceKm: 0.4,
    minutesLeft: 42,
    maxMinutes: 60,
    price: 'Free',
  },
  {
    id: 2,
    vendor: 'Sunrise Bakery, Ikeja',
    item: 'Assorted bread loaves',
    qty: '12 loaves',
    category: 'Bakery',
    distanceKm: 0.9,
    minutesLeft: 18,
    maxMinutes: 60,
    price: '₦500',
  },
  {
    id: 3,
    vendor: 'Green Leaf Grocers',
    item: 'Mixed vegetable crate',
    qty: '1 crate',
    category: 'Produce',
    distanceKm: 1.2,
    minutesLeft: 55,
    maxMinutes: 60,
    price: 'Free',
  },
  {
    id: 4,
    vendor: 'Chow Corner, Yaba',
    item: 'Suya & grilled fish',
    qty: '8 portions',
    category: 'Prepared meals',
    distanceKm: 1.6,
    minutesLeft: 8,
    maxMinutes: 60,
    price: '₦300',
  },
];

export const categories = ['All', 'Prepared meals', 'Bakery', 'Produce', 'Drinks'];
