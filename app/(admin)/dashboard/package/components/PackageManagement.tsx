'use client'
import React, { useState } from 'react'
import { Plus, Package as PackageIcon, Trash2, X } from 'lucide-react'
import AddPackage from './addpackage'

// Package interface matching the frontend structure
interface PackageData {
  id: string;
  sport: 'football' | 'basketball';
  category: string;
  standard: string;
  premium: string;
}

interface PackageManagementProps {
  initialPackages?: PackageData[];
  onPackageAdd?: (packageData: PackageData) => void;
  onPackageDelete?: (id: string) => void;
  onPackageUpdate?: (packageData: PackageData) => void;
}

// Default initial package data
const defaultInitialPackages: PackageData[] = [
  // Football packages
  { id: 'f1', sport: 'football', category: 'Match Ticket', standard: 'General or lateral section', premium: 'Premium or central tribune seat' },
  { id: 'f2', sport: 'football', category: 'Flights', standard: 'Round-trip from a major city', premium: 'Round-trip from a major city' },
  { id: 'f3', sport: 'football', category: 'Hotel', standard: '3-star hotel or apartment', premium: '4–5 star hotel near stadium or city center' },
  { id: 'f4', sport: 'football', category: 'Transfers', standard: 'Public transport or shuttle', premium: 'Private transfers (airport & stadium)' },
  { id: 'f5', sport: 'football', category: 'Welcome Pack', standard: 'Exclusive GoGame merchandise', premium: 'Official team jersey + premium goodies' },
  { id: 'f6', sport: 'football', category: 'Surprise Reveal', standard: 'Destination revealed 48h before. A secret clue before revealing the destination.', premium: 'Destination revealed 48h before. A secret clue before revealing the destination.' },
  { id: 'f7', sport: 'football', category: 'Starting Price', standard: 'From 299€', premium: 'From 1399€' },
  
  // Basketball packages
  { id: 'b1', sport: 'basketball', category: 'Match Ticket', standard: 'Standard seat (upper and lateral seats)', premium: 'VIP seat' },
  { id: 'b2', sport: 'basketball', category: 'Flights', standard: 'Round-trip from a major city', premium: 'Round-trip from a major city' },
  { id: 'b3', sport: 'basketball', category: 'Hotel', standard: '3-star hotel or apartment', premium: '4–5 star hotel in premium location' },
  { id: 'b4', sport: 'basketball', category: 'Transfers', standard: 'Public transport or shuttle', premium: 'Private transfers (airport & stadium)' },
  { id: 'b5', sport: 'basketball', category: 'Welcome Pack', standard: 'Travel guide + surprise gift', premium: 'Official team jersey + premium goodies' },
  { id: 'b6', sport: 'basketball', category: 'Surprise Reveal', standard: 'Destination revealed 48h before. A secret clue before revealing the destination.', premium: 'Destination revealed 48h before. A secret clue before revealing the destination.' },
  { id: 'b7', sport: 'basketball', category: 'Starting Price', standard: 'From 279€', premium: 'From 1279€' },
];

export default function PackageManagement({ 
  initialPackages = defaultInitialPackages,
  onPackageAdd,
  onPackageDelete
}: PackageManagementProps) {
  const [packages, setPackages] = useState<PackageData[]>(initialPackages);
  const [selectedSport, setSelectedSport] = useState<'football' | 'basketball' | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter packages by sport
  const filteredPackages = selectedSport === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.sport === selectedSport);

  // Delete package function
  const handleDeletePackage = (id: string) => {
    setPackages(prev => prev.filter(pkg => pkg.id !== id));
    setDeleteConfirm(null);
    if (onPackageDelete) {
      onPackageDelete(id);
    }
  };

  // Add new package function
  const handleAddPackage = (newPackage: Omit<PackageData, 'id'>) => {
    const id = `${newPackage.sport}_${Date.now()}`;
    const packageWithId = { ...newPackage, id };
    setPackages(prev => [...prev, packageWithId]);
    setShowAddForm(false);
    if (onPackageAdd) {
      onPackageAdd(packageWithId);
    }
  };

  return (
    <div className="pt-4 pl-10 min-h-screen mb-4 pr-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-3xl md:text-4xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-8">
              Package Management
            </h1>
            <p className="text-gray-600 font-['Poppins']">Manage travel packages for football and basketball events</p>
          </div>
          
          {/* Add Package Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Package
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium font-['Poppins']">Filter by Sport:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Sports' },
                { value: 'football', label: 'Football' },
                { value: 'basketball', label: 'Basketball' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSport(option.value as 'football' | 'basketball' | 'all')}
                  className={`px-4 py-2 rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                    selectedSport === option.value
                      ? 'bg-[#76C043] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg border border-gray-200 hover:border-[#76C043]/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Package Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                      pkg.sport === 'football' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      <PackageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 font-['Poppins'] text-lg">{pkg.category}</h3>
                      <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                        pkg.sport === 'football' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {pkg.sport === 'football' ? 'Football' : 'Basketball'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setDeleteConfirm(pkg.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Package Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 font-['Poppins']">Standard Package:</h4>
                  <p className="text-gray-600 text-sm font-['Poppins'] bg-gray-50 p-3 rounded-lg">{pkg.standard}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 font-['Poppins']">Premium Package:</h4>
                  <p className="text-gray-600 text-sm font-['Poppins'] bg-gray-50 p-3 rounded-lg">{pkg.premium}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 font-['Poppins']">No packages found</h3>
            <p className="text-gray-400 font-['Poppins']">Try adjusting your filter or add a new package</p>
          </div>
        )}
      </div>

      {/* Add Package Modal */}
      {showAddForm && (
        <div 
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddForm(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">Add New Package</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <AddPackage 
                onSubmit={handleAddPackage}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 font-['Poppins']">Delete Package</h3>
                <p className="text-gray-600 font-['Poppins']">Are you sure you want to delete this package?</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePackage(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium font-['Poppins'] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type { PackageData, PackageManagementProps }