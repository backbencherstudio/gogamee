// 'use client';

// import { useState, useEffect } from 'react';
// import AppData from './appdata';

// // Example component showing how to use the new AppData structure
// export default function ExampleUsage() {
//   const [bookings, setBookings] = useState(AppData.bookings.all);
//   const [selectedSport, setSelectedSport] = useState('');

//   // Get all data from AppData
//   const sports = AppData.sports.list;
//   const packages = AppData.packages.list;
//   const cities = AppData.cities.list;
//   const leagues = AppData.leagues.list;
//   const extras = AppData.extras.list;

//   // Handle booking status change
//   const handleStatusChange = (id: number, status: "pending" | "completed" | "cancelled") => {
//     AppData.bookings.update(id, { status });
//     setBookings([...AppData.bookings.all]);
//   };

//   // Handle new booking
//   const handleAddBooking = () => {
//     const newBooking = {
//       id: Date.now(),
//       status: "pending" as const,
//       basePrice: 300,
//       totalPrice: 300,
//       selectedSport: "football",
//       selectedPackage: "basic",
//       selectedCity: "madrid",
//       selectedLeague: "national",
//       adults: 1,
//       kids: 0,
//       babies: 0,
//       totalPeople: 1,
//       departureDate: new Date().toISOString(),
//       returnDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
//       departureDateFormatted: new Date().toLocaleDateString(),
//       returnDateFormatted: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
//       departureTimeStart: 480,
//       departureTimeEnd: 900,
//       arrivalTimeStart: 1080,
//       arrivalTimeEnd: 1800,
//       departureTimeRange: "08:00 - 15:00",
//       arrivalTimeRange: "18:00 - 06:00(+1)",
//       removedLeagues: [],
//       removedLeaguesCount: 0,
//       hasRemovedLeagues: false,
//       allExtras: AppData.extras.list.map(extra => ({ ...extra, isSelected: false, quantity: 1 })),
//       selectedExtras: [],
//       selectedExtrasNames: [],
//       totalExtrasCost: 0,
//       extrasCount: 0,
//       firstName: "New",
//       lastName: "User",
//       fullName: "New User",
//       email: "newuser@example.com",
//       phone: "+34 600 000 000",
//       paymentMethod: "card",
//       cardNumber: null,
//       expiryDate: null,
//       cvv: null,
//       cardholderName: null,
//       bookingTimestamp: new Date().toISOString(),
//       bookingDate: new Date().toLocaleDateString(),
//       bookingTime: new Date().toLocaleTimeString(),
//       isBookingComplete: false,
//       travelDuration: 3,
//       hasFlightPreferences: false,
//       requiresEuropeanLeagueHandling: false
//     };

//     AppData.bookings.add(newBooking);
//     setBookings([...AppData.bookings.all]);
//   };

//   // Handle delete booking
//   const handleDeleteBooking = (id: number) => {
//     AppData.bookings.delete(id);
//     setBookings([...AppData.bookings.all]);
//   };

//   // Filter bookings by sport
//   const filteredBookings = selectedSport 
//     ? bookings.filter(booking => booking.selectedSport === selectedSport)
//     : bookings;

//   // Get package info
//   const getPackageInfo = (packageId: string) => {
//     return AppData.packages.getById(packageId);
//   };

//   // Get city info
//   const getCityInfo = (cityId: string) => {
//     return AppData.cities.getById(cityId);
//   };

//   // Get sport info
//   const getSportInfo = (sportId: string) => {
//     return AppData.sports.getById(sportId);
//   };

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">AppData Structure Example</h1>
      
//       {/* Controls */}
//       <div className="mb-6 p-4 bg-gray-100 rounded-lg">
//         <h2 className="text-xl font-semibold mb-4">Controls</h2>
//         <div className="flex gap-4 items-center">
//           <button
//             onClick={handleAddBooking}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//           >
//             Add New Booking
//           </button>
          
//           <select
//             value={selectedSport}
//             onChange={(e) => setSelectedSport(e.target.value)}
//             className="px-3 py-2 border rounded"
//           >
//             <option value="">All Sports</option>
//             {sports.map(sport => (
//               <option key={sport.id} value={sport.id}>
//                 {sport.icon} {sport.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="p-4 bg-green-100 rounded-lg">
//           <h3 className="font-semibold text-green-800">Total Bookings</h3>
//           <p className="text-2xl font-bold text-green-600">{bookings.length}</p>
//         </div>
//         <div className="p-4 bg-yellow-100 rounded-lg">
//           <h3 className="font-semibold text-yellow-800">Pending</h3>
//           <p className="text-2xl font-bold text-yellow-600">{AppData.bookings.pending.length}</p>
//         </div>
//         <div className="p-4 bg-blue-100 rounded-lg">
//           <h3 className="font-semibold text-blue-800">Completed</h3>
//           <p className="text-2xl font-bold text-blue-600">{AppData.bookings.completed.length}</p>
//         </div>
//         <div className="p-4 bg-red-100 rounded-lg">
//           <h3 className="font-semibold text-red-800">Cancelled</h3>
//           <p className="text-2xl font-bold text-red-600">{AppData.bookings.cancelled.length}</p>
//         </div>
//       </div>

