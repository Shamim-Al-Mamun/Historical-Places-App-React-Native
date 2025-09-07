import React from "react";
import { SafeAreaView, ScrollView, Image, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { toggleVisited, RootState } from "../../store";
import { useLocalSearchParams } from "expo-router";

export default function DetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = useSelector((state: RootState) => state.places.find((p) => p.id === id));
  const dispatch = useDispatch();

  if (!place) return <Text>Place not found</Text>;

  const mid = Math.floor(place.description.length / 2);
  const firstPeriodIndex = place.description.lastIndexOf(".", mid);
  const splitIndex = firstPeriodIndex !== -1 ? firstPeriodIndex + 1 : mid;
  const firstPara = place.description.slice(0, splitIndex).trim();
  const secondPara = place.description.slice(splitIndex).trim();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: place.image }} style={styles.image} />
        <Text style={styles.title}>{place.name}</Text>
        <Text style={styles.desc}>{firstPara}</Text>
        <Text style={styles.desc}>{secondPara}</Text>

        <TouchableOpacity
          style={[styles.button, place.visited ? styles.visitedButton : styles.unvisitedButton]}
          onPress={() => dispatch(toggleVisited(place.id))}
        >
          <Text style={styles.buttonText}>
            {place.visited ? "Unmark as Visited" : "Mark as Visited"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff", paddingTop: Platform.OS === "android" ? 10 : 0 },
  container: { padding: 20, paddingBottom: 40 },
  image: { width: "100%", height: 200, borderRadius: 12, marginBottom: 15, resizeMode: "cover" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  desc: { fontSize: 14, marginBottom: 20, lineHeight: 22, textAlign: "justify", color: "#333" },

  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  unvisitedButton: {
    backgroundColor: "#28a745",
  },
  visitedButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
