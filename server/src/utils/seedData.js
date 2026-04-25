import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env') });

import User from '../models/User.js';
import Animal from '../models/Animal.js';
import Ticket from '../models/Ticket.js';
import Booking from '../models/Booking.js';
import GalleryItem from '../models/GalleryItem.js';
import Event from '../models/Event.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lahore_zoo';

// ─── SEED DATA ──────────────────────────────────────────────

const users = [
  {
    name: 'Admin User',
    email: 'admin@lahorezoo.pk',
    password: 'Admin@123',
    role: 'admin',
    phone: '0423-6314684',
  },
  {
    name: 'Momina Arif',
    email: 'momina@test.com',
    password: 'Visitor@123',
    role: 'visitor',
    phone: '0300-1234567',
  },
  {
    name: 'Zain Ul Abedin',
    email: 'zain@test.com',
    password: 'Visitor@123',
    role: 'visitor',
    phone: '0301-7654321',
  },
];

const animals = [
  { name: 'Sheru', species: 'Bengal Tiger', category: 'mammal', description: 'The majestic Bengal Tiger, one of the most iconic big cats. Sheru has been with us since 2018 and is known for his playful nature during feeding times.', habitat: 'Tropical forests, grasslands', diet: 'Carnivore — deer, wild boar, buffalo', funFact: 'Tigers are the largest wild cat species and can eat up to 40 kg of meat in one sitting!', conservationStatus: 'Endangered', imageUrl: '/img/animals/jaguar.jpg', location: { zone: 'Big Cats Zone', coordinates: { x: 120, y: 85 } } },
  { name: 'Simba', species: 'African Lion', category: 'mammal', description: 'The king of the jungle! Simba is our pride\'s dominant male, easily recognized by his magnificent dark mane.', habitat: 'African savannas and grasslands', diet: 'Carnivore — zebra, antelope, wildebeest', funFact: 'A lion\'s roar can be heard from 8 kilometers away!', conservationStatus: 'Vulnerable', imageUrl: '/img/animals/bear.jpg', location: { zone: 'Big Cats Zone', coordinates: { x: 140, y: 90 } } },
  { name: 'Nuri', species: 'Indian Peafowl', category: 'bird', description: 'Our stunning peacock Nuri loves to display his iridescent tail feathers, especially during the spring breeding season.', habitat: 'Forest edges, near water', diet: 'Omnivore — seeds, insects, small reptiles', funFact: 'A peacock\'s tail feathers can span up to 1.8 meters when fully displayed!', conservationStatus: 'Least Concern', imageUrl: '/img/animals/animal-05.jpg', location: { zone: 'Aviary', coordinates: { x: 200, y: 150 } } },
  { name: 'Mugger', species: 'Mugger Crocodile', category: 'reptile', description: 'This ancient predator has been patrolling our reptile pond for over a decade. Mugger crocodiles are native to the Indus River system.', habitat: 'Freshwater lakes, rivers, marshes', diet: 'Carnivore — fish, turtles, small mammals', funFact: 'Mugger crocodiles can live for over 40 years in captivity!', conservationStatus: 'Vulnerable', imageUrl: '/img/animals/animal-10.jpg', location: { zone: 'Reptile House', coordinates: { x: 280, y: 200 } } },
  { name: 'Hathi', species: 'Asian Elephant', category: 'mammal', description: 'Our gentle giant Hathi arrived from Sri Lanka as part of a conservation exchange program. He is incredibly intelligent and recognizes his caretakers by voice.', habitat: 'Tropical and subtropical forests', diet: 'Herbivore — grasses, bark, fruits', funFact: 'Elephants are the only animals that can\'t jump, but they can swim for up to 6 hours!', conservationStatus: 'Endangered', imageUrl: '/img/animals/hippopotamus.jpg', location: { zone: 'Elephant Enclosure', coordinates: { x: 180, y: 250 } } },
  { name: 'Rocky', species: 'Rhesus Macaque', category: 'mammal', description: 'Rocky leads a troop of 15 macaques in our primate section. Watch them swing, play, and interact in their enrichment habitat.', habitat: 'Forests, urban areas of South Asia', diet: 'Omnivore — fruits, seeds, insects', funFact: 'Rhesus macaques were the first primates launched into space!', conservationStatus: 'Least Concern', imageUrl: '/img/about.webp', location: { zone: 'Primate Island', coordinates: { x: 100, y: 180 } } },
  { name: 'Mitthu', species: 'Alexandrine Parakeet', category: 'bird', description: 'Named after Alexander the Great, Mitthu is famous for mimicking visitor greetings in Urdu and English.', habitat: 'Woodlands and forests of South Asia', diet: 'Herbivore — seeds, fruits, flowers', funFact: 'These parrots can learn to speak up to 50 words and phrases!', conservationStatus: 'Near Threatened', imageUrl: '/img/Parrot.png', location: { zone: 'Aviary', coordinates: { x: 210, y: 160 } } },
  { name: 'Kala', species: 'Black Bear', category: 'mammal', description: 'Kala the Asiatic Black Bear is easily the most photogenic resident. With his distinctive white chest patch, he attracts crowds daily.', habitat: 'Himalayan forests', diet: 'Omnivore — berries, honey, insects, small mammals', funFact: 'Black bears are excellent climbers and often sleep in tree nests!', conservationStatus: 'Vulnerable', imageUrl: '/img/contact-1.webp', location: { zone: 'Bear Pit', coordinates: { x: 300, y: 120 } } },
  { name: 'Champa', species: 'Spotted Deer', category: 'mammal', description: 'Champa leads a herd of beautiful spotted deer in the open grazing area. Their white spots help camouflage them in dappled forest light.', habitat: 'Indian subcontinent grasslands', diet: 'Herbivore — grasses, leaves', funFact: 'Only male chital deer have antlers, which they shed and regrow every year!', conservationStatus: 'Least Concern', imageUrl: '/img/contact-2.webp', location: { zone: 'Deer Park', coordinates: { x: 250, y: 300 } } },
  { name: 'Cobra King', species: 'Indian Cobra', category: 'reptile', description: 'Our resident King Cobra is one of the most feared yet fascinating reptiles. Safely housed behind reinforced glass in the Reptile House.', habitat: 'Forests, plains, and agricultural areas', diet: 'Carnivore — rodents, lizards, other snakes', funFact: 'The Indian Cobra can spit venom up to 2 meters to defend itself!', conservationStatus: 'Least Concern', imageUrl: '/img/stones.webp', location: { zone: 'Reptile House', coordinates: { x: 290, y: 210 } } },
  { name: 'Goldy', species: 'Goldfish', category: 'aquatic', description: 'Our ornamental fish pond features hundreds of goldfish in brilliant orange, white, and calico patterns.', habitat: 'Freshwater ponds', diet: 'Omnivore — algae, insects, commercial feed', funFact: 'Goldfish can remember things for at least 5 months — they are not as forgetful as people think!', conservationStatus: 'Least Concern', imageUrl: '/img/entrance.webp', location: { zone: 'Aquarium', coordinates: { x: 160, y: 300 } } },
  { name: 'Rani', species: 'Indian Star Tortoise', category: 'reptile', description: 'Rani is estimated to be over 60 years old! Her star-patterned shell is a masterpiece of natural design.', habitat: 'Dry scrublands of India and Pakistan', diet: 'Herbivore — grasses, flowers, fruits', funFact: 'Star tortoises can live for over 100 years! Their star patterns are unique like human fingerprints.', conservationStatus: 'Vulnerable', imageUrl: '/img/gallery-1.webp', location: { zone: 'Reptile House', coordinates: { x: 275, y: 220 } } },
];

