'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Package as PackageIcon, Trash2, X, Edit } from 'lucide-react'
import AddPackage from './addpackage'
import AppData from '../../../../lib/appdata'
import DeleteConfirmationModal from '../../../../../components/ui/delete-confirmation-modal'

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

export default function PackageManagement({ 
  onPackageAdd,
  onPackageDelete
}: PackageManagementProps) {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [selectedSport, setSelectedSport] = useState<'football' | 'basketball' | 'all'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  // Load package data from AppData
  useEffect(() => {
    setPackages(AppData.travelPackages.getAll() as PackageData[]);
  }, []);

  // Filter packages by sport
  const filteredPackages = selectedSport === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.sport === selectedSport);

  // Delete package function
  const handleDeletePackage = (id: string) => {
    const success = AppData.travelPackages.delete(id);
    if (success) {
      setPackages(AppData.travelPackages.getAll() as PackageData[]);
    }
    setDeleteConfirm(null);
    if (onPackageDelete) {
      onPackageDelete(id);
    }
  };

  // Add new package function
  const handleAddPackage = (newPackage: Omit<PackageData, 'id'>) => {
    const addedPackage = AppData.travelPackages.add(newPackage);
    if (addedPackage) {
      setPackages(AppData.travelPackages.getAll() as PackageData[]);
      setShowAddForm(false);
      if (onPackageAdd) {
        onPackageAdd(addedPackage as PackageData);
      }
    }
  };

  // Update existing package
  const handleUpdatePackage = (updated: Omit<PackageData, 'id'>) => {
    if (!editingPackageId) return;
    const saved = AppData.travelPackages.update(editingPackageId, updated);
    if (saved) {
      setPackages(AppData.travelPackages.getAll() as PackageData[]);
    }
    setEditingPackageId(null);
  };

  return (
    <div className="py-4 pl-10 min-h-screen mb-4 pr-8 ">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex items-start flex-col gap-4">
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
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <span className="text-gray-700 font-medium font-['Poppins'] whitespace-nowrap">Filter by Sport</span>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Sports' },
                { value: 'football', label: 'Football' },
                { value: 'basketball', label: 'Basketball' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedSport(option.value as 'football' | 'basketball' | 'all')}
                  className={`px-3 py-1.5 text-sm md:px-4 md:py-2 md:text-base rounded-md font-medium font-['Poppins'] transition-all duration-200 ${
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
                      onClick={() => setEditingPackageId(pkg.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit Package"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
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

      {/* Edit Package Modal */}
      {editingPackageId && (
        <div 
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingPackageId(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">Edit Package</h2>
              <button
                onClick={() => setEditingPackageId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {(() => {
                const pkg = packages.find(p => p.id === editingPackageId);
                if (!pkg) return null;
                const initial = {
                  sport: pkg.sport,
                  category: pkg.category,
                  standard: pkg.standard,
                  premium: pkg.premium
                };
                return (
                  <AddPackage
                    initialData={initial}
                    submitLabel="Save Changes"
                    showSport={false}
                    onSubmit={handleUpdatePackage}
                    onCancel={() => setEditingPackageId(null)}
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && handleDeletePackage(deleteConfirm)}
        title="Delete Package"
        message="Are you sure you want to delete this package?"
      />
    </div>
  )
}

export type { PackageData, PackageManagementProps }