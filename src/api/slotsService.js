import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../services/supabase'

export const slotsApi = createApi({
  reducerPath: 'slotsApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Slots'],
  keepUnusedDataFor: 0, // don't cache slots at all
  endpoints: (builder) => ({

    // Get slots for a court on a specific date
    getSlots: builder.query({
      queryFn: async ({ courtId, date }) => {
        try {
          // Step 1: Try to get slots using the database function
          // This function returns is_booked as a simple boolean
          // No complex joins — 100% reliable
          const { data: slots, error: fnError } = await supabase
            .rpc('get_slots_with_bookings', {
              p_court_id: courtId,
              p_date:     date,
            })

          // Step 2: If slots exist return them
          if (!fnError && slots && slots.length > 0) {
            return { data: slots }
          }

          // Step 3: If no slots exist generate them first
          await supabase.rpc('generate_slots_for_court', {
            p_court_id: courtId,
            p_date:     date,
          })

          // Step 4: Fetch again after generating
          const { data: newSlots, error: newError } = await supabase
            .rpc('get_slots_with_bookings', {
              p_court_id: courtId,
              p_date:     date,
            })

          if (newError) return { error: newError.message }
          return { data: newSlots || [] }

        } catch (e) {
          return { error: e.message }
        }
      },
      providesTags: (result, error, { courtId, date }) => [
        { type: 'Slots', id: `${courtId}-${date}` }
      ],
      keepUnusedDataFor: 0,
    }),

  }),
})

export const { useGetSlotsQuery } = slotsApi
