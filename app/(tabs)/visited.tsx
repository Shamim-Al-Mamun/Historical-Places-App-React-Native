import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { toggleVisited, RootState } from "../../store";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VisitedScreen() {
  const places = useSelector((state: RootState) =>
    state.places.filter((p) => p.visited)
  );
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Visited Places</Text>
        {places.length === 0 ? (
          <Text style={styles.empty}>No places visited yet</Text>
        ) : (
          <FlatList
            data={places}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => router.push(`/details/${item.id}`)}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.desc} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => dispatch(toggleVisited(item.id))}
                  style={styles.unmarkBtn}
                >
                  <Text style={styles.unmarkText}>Unmark</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? 10 : 0,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    padding: 5,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  empty: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 50,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  desc: {
    fontSize: 12,
    color: "#555",
    width: 180,
  },
  unmarkBtn: {
    marginLeft: "auto",
    backgroundColor: "#eee",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  unmarkText: {
    fontSize: 12,
    color: "red",
  },
});
