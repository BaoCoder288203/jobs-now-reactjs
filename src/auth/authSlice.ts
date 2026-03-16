import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthResponse } from '@/types';
import * as authService from '@/services/auth.service';
import type { RegisterData } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  unreadMessageCount: number;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  unreadMessageCount: 0,
};

function toUser(res: AuthResponse): User {
  return {
    userId: res.userId,
    email: res.email,
    fullName: res.fullName,
    phone: res.phone,
    role: res.role,
    avatar: res.avatar,
    profileId: res.profileId,
    companyId: res.companyId,
    companyName: res.companyName,
  };
}

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

export const googleLoginAsync = createAsyncThunk(
  'auth/googleLogin',
  async (idToken: string, { rejectWithValue }) => {
    try {
      const result = await authService.googleLogin(idToken);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng nhập Google thất bại');
    }
  }
);

export const loginByOtpAsync = createAsyncThunk(
  'auth/loginByOtp',
  async (
    { email, otp }: { email: string; otp: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await authService.loginByOtp(email, otp);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Xác thực OTP thất bại');
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
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setUnreadMessageCount: (state, action: PayloadAction<number>) => {
      state.unreadMessageCount = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.unreadMessageCount = 0;
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
        state.user = toUser(action.payload);
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(googleLoginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLoginAsync.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = toUser(action.payload);
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(googleLoginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      .addCase(loginByOtpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginByOtpAsync.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = toUser(action.payload);
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginByOtpAsync.rejected, (state, action) => {
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
        state.user = toUser(action.payload);
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUserAsync.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
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
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUser, clearAuth, setUnreadMessageCount } = authSlice.actions;
export default authSlice.reducer;