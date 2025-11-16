// app/signup.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import api from "../api/api"; // ✅ Correct Path
import AppButton from "../components/AppButton"; // ✅ Correct Path
import AppTextInput from "../components/AppTextInput"; // ✅ Correct Path
import ScreenWrapper from "../components/ScreenWrapper"; // ✅ Correct Path
import { useAuth } from "../contexts/AuthContext"; // ✅ Correct Path
import { COLORS, SIZING } from "../constants/theme"; // ✅ Correct Path

export default function Signup() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validateAndSubmit = async () => {
    if (!name || !email || !dob || !age || !gender || !password) {
      Alert.alert("All fields are required");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      Alert.alert("Date of birth must be YYYY-MM-DD");
      return;
    }

    const payload = {
      name,
      email,
      password,
      date_of_birth: dob,
      age: parseInt(age, 10),
      gender,
    };

    setLoading(true);
    try {
      const res = await api.post("/auth/register", payload);

      if (res.data && res.data.user) {
        const user = res.data.user;
        await AsyncStorage.setItem("@user", JSON.stringify(user));
        login(user.id, "", user);
        
        Alert.alert("Registered", "You are now logged in.", [
          { text: "OK", onPress: () => router.replace("/tabs") },
        ]);
      } else {
        Alert.alert("Registration failed");
      }
    } catch (err: any) {
      console.warn(err);
      const message = err?.response?.data?.detail || err.message || "Error registering";
      Alert.alert("Error", message.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable> 
      <Text style={styles.title}>Create account</Text>

      <AppTextInput placeholder="Full name" value={name} onChangeText={setName} />
      <AppTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AppTextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <AppTextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
      />
      <AppTextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <AppTextInput
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />

      <AppButton
        title="Register"
        onPress={validateAndSubmit}
        loading={loading}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginLink}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLinkText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: SIZING.h1,
    fontWeight: "700",
    marginBottom: SIZING.lg,
    textAlign: "center",
    color: COLORS.text,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: SIZING.sm,
  },
  loginText: {
    fontSize: SIZING.body,
    color: COLORS.grayDark,
  },
  loginLinkText: {
    color: COLORS.primary,
    fontWeight: '600',
  }
});