const tickets = [
  { name: 'Adult', price: 100, description: 'Standard entry for adults (12+ years)', includes: ['Zoo Entry', 'Guide Map', 'Aviary Access'], maxPerBooking: 10 },
  { name: 'Child', price: 50, description: 'Discounted entry for children (3-12 years)', includes: ['Zoo Entry', 'Guide Map', 'Playground Access'], maxPerBooking: 10 },
  { name: 'Senior', price: 70, description: 'Special rate for senior citizens (60+ years)', includes: ['Zoo Entry', 'Guide Map', 'Wheelchair Access', 'Aviary Access'], maxPerBooking: 5 },
  { name: 'Family Pack', price: 300, description: 'Family bundle: 2 Adults + 2 Children', includes: ['Zoo Entry x4', 'Guide Map', 'Aviary Access', 'Aquarium Access', 'Free Snack Voucher'], maxPerBooking: 3 },
];

const galleryItems = [
  { title: 'Golden Hour at the Big Cat Habitat', description: 'A striking big-cat portrait that captures the intensity and stillness of a jungle safari moment.', imageUrl: '/img/animals/jaguar.jpg', category: 'animals', tags: ['big-cat', 'jungle-safari', 'wildlife'], photographer: 'Zoo Photography Club', isFeatured: true },
  { title: 'Aviary Color Burst', description: 'A vivid avian portrait that reflects the energy and color visitors expect from the bird enclosures.', imageUrl: '/img/animals/animal-05.jpg', category: 'animals', tags: ['aviary', 'birds', 'colorful'], photographer: 'Momina Arif', isFeatured: true },
  { title: 'Safari Landscape View', description: 'A wide wildlife scene used to evoke the immersive feel of open habitat and safari exploration.', imageUrl: '/img/animals/safari-landscape.jpg', category: 'habitat', tags: ['landscape', 'nature', 'safari'], photographer: 'Lahore Zoo', isFeatured: true },
  { title: 'Reptile House Watch', description: 'A close reptile-focused image that gives the gallery a stronger jungle and discovery feel.', imageUrl: '/img/animals/animal-10.jpg', category: 'animals', tags: ['reptile', 'habitat', 'discovery'], photographer: 'Zain Ul Abedin', isFeatured: true },
  { title: 'River Giants Encounter', description: 'A heavyweight habitat image that supports the aquatic and large-animal side of the zoo experience.', imageUrl: '/img/animals/hippopotamus.jpg', category: 'habitat', tags: ['river', 'giants', 'habitat'], photographer: 'Lahore Zoo', isFeatured: true },
  { title: 'Visitor Trail Through Wildlife', description: 'A feature image selected to support exploration, guided routes, and educational zoo experiences.', imageUrl: '/img/animals/animal-08.jpg', category: 'events', tags: ['trail', 'exploration', 'experience'], photographer: 'Zoo Photography Club', isFeatured: true },
  { title: 'Bird House Walkthrough', description: 'A bright walkthrough-style visual for aviary storytelling and family visit promotion.', imageUrl: '/img/animals/animal-04.jpg', category: 'visitors', tags: ['aviary', 'birds', 'visitors'], photographer: 'Lahore Zoo', isFeatured: false },
  { title: 'Night Safari Preview', description: 'A darker wildlife image chosen to better support the upcoming night safari theme.', imageUrl: '/img/animals/bear.jpg', category: 'events', tags: ['night', 'safari', 'wildlife'], photographer: 'Lahore Zoo', isFeatured: true },
];

