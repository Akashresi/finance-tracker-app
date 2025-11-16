// app/login.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import api from "../api/api";
import AppButton from "../components/AppButton"; // ✅ Correct Path
import AppTextInput from "../components/AppTextInput"; // ✅ Correct Path
import ScreenWrapper from "../components/ScreenWrapper"; // ✅ Correct Path
import { useAuth } from "../contexts/AuthContext";
import { COLORS, SIZING } from "../constants/theme"; // ✅ Correct Path

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data && res.data.user) {
        const user = res.data.user;
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        
        login(user.id, "", user); 

        Alert.alert("Login successful");
        router.replace("/tabs");
      } else {
        Alert.alert("Login failed", "Unexpected response from server.");
      }
    } catch (error: any) {
      console.log("Login error:", error?.response?.data?.detail || error.message);
      Alert.alert("Login failed", error?.response?.data?.detail || "Please check your email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.container}> 
      <Text style={styles.title}>Welcome Back!</Text>

      <AppTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <AppTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <AppButton
        title="Login"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push("/signup")} style={styles.signupLink}>
        <Text style={styles.signupText}>
          Don’t have an account?{" "}
          <Text style={styles.signupLinkText}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  title: {
    fontSize: SIZING.h1,
    fontWeight: "700",
    marginBottom: SIZING.xl,
    textAlign: "center",
    color: COLORS.text,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: SIZING.md,
  },
  signupText: { 
    textAlign: "center", 
    fontSize: SIZING.body,
    color: COLORS.grayDark,
  },
  signupLinkText: { 
    color: COLORS.primary, 
    fontWeight: "600" 
  },
});