import * as React from "react";
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Card from "./ui/Card";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { db } from "../Firebase/FirebaseConfi";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { getAuth } from "firebase/auth";   // ← NEW
import { Category } from "../types";

interface AddTransactionProps {
  onTransactionAdded?: () => void;
}

export default function AddTransaction({ onTransactionAdded }: AddTransactionProps) {
  const [isAddingTransaction, setIsAddingTransaction] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState<0 | 1>(0);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [categoryType, setCategoryType] = React.useState<"Expense" | "Income">(
    "Expense"
  );

  const auth = getAuth();   // ← NEW

  React.useEffect(() => {
    let isMounted = true;

    async function fetchCategories() {
      const type = currentTab === 0 ? "Expense" : "Income";
      setCategoryType(type);

      try {
        const q = query(collection(db, "categories"), where("type", "==", type));
        const snapshot = await getDocs(q);

        const list: Category[] = snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          type: d.data().type,
        }));

        if (isMounted) setCategories(list);
      } catch (err) {
        console.log(err);
        Alert.alert("Error", "Failed to fetch categories.");
      }
    }

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, [currentTab]);

  const handleSave = async () => {
    if (!amount || !categoryId) {
      Alert.alert("Validation", "Please enter amount and select category.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in");
      return;
    }

    const uid = user.uid;   // ← Get UID

    try {
      // SAVE UNDER USER
      await addDoc(collection(db, "users", uid, "transactions"), {
        amount: Number(amount),
        description,
        category_id: categoryId,
        date: Math.floor(Date.now() / 1000),
        type: categoryType,
      });

      if (onTransactionAdded) {
        onTransactionAdded();
      }

      setAmount("");
      setDescription("");
      setCategoryId("");
      setSelectedCategory("");
      setIsAddingTransaction(false);

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not save transaction.");
    }
  };

  const handleAmountChange = (text: string) => {
    const sanitized = text.replace(/[^0-9.]/g, "");
    if ((sanitized.match(/\./g) || []).length <= 1) setAmount(sanitized);
  };

  return (
    <View style={{ marginBottom: 15 }}>
      {isAddingTransaction ? (
        <View>
          <Card>
            <TextInput
              placeholder="₹ Amount"
              style={{ fontSize: 32, marginBottom: 15, fontWeight: "bold" }}
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              value={amount}
            />

            <TextInput
              placeholder="Description"
              style={{ marginBottom: 15 }}
              onChangeText={setDescription}
              value={description}
            />

            <SegmentedControl
              values={["Expense", "Income"]}
              style={{ marginBottom: 15 }}
              selectedIndex={currentTab}
              onChange={(event) =>
                setCurrentTab(event.nativeEvent.selectedSegmentIndex as 0 | 1)
              }
            />

            <ScrollView style={{ maxHeight: 200, marginBottom: 10 }}>
              {categories.map((cat) => (
                <CategoryButton
                  key={cat.id}
                  id={cat.id}
                  title={cat.name}
                  isSelected={selectedCategory === cat.id}
                  setSelectedCategory={setSelectedCategory}
                  setCategoryId={setCategoryId}
                />
              ))}
            </ScrollView>
          </Card>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: 10,
            }}
          >
            <Button
              title="Cancel"
              color="red"
              onPress={() => setIsAddingTransaction(false)}
            />
            <Button
              title="Save"
              onPress={handleSave}
              disabled={!amount || !categoryId}
            />
          </View>
        </View>
      ) : (
        <AddButton setIsAddingTransaction={setIsAddingTransaction} />
      )}
    </View>
  );
}

function CategoryButton({
  id,
  title,
  isSelected,
  setSelectedCategory,
  setCategoryId,
}: {
  id: string;
  title: string;
  isSelected: boolean;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  setCategoryId: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        setSelectedCategory(id);
        setCategoryId(id);
      }}
      activeOpacity={0.6}
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isSelected ? "#007BFF20" : "#00000020",
        borderRadius: 15,
        marginBottom: 6,
      }}
    >
      <Text
        style={{
          fontWeight: "700",
          color: isSelected ? "#007BFF" : "#000000",
          marginLeft: 5,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function AddButton({
  setIsAddingTransaction,
}: {
  setIsAddingTransaction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <TouchableOpacity
      onPress={() => setIsAddingTransaction(true)}
      activeOpacity={0.6}
      style={{
        height: 40,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007BFF20",
        borderRadius: 15,
      }}
    >
      <MaterialIcons name="add-circle-outline" size={24} color="#007BFF" />
      <Text style={{ fontWeight: "700", color: "#007BFF", marginLeft: 5 }}>
        New Entry
      </Text>
    </TouchableOpacity>
  );
}
