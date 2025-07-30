import React from 'react'
import PackageHero from './components/hero/packagehero'
import PackageTable from './components/package-table/packagetable'
import Reviews from '../home/components/review/reviews'

export default function PackagesPage() {
  return (
    <div>
        <PackageHero />
        <PackageTable />
        <Reviews />
    </div>
  )
}
