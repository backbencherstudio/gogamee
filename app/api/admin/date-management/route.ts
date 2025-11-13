import { NextRequest, NextResponse } from 'next/server'

// In-memory data store (replace with persistent storage in production)
type DateManagementEntry = {
  id: string
  key: string
  date: string
  status: string
  standard_package_price: number | null
  premium_package_price: number | null
  package: string | null
  sportname: string | null
  league: string | null
  notes: string | null
  destinationCity: string | null
  assignedMatch: string | null
  approve_status: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

const dateManagementData: DateManagementEntry[] = []

const buildEntryKey = (data: Partial<DateManagementEntry>) => {
  const date = data.date ?? ''
  const league = data.league ?? 'general'
  const sport = data.sportname ?? 'general'
  return `${date}|${league}|${sport}`
}

// GET all date management entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const league = searchParams.get('league')
    
    const activeEntries = dateManagementData.filter(entry => !entry.deleted_at)
    const filteredEntries = activeEntries.filter(entry => {
      const matchesDate = date ? entry.date.startsWith(date) : true
      const matchesLeague = league ? entry.league === league : true
      return matchesDate && matchesLeague
    })
    
    // Get all entries
    return NextResponse.json({
      success: true,
      data: filteredEntries
    })
  } catch (error) {
    console.error('Error fetching date management data:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch date management data' },
      { status: 500 }
    )
  }
}

// POST create new date management entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const timestamp = new Date().toISOString()
    const newEntry: DateManagementEntry = {
      id: Date.now().toString(),
      key: buildEntryKey(body),
      date: body.date,
      status: body.status || 'neutral',
      standard_package_price: body.standard_package_price ?? null,
      premium_package_price: body.premium_package_price ?? null,
      package: body.package ?? null,
      sportname: body.sportname ?? null,
      league: body.league ?? null,
      notes: body.notes ?? null,
      destinationCity: body.destinationCity ?? null,
      assignedMatch: body.assignedMatch ?? null,
      approve_status: body.approve_status ?? 'pending',
      created_at: timestamp,
      updated_at: timestamp,
      deleted_at: null
    }
    
    // Check if entry already exists for this date
    const existingIndex = dateManagementData.findIndex(item => item.key === newEntry.key)
    
    if (existingIndex >= 0) {
      // Update existing entry
      dateManagementData[existingIndex] = {
        ...dateManagementData[existingIndex],
        ...newEntry,
        id: dateManagementData[existingIndex].id,
        created_at: dateManagementData[existingIndex].created_at,
        deleted_at: null
      }
    } else {
      // Add new entry
      dateManagementData.push(newEntry)
    }
    
    return NextResponse.json({
      success: true,
      data: existingIndex >= 0 ? dateManagementData[existingIndex] : newEntry,
      message: 'Date management entry saved successfully'
    })
  } catch (error) {
    console.error('Error creating date management entry:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create date management entry' },
      { status: 500 }
    )
  }
}

// PATCH update date management entry
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body
    
    const entryIndex = dateManagementData.findIndex(item => item.id === id && !item.deleted_at)
    
    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Date management entry not found' },
        { status: 404 }
      )
    }
    
    // Update the entry
    const updatedEntry: DateManagementEntry = {
      ...dateManagementData[entryIndex],
      ...updateData,
      key: buildEntryKey({ ...dateManagementData[entryIndex], ...updateData }),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }

    dateManagementData[entryIndex] = updatedEntry
    
    return NextResponse.json({
      success: true,
      data: dateManagementData[entryIndex],
      message: 'Date management entry updated successfully'
    })
  } catch (error) {
    console.error('Error updating date management entry:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update date management entry' },
      { status: 500 }
    )
  }
}

// DELETE date management entry
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }
    
    const entryIndex = dateManagementData.findIndex(item => item.id === id)
    
    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Date management entry not found' },
        { status: 404 }
      )
    }
    
    // Hard delete to prevent stale records
    dateManagementData.splice(entryIndex, 1)
    
    return NextResponse.json({
      success: true,
      message: 'Date management entry deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting date management entry:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete date management entry' },
      { status: 500 }
    )
  }
}
