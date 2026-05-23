import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Vibration,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface Props {
  onSecretTriggered: () => void;
}

type BtnType = "digit" | "operator" | "special" | "equals";

interface CalcBtn {
  label: string;
  type: BtnType;
  wide?: boolean;
}

const BUTTONS: CalcBtn[][] = [
  [
    { label: "AC", type: "special" },
    { label: "+/-", type: "special" },
    { label: "%", type: "special" },
    { label: "÷", type: "operator" },
  ],
  [
    { label: "7", type: "digit" },
    { label: "8", type: "digit" },
    { label: "9", type: "digit" },
    { label: "×", type: "operator" },
  ],
  [
    { label: "4", type: "digit" },
    { label: "5", type: "digit" },
    { label: "6", type: "digit" },
    { label: "−", type: "operator" },
  ],
  [
    { label: "1", type: "digit" },
    { label: "2", type: "digit" },
    { label: "3", type: "digit" },
    { label: "+", type: "operator" },
  ],
  [
    { label: "0", type: "digit", wide: true },
    { label: ".", type: "digit" },
    { label: "=", type: "equals" },
  ],
];

export default function Calculator({ onSecretTriggered }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [secretBuffer, setSecretBuffer] = useState("");

  const checkSecret = useCallback(
    (newBuffer: string) => {
      if (newBuffer.endsWith("9911=")) {
        onSecretTriggered();
        setSecretBuffer("");
        return true;
      }
      return false;
    },
    [onSecretTriggered]
  );

  const haptic = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePress = useCallback(
    (btn: CalcBtn) => {
      haptic();

      if (btn.type === "digit") {
        const digit = btn.label;
        const nb = secretBuffer + digit;
        setSecretBuffer(nb);
        checkSecret(nb);

        if (waitingForOperand) {
          setDisplay(digit === "." ? "0." : digit);
          setWaitingForOperand(false);
        } else {
          setDisplay((prev) => {
            if (digit === "." && prev.includes(".")) return prev;
            if (prev === "0" && digit !== ".") return digit;
            return prev + digit;
          });
        }
        return;
      }

      if (btn.type === "special") {
        if (btn.label === "AC") {
          setDisplay("0");
          setPrevValue(null);
          setOperator(null);
          setWaitingForOperand(false);
          setSecretBuffer("");
        } else if (btn.label === "+/-") {
          setDisplay((prev) =>
            prev.startsWith("-") ? prev.slice(1) : "-" + prev
          );
        } else if (btn.label === "%") {
          setDisplay((prev) => String(parseFloat(prev) / 100));
        }
        return;
      }

      if (btn.type === "operator") {
        const nb = secretBuffer + btn.label;
        setSecretBuffer(nb);
        const current = parseFloat(display);
        if (prevValue !== null && operator && !waitingForOperand) {
          const result = calculate(prevValue, current, operator);
          setDisplay(String(result));
          setPrevValue(result);
        } else {
          setPrevValue(current);
        }
        setOperator(btn.label);
        setWaitingForOperand(true);
        return;
      }

      if (btn.type === "equals") {
        const nb = secretBuffer + "=";
        const triggered = checkSecret(nb);
        if (!triggered) setSecretBuffer(nb);

        const current = parseFloat(display);
        if (prevValue !== null && operator) {
          const result = calculate(prevValue, current, operator);
          setDisplay(String(result));
          setPrevValue(null);
          setOperator(null);
          setWaitingForOperand(true);
        }
      }
    },
    [display, prevValue, operator, waitingForOperand, secretBuffer, checkSecret]
  );

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const formatDisplay = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    if (Math.abs(num) > 1e12) return num.toExponential(4);
    const formatted = parseFloat(num.toPrecision(10)).toString();
    return val.endsWith(".") ? formatted + "." : formatted;
  };

  const displayLen = formatDisplay(display).length;
  const fontSize = displayLen > 12 ? 36 : displayLen > 8 ? 52 : 72;

  const btnBg = (type: BtnType) => {
    if (type === "operator" || type === "equals") return colors.calcOperator;
    if (type === "special") return colors.calcSpecial;
    return colors.calcDigit;
  };

  const btnTextColor = (type: BtnType) => {
    if (type === "special") return colors.calcText;
    return colors.calcText;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.calcBackground,
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
        },
      ]}
    >
      <View style={styles.display}>
        <Text
          style={[styles.displayText, { fontSize, color: colors.calcDisplayText }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatDisplay(display)}
        </Text>
      </View>
      <View style={styles.buttons}>
        {BUTTONS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((btn) => (
              <TouchableOpacity
                key={btn.label}
                style={[
                  styles.btn,
                  btn.wide && styles.btnWide,
                  { backgroundColor: btnBg(btn.type) },
                ]}
                onPress={() => handlePress(btn)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.btnText,
                    (btn.type === "operator" || btn.type === "equals") && styles.btnTextOperator,
                    btn.type === "special" && styles.btnTextSpecial,
                    { color: btnTextColor(btn.type) },
                  ]}
                >
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const BTN_SIZE = 80;
const BTN_GAP = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
  },
  display: {
    paddingHorizontal: 8,
    paddingBottom: 24,
    alignItems: "flex-end",
  },
  displayText: {
    fontWeight: "200" as const,
    letterSpacing: -2,
  },
  buttons: {
    gap: BTN_GAP,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: BTN_GAP,
    justifyContent: "center",
  },
  btn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  btnWide: {
    width: BTN_SIZE * 2 + BTN_GAP,
    alignItems: "flex-start",
    paddingLeft: 28,
  },
  btnText: {
    fontSize: 30,
    fontWeight: "400" as const,
  },
  btnTextOperator: {
    fontSize: 34,
    fontWeight: "300" as const,
  },
  btnTextSpecial: {
    fontSize: 26,
    fontWeight: "500" as const,
  },
});
