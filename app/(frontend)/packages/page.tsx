import React from 'react'
import PackageHero from './components/hero/packagehero'
import PackageTable from './components/package-table/packagetable'
import Reviews from '../home/components/review/reviews'
import HowManyTotal from '../book/components/step4/howmanytotal'
import LeagueStep from '../book/components/step5/leaguestep'
import DateSection from '../book/components/step6/datesection'
import FlightSchedule from '../book/components/step7/flightschedule'
import Extras from '../book/components/step8/extras'
import Personalinfo from '../book/components/step9/personalinfo'
import Payment from '../book/components/step10/payment'
import RemoveLeague from '../book/components/step5-5/removeleague'

export default function PackagesPage() {
  return (
    <div>
        <PackageHero />
        <PackageTable />
        <HowManyTotal />
        <LeagueStep />
        <RemoveLeague />
        <DateSection />
        <FlightSchedule />
        <Extras />
        <Personalinfo />
        <Payment />
        <Reviews />
    </div>
  )
}
