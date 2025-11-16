// frontend/api/api.ts
import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_API_URL = "http://10.63.3.210:8000"; // 👈 Your PC's IP

const apiUrl =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.REACT_NATIVE_API_URL ||
  LOCAL_API_URL;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ ENHANCEMENT: Use an interceptor to automatically add auth tokens
// or user data as needed.
api.interceptors.request.use(
  async (config) => {
    // In a real JWT flow, you'd store and retrieve a token.
    // const token = await AsyncStorage.getItem("@token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    // For your app's flow (e.g., saving goals), we need the user_id.
    // This isn't a great pattern, but it matches your backend needs
    // for the PATCH request on savings.
    if (config.method === 'patch' && config.url?.includes('/goals/')) {
        const userRaw = await AsyncStorage.getItem("@user");
        if (userRaw) {
            const user = JSON.parse(userRaw);
            // Add user_id as a query param as required by your new backend
            config.params = { ...config.params, user_id: user.id };
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;