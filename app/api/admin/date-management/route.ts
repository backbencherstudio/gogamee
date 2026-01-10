import { NextRequest, NextResponse } from 'next/server'
import { getAllDates, createDate } from "../../../../backendgogame/actions/dateManagement"
import { toErrorMessage } from "../../../../backendgogame/lib/errors"

export const dynamic = "force-dynamic"
export const revalidate = 0

// GET all date management entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const league = searchParams.get('league')
    
    const allDates = await getAllDates()
    
    // Filter by date and league if provided
    let filteredDates = allDates.filter(entry => !entry.deleted_at)
    
    if (date) {
      filteredDates = filteredDates.filter(entry => entry.date.startsWith(date))
    }
    
    if (league) {
      filteredDates = filteredDates.filter(entry => entry.league === league)
    }
    
    // Return in format expected by service
    return NextResponse.json(filteredDates, {
      headers: { 
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      },
    })
  } catch (error) {
    console.error('Error fetching date management data:', error)
    return NextResponse.json(
      { success: false, message: toErrorMessage(error, 'Failed to fetch date management data') },
      { status: 500 }
    )
  }
}

// POST create new date management entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const created = await createDate(body)
    
    // Return the created item directly (service expects this format)
    return NextResponse.json(created, {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    console.error('Error creating date management entry:', error)
    return NextResponse.json(
      { success: false, message: toErrorMessage(error, 'Failed to create date management entry') },
      { status: 500 }
    )
  }
}
