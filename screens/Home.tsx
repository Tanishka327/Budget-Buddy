import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ScrollView } from "react-native";
import AddTransaction from "../components/AddTransaction";
import SummaryGraphCard from "../components/SummaryGraphCard";

import { db } from "../Firebase/FirebaseConfi";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  getDoc,
} from "firebase/firestore";

import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

// Transaction Type
interface Transaction {
  id: string;
  amount: number;
  type: "Income" | "Expense";
  description: string;
  date: number;
  category_id: string;
  categoryName: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const auth = getAuth(); // get current user

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return; // no user logged in

    // USER-SPECIFIC QUERY
    const q = query(
      collection(db, "users", uid, "transactions"),
      orderBy("date", "desc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const list: Transaction[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();

        // Get category name
        let categoryName = "Unknown";
        if (data.category_id) {
          const catRef = doc(db, "categories", data.category_id);
          const catSnap = await getDoc(catRef);
          if (catSnap.exists()) categoryName = catSnap.data().name;
        }

        list.push({
          id: docSnap.id,
          amount: data.amount,
          type: data.type,
          description: data.description,
          date: data.date,
          category_id: data.category_id,
          categoryName,
        });
      }

      setTransactions(list);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <ScrollView style={{ flex: 1, padding: 15 }}>
      {/* ADD TRANSACTION */}
      <AddTransaction />

      {/* GRAPH */}
      <SummaryGraphCard transactions={transactions} />

      <Text style={{ marginTop: 20, fontWeight: "700", fontSize: 20 }}>
        Recent Transactions
      </Text>

      <FlatList
        data={transactions}
        scrollEnabled={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "white",
              padding: 15,
              borderRadius: 15,
              marginTop: 12,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            {/* LEFT SIDE */}
            <View
              style={{
                width: 70,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={item.type === "Income" ? "add-circle" : "remove-circle"}
                size={30}
                color={item.type === "Income" ? "green" : "red"}
              />

              <Text
                style={{
                  fontWeight: "900",
                  fontSize: 22,
                  color: item.type === "Income" ? "green" : "red",
                }}
              >
                ₹{item.amount}
              </Text>
            </View>

            {/* RIGHT SIDE */}
            <View style={{ flex: 1, paddingLeft: 15 }}>
              <Text style={{ fontWeight: "700", fontSize: 16 }}>
                {item.description || "Transaction"}
              </Text>

              <Text style={{ color: "gray", fontSize: 12 }}>
                {formatDate(item.date)}
              </Text>

              {/* CATEGORY */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  backgroundColor: "#E0F3F8",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 12,
                  alignSelf: "flex-start",
                }}
              >
                <Ionicons name="cart-outline" size={14} color="#333" />
                <Text style={{ marginLeft: 6, fontWeight: "600" }}>
                  {item.categoryName}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}
