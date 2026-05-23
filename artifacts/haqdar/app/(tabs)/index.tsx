import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import Calculator from "@/components/Calculator";
import { useVault } from "@/context/VaultContext";

export default function CalculatorScreen() {
  const { pinIsSet } = useVault();

  const handleSecretTriggered = () => {
    if (pinIsSet) {
      router.push("/pin");
    } else {
      router.push("/pin-setup");
    }
  };

  return (
    <View style={styles.container}>
      <Calculator onSecretTriggered={handleSecretTriggered} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
});
