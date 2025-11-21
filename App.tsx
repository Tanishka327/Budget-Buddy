import * as React from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import Home from "./screens/Home";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import Payment from "./screens/sheets/Payment";

// ⛔ DELETE YOUR WRONG Home() FUNCTION
// ⛔ DO NOT import useTransactions here

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Payment: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <React.Suspense
        fallback={
          <View style={{ flex: 1 }}>
            <ActivityIndicator size={"large"} />
            <Text>Loading...</Text>
          </View>
        }
      >
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{
              headerTitle: "Budget Buddy",
              headerLargeTitle: true,
              headerTransparent: Platform.OS === "ios",
              headerBlurEffect: "light",
            }}
          />
          <Stack.Screen
            name="Payment"
            component={Payment}
            options={{
              presentation: "transparentModal",
              animation: "slide_from_bottom",
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </React.Suspense>
    </NavigationContainer>
  );
}
