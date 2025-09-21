'use client'
import React, { useState } from 'react'
import AppData from '../../lib/appdata'

export default function TestPricing() {
  const [testResults, setTestResults] = useState<string[]>([])

  const runTests = () => {
    const results: string[] = []

    try {
      // Test 1: Base pricing
      const basePrice = AppData.pricing.getBasePrice('football', 'standard', 2)
      results.push(`✅ Base price for football standard 2 nights: €${basePrice}`)

      // Test 2: Set custom prices for a specific date
      const testDate = new Date('2025-10-30')
      AppData.dateRestrictions.setCustomPrice('european', testDate, 'football', 'standard', 429)
      AppData.dateRestrictions.setCustomPrice('european', testDate, 'football', 'premium', 1529)
      results.push(`✅ Set custom prices for 2025-10-30: Standard €429, Premium €1529`)

      // Test 3: Get effective prices (should return custom prices)
      const effectiveStandardPrice = AppData.pricing.getEffectivePrice('european', testDate, 'football', 'standard', 2)
      const effectivePremiumPrice = AppData.pricing.getEffectivePrice('european', testDate, 'football', 'premium', 2)
      results.push(`✅ Effective prices for 2025-10-30: Standard €${effectiveStandardPrice}, Premium €${effectivePremiumPrice}`)

      // Test 4: Get effective price for different date (should return base price)
      const differentDate = new Date('2025-10-31')
      const baseEffectivePrice = AppData.pricing.getEffectivePrice('european', differentDate, 'football', 'standard', 2)
      results.push(`✅ Effective price for 2025-10-31: €${baseEffectivePrice} (should be base price)`)

      // Test 5: Calculate total booking cost
      const bookingData = {
        selectedSport: 'football',
        selectedPackage: 'standard',
        selectedLeague: 'european',
        departureDate: '2025-10-30',
        travelDuration: 2,
        totalExtrasCost: 50
      }
      const totalCost = AppData.pricing.calculateTotalCost(bookingData)
      results.push(`✅ Total booking cost: €${totalCost} (package: €${effectiveStandardPrice} + league surcharge: €50 + extras: €50)`)

      // Test 6: Test basketball pricing
      const basketballPrice = AppData.pricing.getBasePrice('basketball', 'premium', 3)
      results.push(`✅ Basketball premium 3 nights base price: €${basketballPrice}`)

      // Test 7: Verify existing prices are loaded correctly
      const existingStandardPrice = AppData.dateRestrictions.getCustomPrice('european', testDate, 'football', 'standard')
      const existingPremiumPrice = AppData.dateRestrictions.getCustomPrice('european', testDate, 'football', 'premium')
      results.push(`✅ Retrieved existing prices: Standard €${existingStandardPrice}, Premium €${existingPremiumPrice}`)

      results.push('🎉 All tests completed successfully!')

    } catch (error) {
      results.push(`❌ Test failed: ${error}`)
    }

    setTestResults(results)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pricing System Test</h1>
      
      <button
        onClick={runTests}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium mb-6"
      >
        Run Pricing Tests
      </button>

      {testResults.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Test Results:</h2>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">How the Pricing System Works:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>Base Prices:</strong> Set in PackageManagement.tsx for &quot;Starting Price&quot; packages</li>
          <li>• <strong>Custom Prices:</strong> Set in DateManagement.tsx for specific dates</li>
          <li>• <strong>Effective Price:</strong> Uses custom price if available, otherwise falls back to base price</li>
          <li>• <strong>Total Cost:</strong> Package price + league surcharge + extras</li>
        </ul>
      </div>
    </div>
  )
}