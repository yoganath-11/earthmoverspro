import { mockEquipment, mockOwners } from './mockData';

const EQUIPMENT_KEY = 'em_equipment';
const BOOKINGS_KEY = 'em_bookings';
const OWNERS_KEY = 'em_owners';

// Initialize localStorage with mock data if empty
export function initStore() {
  if (!localStorage.getItem(EQUIPMENT_KEY)) {
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(mockEquipment));
  }
  if (!localStorage.getItem(OWNERS_KEY)) {
    localStorage.setItem(OWNERS_KEY, JSON.stringify(mockOwners));
  }
  if (!localStorage.getItem(BOOKINGS_KEY)) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify([]));
  }
}

// Equipment CRUD
export function getAllEquipment() {
  return JSON.parse(localStorage.getItem(EQUIPMENT_KEY) || '[]');
}

export function getEquipmentById(id) {
  return getAllEquipment().find(e => e.id === id);
}

export function addEquipment(equipment) {
  const all = getAllEquipment();
  const newItem = { ...equipment, id: 'eq' + Date.now(), rating: 0, reviewCount: 0, available: true, blockedDates: [] };
  all.push(newItem);
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(all));
  return newItem;
}

export function updateEquipment(id, updates) {
  const all = getAllEquipment();
  const idx = all.findIndex(e => e.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...updates };
    localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(all));
    return all[idx];
  }
  return null;
}

export function deleteEquipment(id) {
  const all = getAllEquipment().filter(e => e.id !== id);
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(all));
}

// Bookings
export function getAllBookings() {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
}

export function getBookingById(id) {
  return getAllBookings().find(b => b.id === id);
}

export function createBooking(booking) {
  const all = getAllBookings();
  const newBooking = {
    ...booking,
    id: 'bk' + Date.now(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  all.push(newBooking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(all));

  // Block the dates on the equipment
  const eq = getEquipmentById(booking.equipmentId);
  if (eq) {
    const existingBlocked = eq.blockedDates || [];
    const newBlocked = getDatesInRange(booking.startDate, booking.endDate);
    updateEquipment(booking.equipmentId, {
      blockedDates: [...new Set([...existingBlocked, ...newBlocked])],
    });
  }
  return newBooking;
}

export function getBookingsForOwner(ownerId) {
  const bookings = getAllBookings();
  const equipment = getAllEquipment();
  return bookings.filter(b => {
    const eq = equipment.find(e => e.id === b.equipmentId);
    return eq && eq.ownerId === ownerId;
  });
}

// Owners
export function getAllOwners() {
  return JSON.parse(localStorage.getItem(OWNERS_KEY) || '[]');
}

export function getOwnerById(id) {
  return getAllOwners().find(o => o.id === id);
}

export function addOwner(owner) {
  const all = getAllOwners();
  const newOwner = { ...owner, id: 'o' + Date.now() };
  all.push(newOwner);
  localStorage.setItem(OWNERS_KEY, JSON.stringify(all));
  return newOwner;
}

export function getEquipmentForOwner(ownerId) {
  return getAllEquipment().filter(e => e.ownerId === ownerId);
}

// Date helpers
export function getDatesInRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function isDateBlocked(date, blockedDates) {
  return (blockedDates || []).includes(typeof date === 'string' ? date : date.toISOString().split('T')[0]);
}

export function countDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
}
