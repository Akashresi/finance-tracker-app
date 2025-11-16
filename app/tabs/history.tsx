// app/tabs/history.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import AppButton from "../../components/AppButton"; // ✅ Correct Path
import ScreenWrapper from "../../components/ScreenWrapper"; // ✅ Correct Path
import { COLORS, SIZING } from "../../constants/theme"; // ✅ Correct Path

// ✅ FIX: Added missing type definition
type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  category: string;
  source: "bank" | "cash";
  note?: string;
  timestamp: string;
};

const STORAGE_KEY = "@transactions";

export default function HistoryTab() {
  // ✅ FIX: Added missing state definitions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [credits, setCredits] = useState<Transaction[]>([]);
  const [debits, setDebits] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"credit" | "debit">("debit");
  
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  // ✅ FIX: Added missing functions
  const loadHistory = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Transaction[] = JSON.parse(raw);
        setTransactions(parsed);
        setCredits(parsed.filter((t) => t.type === "credit"));
        setDebits(parsed.filter((t) => t.type === "debit"));
      } else {
        setTransactions([]);
        setCredits([]);
        setDebits([]);
      }
    } catch (e) {
      console.warn("Error loading history", e);
    }
  };

  const clearHistory = async () => {
    Alert.alert("Confirm", "Do you really want to clear all history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setTransactions([]);
          setCredits([]);
          setDebits([]);
          Alert.alert("History cleared");
        },
      },
    ]);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.txRow}>
      <View>
        <Text style={styles.txCategory}>{item.category}</Text>
        <Text style={styles.txNote}>{item.note}</Text>
        <Text style={styles.txTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          item.type === "credit" ? styles.credit : styles.debit,
        ]}
      >
        {item.type === "credit" ? "+" : "-"} ₹{item.amount.toFixed(2)}
      </Text>
    </View>
  );

  const currentData = activeTab === "credit" ? credits : debits;

  return (
    <ScreenWrapper>
      <Text style={styles.header}>Transaction History</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "credit" && styles.toggleButtonActiveGreen,
          ]}
          onPress={() => setActiveTab("credit")}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "credit" && styles.toggleTextActive,
            ]}
          >
            Balance Added
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "debit" && styles.toggleButtonActiveRed,
          ]}
          onPress={() => setActiveTab("debit")}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "debit" && styles.toggleTextActive,
            ]}
          >
            Spending
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        {currentData.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === "credit"
              ? "No balance additions yet."
              : "No spending history yet."}
          </Text>
        ) : (
          <FlatList
            data={currentData}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
          />
        )}
      </View>

      {transactions.length > 0 && (
        <AppButton
          title="Clear All History"
          onPress={clearHistory}
          variant="danger"
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: SIZING.h1,
    fontWeight: "700",
    marginBottom: SIZING.md,
    textAlign: "center",
    color: COLORS.text,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SIZING.md,
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.grayMedium,
    borderRadius: SIZING.radius,
    alignItems: "center",
  },
  toggleButtonActiveGreen: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  toggleButtonActiveRed: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  toggleText: {
    fontSize: SIZING.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  section: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZING.radius,
    padding: SIZING.md,
    marginBottom: SIZING.lg,
  },
  emptyText: { // ✅ FIX: Added missing style
    textAlign: "center",
    color: COLORS.grayDark,
    marginVertical: 20,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayMedium,
  },
  txCategory: { fontWeight: "700", color: COLORS.text },
  txNote: { color: COLORS.grayDark },
  txTime: { color: COLORS.grayDark, fontSize: SIZING.small },
  txAmount: { fontWeight: "700", textAlign: "right" },
  credit: { color: COLORS.success },
  debit: { color: COLORS.danger },
});