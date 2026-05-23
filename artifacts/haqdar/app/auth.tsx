import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    if (mode === "signup") {
      const { error: err } = await signUp(email.trim(), password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      }
    } else {
      const { error: err } = await signIn(email.trim(), password);
      setLoading(false);
      if (err) {
        setError(err);
      } else {
        router.replace("/pin");
      }
    }
  };

  const skipAuth = () => {
    router.replace("/pin");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? 80 : insets.top + 32,
            paddingBottom: Platform.OS === "web" ? 48 : insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={[styles.logo, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground }]}>HaqDar / حق دار</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Cloud backup keeps your evidence safe across devices
          </Text>
          <Text style={[styles.urduTagline, { color: colors.mutedForeground }]}>
            کلاؤڈ بیک اپ آپ کے شواہد محفوظ رکھتا ہے
          </Text>
        </View>

        {/* Toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          {(["signin", "signup"] as Mode[]).map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.toggleBtn,
                mode === m && { backgroundColor: colors.primary },
              ]}
              onPress={() => { setMode(m); setError(""); setSuccess(""); }}
            >
              <Text
                style={[
                  styles.toggleText,
                  { color: mode === m ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Password (min 6 characters)"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#FFF0F0", borderColor: colors.destructive }]}>
              <Feather name="alert-circle" size={13} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={[styles.successBox, { backgroundColor: "#F0FFF4", borderColor: "#1A7A4A" }]}>
              <Feather name="check-circle" size={13} color="#1A7A4A" />
              <Text style={[styles.successText, { color: "#1A7A4A" }]}>{success}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name={mode === "signin" ? "log-in" : "user-plus"} size={18} color="#FFFFFF" />
                <Text style={styles.submitText}>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Skip */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity
          style={[styles.skipBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
          onPress={skipAuth}
          activeOpacity={0.8}
        >
          <Feather name="smartphone" size={16} color={colors.mutedForeground} />
          <Text style={[styles.skipText, { color: colors.mutedForeground }]}>
            Use locally only (no cloud backup)
          </Text>
        </TouchableOpacity>

        <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
          Your data is encrypted in transit. Only you can access your records. Supabase Row Level Security ensures each account only sees its own data.{"\n"}
          آپ کا ڈیٹا صرف آپ کا ہے۔
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    gap: 20,
  },
  brand: {
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700" as const,
    textAlign: "center",
  },
  tagline: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  urduTagline: {
    fontSize: 12,
    textAlign: "center",
  },
  toggle: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  form: {
    gap: 12,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  privacyNote: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
  },
});
