import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";
import { line, curveMonotoneX, LinePoint } from "d3-shape";

interface Transaction {
  amount: number;
  type: "Income" | "Expense";
  date: number; // unix seconds
}

interface Props {
  transactions: Transaction[];
}

export default function SummaryGraphCard({ transactions }: Props) {
  const [mode, setMode] = useState<"Income" | "Expense">("Income");
  const [weekOffset, setWeekOffset] = useState(0);

  const screenWidth = Dimensions.get("window").width - 60;
  const graphHeight = 160;

  // --- Compute week range ---
  const { weekStart, weekEnd } = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - today.getDay() + weekOffset * 7
    );
    const endOfWeek = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 6
    );

    return {
      weekStart: startOfWeek.getTime() / 1000,
      weekEnd: endOfWeek.getTime() / 1000,
    };
  }, [weekOffset]);

  // --- Filter data ---
  const filtered = transactions.filter(
    (t) => t.type === mode && t.date >= weekStart && t.date <= weekEnd
  );

  // --- Points for graph ---
  const points: LinePoint[] = filtered.map((t) => ({
    x: t.date,
    y: t.amount,
  }));

  const maxY = Math.max(...points.map((p) => p.y), 1);

  // --- Create D3 line path ---
  const graphLine = useMemo(() => {
    if (points.length < 2) return "";

    const scaleX = (p: number, i: number) =>
      (i / Math.max(points.length - 1, 1)) * screenWidth;

    const scaleY = (p: number) =>
      graphHeight - (p / maxY) * graphHeight;

    const lineGen = line<LinePoint>()
      .x((_: LinePoint, i: number) => scaleX(i, i))
      .y((p: LinePoint) => scaleY(p.y))
      .curve(curveMonotoneX);

    return lineGen(points) || "";
  }, [points]);

  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  const readableRange = `${new Date(
    weekStart * 1000
  ).toLocaleDateString()} - ${new Date(weekEnd * 1000).toLocaleDateString()}`;

  return (
    <View
      style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 3,
      }}
    >
      {/* HEADER */}
      <Text style={{ fontWeight: "700", fontSize: 16 }}>{readableRange}</Text>
      <Text style={{ marginTop: 10, color: "gray", fontWeight: "600" }}>
        Total {mode}
      </Text>
      <Text style={{ fontWeight: "900", fontSize: 32 }}>
        ₹{totalAmount.toFixed(2)}
      </Text>

      {/* GRAPH */}
      <Svg width={screenWidth} height={graphHeight} style={{ marginTop: 20 }}>
        <Path
          d={graphLine}
          stroke="#007AFF"
          strokeWidth={3}
          fill="none"
        />
      </Svg>

      {/* TOGGLES */}
      <View
        style={{
          flexDirection: "row",
          marginTop: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)}>
          <Text style={{ fontWeight: "600" }}>Prev week</Text>
        </TouchableOpacity>

        {/* MODE TOGGLE */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#EEE",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            onPress={() => setMode("Income")}
            style={{
              padding: 10,
              backgroundColor: mode === "Income" ? "#333" : "transparent",
              flex: 1,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: mode === "Income" ? "white" : "black",
                fontWeight: "700",
              }}
            >
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode("Expense")}
            style={{
              padding: 10,
              backgroundColor: mode === "Expense" ? "#333" : "transparent",
              flex: 1,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: mode === "Expense" ? "white" : "black",
                fontWeight: "700",
              }}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)}>
          <Text style={{ fontWeight: "600" }}>Next week</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
