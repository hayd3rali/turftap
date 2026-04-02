import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../services/supabase'

// ── Async Thunks ──────────────────────────────────────────

// Send OTP to phone number
export const sendOTP = createAsyncThunk(
  'user/sendOTP',
  async (phone, { rejectWithValue }) => {
    const { error } = await supabase.auth.signInWithOtp({ phone })
    if (error) return rejectWithValue(error.message)
    return phone
  }
)

// Verify OTP and sign in
export const verifyOTP = createAsyncThunk(
  'user/verifyOTP',
  async ({ phone, token }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    })
    if (error) return rejectWithValue(error.message)
    return data.user
  }
)

// Fetch profile from Supabase profiles table
export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      // If profile doesn't exist yet, return empty object
      // instead of rejecting — prevents crash on new users
      if (error.code === 'PGRST116') return {}
      return rejectWithValue(error.message)
    }
    return data
  }
)

// Update profile in Supabase
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return rejectWithValue('No authenticated user found.')
      }

      // Upsert — works whether profile exists or not
      const { data, error } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, ...profileData },
          { onConflict: 'id' }
        )
        .select('*')
        .single()

      if (error) {
        return rejectWithValue(error.message)
      }

      return data

    } catch (e) {
      return rejectWithValue(e.message || 'Unknown error.')
    }
  }
)

// Sign out
export const signOut = createAsyncThunk(
  'user/signOut',
  async (_, { rejectWithValue }) => {
    const { error } = await supabase.auth.signOut()
    if (error) return rejectWithValue(error.message)
  }
)

// ── Slice ─────────────────────────────────────────────────
const userSlice = createSlice({
  name: 'user',
  initialState: {
    isAuthenticated: false,
    user: null,              // Supabase auth user object
    profile: null,           // profiles table row
    role: null,              // 'Player' | 'Owner'
    profileDetails: null,    // legacy — keep for UI compatibility
    status: 'idle',          // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    otpSent: false,
    phone: null,
  },
  reducers: {
    // Keep legacy actions for UI screens not yet migrated
    login(state, action) {
      state.isAuthenticated = true
      state.role = action.payload.role
      state.profileDetails = action.payload.profileDetails
    },
    logout(state) {
      state.isAuthenticated = false
      state.user = null
      state.profile = null
      state.role = null
      state.profileDetails = null
      state.otpSent = false
      state.phone = null
      state.status = 'idle'
      state.error = null
    },
    setUser(state, action) {
      state.profileDetails = {
        ...state.profileDetails,
        ...action.payload,
      }
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // sendOTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.otpSent = true
        state.phone = action.payload
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

    // verifyOTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })

    // fetchProfile
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.role = action.payload.role
        state.profileDetails = action.payload
      })

    // updateProfile
    builder
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload
        state.profileDetails = action.payload
      })

    // signOut
    builder
      .addCase(signOut.fulfilled, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.profile = null
        state.role = null
        state.profileDetails = null
        state.otpSent = false
        state.phone = null
        state.status = 'idle'
      })
  },
})

export const { login, logout, setUser, clearError } = userSlice.actions
export default userSlice.reducer