const events = [
  { title: 'Lion Feeding Show', description: 'Watch our magnificent lions being fed by their expert caretakers. Learn about lion diet, behavior, and conservation.', date: new Date(Date.now() + 2 * 86400000), time: '11:00 AM', venue: 'Big Cats Zone', category: 'feeding', isFeatured: true },
  { title: 'Elephant Bath Time', description: 'Join Hathi for his daily bath! Watch our elephant enjoy his splash time and learn about elephant care.', date: new Date(Date.now() + 3 * 86400000), time: '10:00 AM', venue: 'Elephant Enclosure', category: 'show', isFeatured: true },
  { title: 'Wildlife Photography Workshop', description: 'Learn the art of wildlife photography from professional photographers. Bring your own camera!', date: new Date(Date.now() + 7 * 86400000), time: '9:00 AM', venue: 'Main Amphitheater', category: 'educational', isFeatured: true },
  { title: 'Snake Awareness Talk', description: 'Educational session about common snakes of Pakistan, snake bite first aid, and conservation importance.', date: new Date(Date.now() + 5 * 86400000), time: '2:00 PM', venue: 'Reptile House', category: 'educational', isFeatured: false },
  { title: 'Bird Watching Morning', description: 'Early morning guided bird tour with expert ornithologists. Perfect for families and nature enthusiasts.', date: new Date(Date.now() + 4 * 86400000), time: '7:00 AM', venue: 'Aviary', category: 'educational', isFeatured: false },
  { title: 'Spring Festival 2026', description: 'Annual spring celebration with face painting, animal encounters, food stalls, and live performances. The biggest event of the year!', date: new Date(Date.now() + 14 * 86400000), time: '10:00 AM - 6:00 PM', venue: 'Entire Zoo', category: 'seasonal', isFeatured: true },
  { title: 'Reptile Feeding Demonstration', description: 'See our crocodiles, pythons, and monitor lizards being fed. Not for the faint-hearted!', date: new Date(Date.now() + 1 * 86400000), time: '3:00 PM', venue: 'Reptile House', category: 'feeding', isFeatured: false },
  { title: 'Junior Zookeeper Program', description: 'Kids aged 8-14 can spend a day as junior zookeepers! Learn about animal care, prepare food, and assist with enrichment.', date: new Date(Date.now() + 10 * 86400000), time: '9:00 AM - 1:00 PM', venue: 'Education Center', category: 'educational', isFeatured: true },
  { title: 'Monkey Island Enrichment', description: 'Watch our macaque troop tackle new puzzle feeders and enrichment toys. Amazing display of primate intelligence!', date: new Date(Date.now() + 6 * 86400000), time: '11:30 AM', venue: 'Primate Island', category: 'show', isFeatured: false },
  { title: 'Night Safari Launch', description: 'Be among the first to experience Lahore Zoo after dark! Limited tickets available for this exclusive preview event.', date: new Date(Date.now() + 21 * 86400000), time: '7:00 PM - 10:00 PM', venue: 'Selected Zones', category: 'special', isFeatured: true },
];

