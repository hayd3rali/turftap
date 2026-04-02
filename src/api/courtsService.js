import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../services/supabase'

export const courtsApi = createApi({
  reducerPath: 'courtsApi',
  baseQuery: fakeBaseQuery(),   // using Supabase directly, not REST
  tagTypes: ['Courts', 'Court'],
  endpoints: (builder) => ({

    // Fetch all active courts (optional area filter)
    getCourts: builder.query({
      queryFn: async (area) => {
        try {
          let query = supabase
            .from('courts')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })

          if (area && area !== 'All') {
            query = query.ilike('area', `%${area}%`)
          }

          const { data, error } = await query
          if (error) return { error: error.message }
          return { data: data || [] }
        } catch (e) {
          return { error: e.message }
        }
      },
      providesTags: ['Courts'],
    }),

    // Fetch single court by ID
    getCourtById: builder.query({
      queryFn: async (courtId) => {
        try {
          const { data, error } = await supabase
            .from('courts')
            .select('*')
            .eq('id', courtId)
            .single()
          if (error) return { error: error.message }
          return { data }
        } catch (e) {
          return { error: e.message }
        }
      },
      providesTags: (result, error, id) => [{ type: 'Court', id }],
    }),

    // Fetch courts by owner
    getOwnerCourts: builder.query({
      queryFn: async (ownerId) => {
        try {
          const { data, error } = await supabase
            .from('courts')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false })
          if (error) return { error: error.message }
          return { data: data || [] }
        } catch (e) {
          return { error: e.message }
        }
      },
      providesTags: ['Courts'],
    }),

  }),
})

export const {
  useGetCourtsQuery,
  useGetCourtByIdQuery,
  useGetOwnerCourtsQuery,
} = courtsApi
