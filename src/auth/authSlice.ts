import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse } from '@/types';
import * as authService from '@/services/auth.service';
import type { RegisterData } from '@/services/auth.service';

interface AuthState {
  userId: number | null;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: string | null;
  avatar: string | null;
  profileId: number | null;
  companyId: number | null;
  companyName: string | null;

  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  fullName: null,
  phone: null,
  role: null,
  avatar: null,
  profileId: null,
  companyId: null,
  companyName: null,

  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};


export const loginAsync = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await authService.login(email, password);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);

export const getCurrentUserAsync = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const result = await authService.getCurrentUser();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Không thể tải thông tin user');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const message = await authService.register(data);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng ký thất bại');
    }
  }
);

export const verifyOtpAsync = createAsyncThunk(
  'auth/verifyOtp',
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const message = await authService.verifyOtp(email, otp);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Xác thực OTP thất bại');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng xuất thất bại');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.userId = null;
      state.email = null;
      state.fullName = null;
      state.phone = null;
      state.role = null;
      state.avatar = null;
      state.profileId = null;
      state.companyId = null;
      state.companyName = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.fullName = action.payload.fullName;
        state.phone = action.payload.phone;
        state.role = action.payload.role;
        state.avatar = action.payload.avatar;
        state.profileId = action.payload.profileId;
        state.companyId = action.payload.companyId;
        state.companyName = action.payload.companyName;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });
    
    builder
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUserAsync.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.fullName = action.payload.fullName;
        state.phone = action.payload.phone;
        state.role = action.payload.role;
        state.avatar = action.payload.avatar;
        state.profileId = action.payload.profileId;
        state.companyId = action.payload.companyId;
        state.companyName = action.payload.companyName;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUserAsync.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('token');
      });

    builder
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(verifyOtpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(logoutAsync.fulfilled, (state) => {
        state.userId = null;
        state.email = null;
        state.fullName = null;
        state.phone = null;
        state.role = null;
        state.avatar = null;
        state.profileId = null;
        state.companyId = null;
        state.companyName = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;