// ─── SEED FUNCTION ──────────────────────────────────────────

const seed = async () => {
  try {
    console.log('🌱 Seeding database...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('   ✅ Connected to MongoDB\n');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Animal.deleteMany({}),
      Ticket.deleteMany({}),
      Booking.deleteMany({}),
      GalleryItem.deleteMany({}),
      Event.deleteMany({}),
    ]);
    console.log('   🗑️  Cleared existing data\n');

    // Seed Users (password hashing handled by pre-save hook)
    const createdUsers = await User.create(users);
    console.log(`   👤 Created ${createdUsers.length} users`);
    createdUsers.forEach(u => console.log(`      - ${u.email} (${u.role})`));

    // Seed Animals
    const createdAnimals = await Animal.create(animals);
    console.log(`\n   🦁 Created ${createdAnimals.length} animals`);

    // Seed Tickets
    const createdTickets = await Ticket.create(tickets);
    console.log(`   🎫 Created ${createdTickets.length} ticket types`);

    // Seed Gallery
    const createdGallery = await GalleryItem.create(galleryItems);
    console.log(`   🖼️  Created ${createdGallery.length} gallery items`);

    // Seed Events
    const createdEvents = await Event.create(events);
    console.log(`   📅 Created ${createdEvents.length} events`);

    // Create sample bookings
    const visitor = createdUsers.find(u => u.role === 'visitor');
    const adultTicket = createdTickets.find(t => t.name === 'Adult');
    const childTicket = createdTickets.find(t => t.name === 'Child');

    const sampleBookings = [
      {
        user: visitor._id,
        bookingRef: 'LZ-20260414-DEMO',
        visitDate: new Date(Date.now() + 3 * 86400000),
        tickets: [
          { ticketType: adultTicket._id, ticketName: 'Adult', unitPrice: adultTicket.price, quantity: 2, subtotal: 200 },
          { ticketType: childTicket._id, ticketName: 'Child', unitPrice: childTicket.price, quantity: 1, subtotal: 50 },
        ],
        totalAmount: 250,
        totalVisitors: 3,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'visa',
        visitors: [
          { name: 'Momina Arif', age: 24, type: 'adult' },
          { name: 'Ahmed Ali', age: 28, type: 'adult' },
          { name: 'Sara Ali', age: 8, type: 'child' },
        ],
      },
      {
        user: visitor._id,
        bookingRef: 'LZ-20260414-DM02',
        visitDate: new Date(Date.now() + 7 * 86400000),
        tickets: [
          { ticketType: adultTicket._id, ticketName: 'Adult', unitPrice: adultTicket.price, quantity: 1, subtotal: 100 },
        ],
        totalAmount: 100,
        totalVisitors: 1,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: '',
        visitors: [
          { name: 'Momina Arif', age: 24, type: 'adult' },
        ],
      },
    ];

    const createdBookings = await Booking.create(sampleBookings);
    console.log(`   📋 Created ${createdBookings.length} sample bookings`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('   Login Credentials:');
    console.log('   ─────────────────');
    console.log('   Admin:   admin@lahorezoo.pk / Admin@123');
    console.log('   Visitor: momina@test.com / Visitor@123');
    console.log('   Visitor: zain@test.com / Visitor@123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
