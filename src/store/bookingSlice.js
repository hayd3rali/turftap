import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { config } from '../config/env';

export const fetchCourts = createAsyncThunk('booking/fetchCourts', async () => {
  // TODO: replace URL with /api/v1/courts when backend is ready
  const response = await axios.get(`${config.apiBaseUrl}/posts`);
  return response.data;
});

const initialState = {
  courts: [],
  status: 'idle',
  error: null,
  confirmedBooking: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    confirmBooking(state, action) {
      state.confirmedBooking = action.payload;
      state.status = 'confirmed';
    },
    resetBooking(state) {
      state.confirmedBooking = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.courts = action.payload;
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load courts';
      });
  },
});

export const { confirmBooking, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;

