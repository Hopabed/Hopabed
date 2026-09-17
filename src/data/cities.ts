export type City = {
  id: string;
  name: string;
  state: string;
  popular: boolean;
  image: string;
  propertyCount: number;
};

export const CITIES: City[] = [
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    popular: true,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    propertyCount: 140,
  },
  {
    id: "delhi",
    name: "Delhi",
    state: "NCR",
    popular: true,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    propertyCount: 185,
  },
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    popular: true,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    propertyCount: 220,
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    popular: true,
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    propertyCount: 110,
  },
  {
    id: "bangalore",
    name: "Bangalore",
    state: "Karnataka",
    popular: true,
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    propertyCount: 165,
  },
  {
    id: "manali",
    name: "Manali",
    state: "Himachal Pradesh",
    popular: true,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    propertyCount: 95,
  },
  {
    id: "udaipur",
    name: "Udaipur",
    state: "Rajasthan",
    popular: true,
    image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=800&q=80",
    propertyCount: 88,
  },
  {
    id: "lonavala",
    name: "Lonavala",
    state: "Maharashtra",
    popular: false,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    propertyCount: 75,
  },
  {
    id: "alleppey",
    name: "Alleppey",
    state: "Kerala",
    popular: false,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    propertyCount: 62,
  },
  {
    id: "shimla",
    name: "Shimla",
    state: "Himachal Pradesh",
    popular: false,
    image: "https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=800&q=80",
    propertyCount: 70,
  },
  {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    popular: false,
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    propertyCount: 55,
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    popular: false,
    image: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?auto=format&fit=crop&w=800&q=80",
    propertyCount: 80,
  }
];
