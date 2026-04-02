import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../services/supabase'
import { slotsApi } from './slotsService'

export const bookingsApi = createApi({
  reducerPath: 'bookingsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Bookings', 'Slots'],
  endpoints: (builder) => ({

    // Create a new booking
    createBooking: builder.mutation({
      queryFn: async ({ slotIds, courtId, date, amount, payment = 'Venue' }) => {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (userError || !user) return { error: 'Not authenticated' }

          // Check active booking count
          const { data: existingBookings } = await supabase
            .from('bookings')
            .select(`
              id, 
              slot_id, 
              slots ( 
                date, 
                end_time,
                court_id,
                courts ( id )
              )
            `)
            .eq('player_id', user.id)
            .eq('status', 'confirmed')

          if (existingBookings) {
            const now = new Date()

            // Calculate active distinct "sessions" (court + day combinations)
            const activeSessions = new Set()
            existingBookings.forEach(b => {
              const slotDate   = b.slots?.date
              const endTimeStr = b.slots?.end_time
              const slotCourtId = b.slots?.court_id || b.slots?.courts?.id
              
              if (!slotDate || !endTimeStr || !slotCourtId) return

              const [h, m, s] = endTimeStr.split(':').map(Number)
              const slotEnd = new Date(slotDate)
              slotEnd.setHours(h, m, s || 0)

              // Only count if the slot end time is in the future
              if (slotEnd > now) {
                activeSessions.add(`${slotCourtId}-${slotDate}`)
              }
            })

            if (activeSessions.size >= 2) {
              return {
                error: 'You already have 2 active bookings.\n\nComplete or wait for your current bookings to book again.'
              }
            }
          }

          // Insert ALL slots as separate booking rows
          const perSlotAmount = Math.round(amount / slotIds.length)
          const bookingInserts = slotIds.map(slotId => ({
            player_id: user.id,
            slot_id:   slotId,
            status:    'confirmed',
            payment:   payment,
            amount:    perSlotAmount,
          }))

          const { data, error } = await supabase
            .from('bookings')
            .insert(bookingInserts)
            .select('id, slot_id, status, amount, payment, booked_at, player_id')

          if (error) {
            if (error.code === '23505') {
              return { error: 'One or more slots were just booked. Please select different slots.' }
            }
            return { error: error.message }
          }

          return { data: data?.[0] || null }

        } catch (e) {
          return { error: e.message }
        }
      },

      // Invalidate ALL slot queries for this court + date immediately
      invalidatesTags: (result, error, { courtId, date }) => [
        { type: 'Slots', id: `${courtId}-${date}` },
        'Bookings',
      ],
    }),

    // Get player's bookings
    getMyBookings: builder.query({
      queryFn: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return { error: 'Not authenticated' }

          // Step 1: Get all confirmed bookings for this player
          const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, amount, payment, status, booked_at, player_id, slot_id')
            .eq('player_id', user.id)
            .eq('status', 'confirmed')
            .order('booked_at', { ascending: false })

          if (bookingsError) return { error: bookingsError.message }
          if (!bookings?.length) return { data: [] }

          // Step 2: Get all slot IDs
          const slotIds = bookings.map(b => b.slot_id).filter(Boolean)

          // Step 3: Fetch slot details
          const { data: slots } = await supabase
            .from('slots')
            .select('id, date, start_time, end_time, court_id')
            .in('id', slotIds)

          const slotMap = {}
          if (slots) slots.forEach(s => { slotMap[s.id] = s })

          // Step 4: Get court IDs
          const courtIds = [...new Set(
            (slots || []).map(s => s.court_id).filter(Boolean)
          )]

          // Step 5: Fetch court details
          const { data: courts } = await supabase
            .from('courts')
            .select('id, name, area, address, images, price_base, owner_id')
            .in('id', courtIds)

          const courtMap = {}
          if (courts) courts.forEach(c => { courtMap[c.id] = c })

          // Step 6: Fetch owner profiles for phone numbers
          const ownerIds = [...new Set(
            (courts || []).map(c => c.owner_id).filter(Boolean)
          )]
          const { data: ownerProfiles } = await supabase
            .from('profiles')
            .select('id, phone, email, first_name, last_name')
            .in('id', ownerIds)

          const ownerMap = {}
          if (ownerProfiles) ownerProfiles.forEach(p => { ownerMap[p.id] = p })

          // Step 7: Enrich bookings with all data
          const enriched = bookings.map(booking => {
            const slot  = slotMap[booking.slot_id]  || {}
            const court = courtMap[slot.court_id]   || {}
            const owner = ownerMap[court.owner_id]  || null

            return {
              ...booking,
              slots: {
                ...slot,
                courts: {
                  ...court,
                  profiles: owner,
                },
              },
            }
          })

          return { data: enriched }

        } catch (e) {
          return { error: e.message }
        }
      },
      providesTags: ['Bookings'],
    }),

    // Get owner's bookings for their courts
    getOwnerBookings: builder.query({
      queryFn: async () => {
        try {
          const { data: { user }, error: authError } = await supabase.auth.getUser()
          if (authError || !user) return { error: 'Not authenticated' }

          // Step 1: Get owner's courts
          const { data: ownerCourts } = await supabase
            .from('courts')
            .select('id, name')
            .eq('owner_id', user.id)

          if (!ownerCourts?.length) return { data: [] }
          const courtIds = ownerCourts.map(c => c.id)

          // Step 2: Get ALL slots for owner's courts
          const { data: courtSlots } = await supabase
            .from('slots')
            .select('id, date, start_time, end_time, court_id')
            .in('court_id', courtIds)

          if (!courtSlots?.length) return { data: [] }
          const slotIds = courtSlots.map(s => s.id)

          // Step 3: Get ALL confirmed bookings for those slots
          const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('id, amount, payment, status, booked_at, player_id, slot_id')
            .in('slot_id', slotIds)
            .eq('status', 'confirmed')
            .order('booked_at', { ascending: false })

          if (bookingsError) return { error: bookingsError.message }
          if (!bookings?.length) return { data: [] }

          // Step 4: Build slot lookup map
          const slotMap = {}
          courtSlots.forEach(s => { slotMap[s.id] = s })

          // Step 5: Build court lookup map
          const courtMap = {}
          ownerCourts.forEach(c => { courtMap[c.id] = c })

          // Step 6: Get unique player IDs
          const playerIds = [...new Set(bookings.map(b => b.player_id).filter(Boolean))]

          // Step 7: Fetch player profiles
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, phone, email')
            .in('id', playerIds)

          const profileMap = {}
          if (profiles) profiles.forEach(p => { profileMap[p.id] = p })

          // Step 8: Enrich ALL bookings with slot, court, player data
          const enriched = bookings.map(booking => {
            const slot    = slotMap[booking.slot_id] || {}
            const court   = courtMap[slot.court_id]  || {}
            const player  = profileMap[booking.player_id] || null

            return {
              ...booking,
              playerData: player,
              slots: {
                ...slot,
                courts: court,
              },
            }
          })

          return { data: enriched }

        } catch (e) {
          return { error: e.message }
        }
      },
      providesTags: ['Bookings'],
    }),

  }),
})

export const {
  useCreateBookingMutation,
  useGetMyBookingsQuery,
  useGetOwnerBookingsQuery,
} = bookingsApi
