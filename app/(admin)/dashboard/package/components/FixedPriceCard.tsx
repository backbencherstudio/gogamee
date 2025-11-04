'use client'
import React, { useState, useEffect } from 'react'
import { DollarSign, Edit, Save, X, RefreshCw, Calendar } from 'lucide-react'
import { getStartingPrice, updateStartingPrice } from '../../../../../services/packageService'

// Duration options matching the booking system
const DURATION_OPTIONS = [
  { value: 1, label: '1 Night' },
  { value: 2, label: '2 Nights' },
  { value: 3, label: '3 Nights' },
  { value: 4, label: '4 Nights' }
]

interface PriceData {
  id: string
  sport: 'football' | 'basketball'
  standardPrice: number
  premiumPrice: number
  currency: string
}

interface DurationPriceData {
  standardPrice: number
  premiumPrice: number
}

interface SportPriceData {
  [duration: number]: DurationPriceData // duration as key (1, 2, 3, 4)
  currency: string
}

interface CombinedPriceData {
  standardPrice: number
  premiumPrice: number
  currency: string
}

interface FixedPriceCardProps {
  onPriceUpdate?: (sport: 'football' | 'basketball', prices: { standardPrice: number; premiumPrice: number; currency: string }) => void
}

export default function FixedPriceCard({ onPriceUpdate }: FixedPriceCardProps) {
  const [selectedDuration, setSelectedDuration] = useState<number>(1)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Price data structure: sport -> duration -> prices
  const [priceData, setPriceData] = useState<{
    football: SportPriceData
    basketball: SportPriceData
    combined: CombinedPriceData
  }>({
    football: {
      1: { standardPrice: 379, premiumPrice: 1499 },
      2: { standardPrice: 379, premiumPrice: 1499 },
      3: { standardPrice: 379, premiumPrice: 1499 },
      4: { standardPrice: 379, premiumPrice: 1499 },
      currency: 'EUR'
    },
    basketball: {
      1: { standardPrice: 359, premiumPrice: 1479 },
      2: { standardPrice: 359, premiumPrice: 1479 },
      3: { standardPrice: 359, premiumPrice: 1479 },
      4: { standardPrice: 359, premiumPrice: 1479 },
      currency: 'EUR'
    },
    combined: {
      standardPrice: 0,
      premiumPrice: 0,
      currency: 'EUR'
    }
  })

  // Currency helpers
  const toApiCurrency = (ui: string) => (ui === 'EUR' ? 'euro' : ui === 'USD' ? 'usd' : 'gbp')
  const fromApiCurrency = (api: string | undefined) => (api === 'usd' ? 'USD' : api === 'gbp' ? 'GBP' : 'EUR')
  const getCurrencySymbol = (currency: string) => (currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€')

  // Load price data from starting-price endpoints
  useEffect(() => {
    loadPriceData()
  }, [])

  const loadPriceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [fbRes, bbRes] = await Promise.all([
        getStartingPrice('football'),
        getStartingPrice('basketball')
      ])

      if (!fbRes.success || !bbRes.success) {
        setError('Failed to load price data')
      }

      const fb = fbRes.data?.[0]
      const bb = bbRes.data?.[0]

      const footballCurrency = fromApiCurrency(fb?.currency)
      const basketballCurrency = fromApiCurrency(bb?.currency)
      const defaultCurrency = footballCurrency || basketballCurrency || 'EUR'

      // Initialize with loaded data (using current price for all durations)
      // In a real scenario, you might load duration-specific prices from API
      setPriceData({
        football: {
          1: { standardPrice: fb?.currentStandardPrice || 379, premiumPrice: fb?.currentPremiumPrice || 1499 },
          2: { standardPrice: fb?.currentStandardPrice || 379, premiumPrice: fb?.currentPremiumPrice || 1499 },
          3: { standardPrice: fb?.currentStandardPrice || 379, premiumPrice: fb?.currentPremiumPrice || 1499 },
          4: { standardPrice: fb?.currentStandardPrice || 379, premiumPrice: fb?.currentPremiumPrice || 1499 },
          currency: footballCurrency || 'EUR'
        },
        basketball: {
          1: { standardPrice: bb?.currentStandardPrice || 359, premiumPrice: bb?.currentPremiumPrice || 1479 },
          2: { standardPrice: bb?.currentStandardPrice || 359, premiumPrice: bb?.currentPremiumPrice || 1479 },
          3: { standardPrice: bb?.currentStandardPrice || 359, premiumPrice: bb?.currentPremiumPrice || 1479 },
          4: { standardPrice: bb?.currentStandardPrice || 359, premiumPrice: bb?.currentPremiumPrice || 1479 },
          currency: basketballCurrency || 'EUR'
        },
        combined: {
          standardPrice: 0,
          premiumPrice: 0,
          currency: defaultCurrency
        }
      })
    } catch (err) {
      console.error('Error loading price data:', err)
      setError('Failed to load price data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPrices = () => {
    setIsEditing(true)
  }

  const handleSavePrices = async () => {
    setIsSaving(true)
    try {
      // Save prices for the selected duration
      // Note: API currently supports single price per sport, so we save the selected duration's price
      const footballPrices = priceData.football[selectedDuration]
      const basketballPrices = priceData.basketball[selectedDuration]

      const [fbResponse, bbResponse] = await Promise.all([
        updateStartingPrice('football', {
          category: 'working',
          standardDescription: 'description',
          premiumDescription: 'description',
          currency: toApiCurrency(priceData.football.currency),
          currentStandardPrice: footballPrices.standardPrice,
          currentPremiumPrice: footballPrices.premiumPrice
        }),
        updateStartingPrice('basketball', {
          category: 'working',
          standardDescription: 'description',
          premiumDescription: 'description',
          currency: toApiCurrency(priceData.basketball.currency),
          currentStandardPrice: basketballPrices.standardPrice,
          currentPremiumPrice: basketballPrices.premiumPrice
        })
      ])

      if (fbResponse.success && bbResponse.success) {
        setIsEditing(false)
        setError(null)
        
        if (onPriceUpdate) {
          onPriceUpdate('football', {
            standardPrice: footballPrices.standardPrice,
            premiumPrice: footballPrices.premiumPrice,
            currency: priceData.football.currency
          })
        }
        
        // Reload price data to ensure consistency
        await loadPriceData()
      } else {
        setError(fbResponse.message || bbResponse.message || 'Failed to update prices')
      }
    } catch (err) {
      console.error('Error updating prices:', err)
      setError('Failed to update prices. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Reload to discard changes
    loadPriceData()
  }

  const handlePriceChange = (
    sport: 'football' | 'basketball',
    packageType: 'standard' | 'premium',
    value: number
  ) => {
    setPriceData(prev => ({
      ...prev,
      [sport]: {
        ...prev[sport],
        [selectedDuration]: {
          ...prev[sport][selectedDuration],
          [packageType === 'standard' ? 'standardPrice' : 'premiumPrice']: value
        }
      }
    }))
  }

  const handleCurrencyChange = (sport: 'football' | 'basketball' | 'combined', value: string) => {
    setPriceData(prev => ({
      ...prev,
      [sport]: {
        ...prev[sport],
        currency: value
      }
    }))
  }

  const handleCombinedPriceChange = (packageType: 'standard' | 'premium', value: number) => {
    setPriceData(prev => ({
      ...prev,
      combined: {
        ...prev.combined,
        [packageType === 'standard' ? 'standardPrice' : 'premiumPrice']: value
      }
    }))
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600 text-lg font-medium">Loading price data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-[#76C043]" />
          <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
            Package Pricing
          </h2>
        </div>
        {!isEditing && (
          <button
            onClick={handleEditPrices}
            className="flex items-center gap-2 px-4 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
            Edit Prices
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="text-red-800 font-medium">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Duration Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3 font-['Poppins']">
          <Calendar className="w-4 h-4 inline mr-2" />
          Select Duration *
        </label>
        <div className="grid grid-cols-4 gap-3">
          {DURATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedDuration(option.value)}
              disabled={isSaving}
              className={`px-4 py-3 rounded-lg font-medium font-['Poppins'] transition-all duration-200 ${
                selectedDuration === option.value
                  ? 'bg-[#76C043] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500 font-['Poppins']">
          Select the number of nights to set prices for this duration
        </p>
      </div>

      {/* Sports Price Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Football Price Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚽</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-['Poppins']">Football</h3>
              <span className="text-sm text-green-600 font-medium">Package Prices</span>
            </div>
          </div>

          {isEditing ? (
            <SportPriceEditForm
              sport="football"
              duration={selectedDuration}
              priceData={priceData.football}
              onPriceChange={(packageType, value) => handlePriceChange('football', packageType, value)}
              onCurrencyChange={(value) => handleCurrencyChange('football', value)}
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">Standard Package</span>
                  <span className="text-lg font-bold text-green-600 font-['Poppins']">
                    {priceData.football[selectedDuration].standardPrice}
                    {getCurrencySymbol(priceData.football.currency)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">Premium Package</span>
                  <span className="text-lg font-bold text-blue-600 font-['Poppins']">
                    {priceData.football[selectedDuration].premiumPrice}
                    {getCurrencySymbol(priceData.football.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Basketball Price Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏀</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-['Poppins']">Basketball</h3>
              <span className="text-sm text-blue-600 font-medium">Package Prices</span>
            </div>
          </div>

          {isEditing ? (
            <SportPriceEditForm
              sport="basketball"
              duration={selectedDuration}
              priceData={priceData.basketball}
              onPriceChange={(packageType, value) => handlePriceChange('basketball', packageType, value)}
              onCurrencyChange={(value) => handleCurrencyChange('basketball', value)}
            />
          ) : (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">Standard Package</span>
                  <span className="text-lg font-bold text-green-600 font-['Poppins']">
                    {priceData.basketball[selectedDuration].standardPrice}
                    {getCurrencySymbol(priceData.basketball.currency)}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 font-['Poppins']">Premium Package</span>
                  <span className="text-lg font-bold text-blue-600 font-['Poppins']">
                    {priceData.basketball[selectedDuration].premiumPrice}
                    {getCurrencySymbol(priceData.basketball.currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Combined Price Card */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {getCurrencySymbol(priceData.combined.currency || priceData.football.currency || 'EUR')}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 font-['Poppins']">Both Sports Combined</h3>
            <span className="text-sm text-purple-600 font-medium">Custom Combined Pricing</span>
          </div>
        </div>

        {isEditing ? (
          <CombinedPriceEditForm
            priceData={priceData.combined}
            onPriceChange={handleCombinedPriceChange}
            onCurrencyChange={(value) => handleCurrencyChange('combined', value)}
            defaultCurrency={priceData.football.currency || priceData.basketball.currency || 'EUR'}
          />
        ) : (
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 font-['Poppins'] mb-2">Standard Total</div>
              <div className="text-xl font-bold text-green-600 font-['Poppins']">
                {priceData.combined.standardPrice || 0}
                {getCurrencySymbol(priceData.combined.currency || priceData.football.currency || 'EUR')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 font-['Poppins'] mb-2">Premium Total</div>
              <div className="text-xl font-bold text-blue-600 font-['Poppins']">
                {priceData.combined.premiumPrice || 0}
                {getCurrencySymbol(priceData.combined.currency || priceData.football.currency || 'EUR')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSavePrices}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Prices
              </>
            )}
          </button>
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800 font-['Poppins']">
          <strong>Note:</strong> These prices control the base pricing for all packages in the application. 
          Changes will affect the booking system immediately. Select a duration to set prices for that specific number of nights.
        </p>
      </div>
    </div>
  )
}

// Sport Price Edit Form Component
interface SportPriceEditFormProps {
  sport: 'football' | 'basketball'
  duration: number
  priceData: SportPriceData
  onPriceChange: (packageType: 'standard' | 'premium', value: number) => void
  onCurrencyChange: (value: string) => void
}

function SportPriceEditForm({ sport, duration, priceData, onPriceChange, onCurrencyChange }: SportPriceEditFormProps) {
  const getCurrencySymbol = (currency: string) => (currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€')
  const currentPrices = priceData[duration]

  return (
    <div className="space-y-4">
      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Currency *
        </label>
        <select
          value={priceData.currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Standard Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Standard Package Price ({duration} {duration === 1 ? 'Night' : 'Nights'}) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            value={currentPrices.standardPrice}
            onChange={(e) => onPriceChange('standard', parseFloat(e.target.value) || 0)}
            placeholder="Enter standard package price"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {getCurrencySymbol(priceData.currency)}
          </span>
        </div>
      </div>

      {/* Premium Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Premium Package Price ({duration} {duration === 1 ? 'Night' : 'Nights'}) *
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            value={currentPrices.premiumPrice}
            onChange={(e) => onPriceChange('premium', parseFloat(e.target.value) || 0)}
            placeholder="Enter premium package price"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {getCurrencySymbol(priceData.currency)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Combined Price Edit Form Component
interface CombinedPriceEditFormProps {
  priceData: CombinedPriceData
  onPriceChange: (packageType: 'standard' | 'premium', value: number) => void
  onCurrencyChange: (value: string) => void
  defaultCurrency: string
}

function CombinedPriceEditForm({ priceData, onPriceChange, onCurrencyChange, defaultCurrency }: CombinedPriceEditFormProps) {
  const getCurrencySymbol = (currency: string) => (currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€')
  const currency = priceData.currency || defaultCurrency

  return (
    <div className="space-y-4">
      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Currency *
        </label>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Standard Combined Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Standard Combined Price *
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceData.standardPrice || 0}
            onChange={(e) => onPriceChange('standard', parseFloat(e.target.value) || 0)}
            placeholder="Enter combined standard price"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {getCurrencySymbol(currency)}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 font-['Poppins']">
          Custom price for both sports combined (standard package)
        </p>
      </div>

      {/* Premium Combined Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Premium Combined Price *
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.01"
            value={priceData.premiumPrice || 0}
            onChange={(e) => onPriceChange('premium', parseFloat(e.target.value) || 0)}
            placeholder="Enter combined premium price"
            className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {getCurrencySymbol(currency)}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500 font-['Poppins']">
          Custom price for both sports combined (premium package)
        </p>
      </div>
    </div>
  )
}