//       {/* Bookings List */}
//       <div className="space-y-4">
//         <h2 className="text-2xl font-semibold">Bookings ({filteredBookings.length})</h2>
        
//         {filteredBookings.map(booking => {
//           const packageInfo = getPackageInfo(booking.selectedPackage);
//           const cityInfo = getCityInfo(booking.selectedCity);
//           const sportInfo = getSportInfo(booking.selectedSport);
          
//           return (
//             <div key={booking.id} className="p-4 border rounded-lg">
//               <div className="flex justify-between items-start mb-3">
//                 <div>
//                   <h3 className="text-lg font-semibold">
//                     {booking.fullName} - {sportInfo?.icon} {sportInfo?.name}
//                   </h3>
//                   <p className="text-gray-600">
//                     {cityInfo?.name}, {packageInfo?.name} Package
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {booking.departureDateFormatted} - {booking.returnDateFormatted}
//                   </p>
//                 </div>
                
//                 <div className="text-right">
//                   <span className={`px-2 py-1 rounded text-sm font-medium ${
//                     booking.status === 'completed' ? 'bg-green-100 text-green-800' :
//                     booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
//                     'bg-red-100 text-red-800'
//                   }`}>
//                     {booking.status}
//                   </span>
//                   <p className="text-lg font-bold mt-1">€{booking.totalPrice}</p>
//                 </div>
//               </div>
              
//               <div className="flex gap-2 mb-3">
//                 <button
//                   onClick={() => handleStatusChange(booking.id, "pending")}
//                   className={`px-3 py-1 rounded text-sm ${
//                     booking.status === 'pending' 
//                       ? 'bg-yellow-500 text-white' 
//                       : 'bg-gray-200 hover:bg-yellow-200'
//                   }`}
//                 >
//                   Pending
//                 </button>
//                 <button
//                   onClick={() => handleStatusChange(booking.id, "completed")}
//                   className={`px-3 py-1 rounded text-sm ${
//                     booking.status === 'completed' 
//                       ? 'bg-green-500 text-white' 
//                       : 'bg-gray-200 hover:bg-green-200'
//                   }`}
//                 >
//                   Complete
//                 </button>
//                 <button
//                   onClick={() => handleStatusChange(booking.id, "cancelled")}
//                   className={`px-3 py-1 rounded text-sm ${
//                     booking.status === 'cancelled' 
//                       ? 'bg-red-500 text-white' 
//                       : 'bg-gray-200 hover:bg-red-200'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteBooking(booking.id)}
//                   className="px-3 py-1 rounded text-sm bg-red-200 hover:bg-red-300 text-red-800"
//                 >
//                   Delete
//                 </button>
//               </div>
              
//               <div className="text-sm text-gray-600">
//                 <p>People: {booking.adults} adults, {booking.kids} kids, {booking.babies} babies</p>
//                 <p>Extras: {booking.extrasCount} items (€{booking.totalExtrasCost})</p>
//                 <p>Payment: {AppData.paymentMethods.getById(booking.paymentMethod)?.name}</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Data Structure Info */}
//       <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//         <h2 className="text-xl font-semibold mb-3">Available Data Sections</h2>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//           <div>
//             <h4 className="font-medium">Sports</h4>
//             <p>{sports.length} items</p>
//           </div>
//           <div>
//             <h4 className="font-medium">Packages</h4>
//             <p>{packages.length} types</p>
//           </div>
//           <div>
//             <h4 className="font-medium">Cities</h4>
//             <p>{cities.length} locations</p>
//           </div>
//           <div>
//             <h4 className="font-medium">Leagues</h4>
//             <p>{leagues.length} levels</p>
//           </div>
//           <div>
//             <h4 className="font-medium">Extras</h4>
//             <p>{extras.length} services</p>
//           </div>
//           <div>
//             <h4 className="font-medium">Payment Methods</h4>
//             <p>{AppData.paymentMethods.list.length} options</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }