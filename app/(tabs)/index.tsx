import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { toggleVisited, RootState } from "../../store";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const cardMargin = 10;
const cardWidth = (screenWidth - cardMargin * 3) / 2;

const PlaceItem = React.memo(({ item, onToggle, router, search }: any) => {
  const highlightText = useCallback((text: string, highlight: string) => {
    if (!highlight.trim()) return <Text style={styles.name}>{text}</Text>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <Text style={styles.name}>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <Text key={index} style={styles.highlight}>{part}</Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  }, []);

  const truncateWords = (text: string, wordLimit: number) => {
    if (text.length > wordLimit) {
      return text.split(" ").slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  return (
    <TouchableOpacity
      style={[styles.item, { width: cardWidth }]}
      onPress={() => router.push(`/details/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      {highlightText(truncateWords(item.name, 10) + (item.visited ? " ✅" : ""), search)}
      <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
        {item.description}
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          item.visited ? styles.unvisitedButton : styles.visitedButton,
        ]}
        onPress={(e) => { e.stopPropagation(); onToggle(item.id); }}
      >
        <Text style={styles.buttonText}>
          {item.visited ? "Unmark" : "Mark Visited"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}, 

(prev, next) => prev.item.visited === next.item.visited && prev.search === next.search
);

export default function HomeScreen() {

  const places = useSelector((state: RootState) => state.places, shallowEqual);
  const dispatch = useDispatch();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 6;


  const filteredPlaces = useMemo(() => {
    return places.filter((place) =>
      place.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [places, search]);


  const displayedPlaces = useMemo(() => {
    return filteredPlaces.slice(0, page * pageSize);
  }, [filteredPlaces, page]);


  const loadMore = useCallback(() => {
    if (loading) return;
    if (displayedPlaces.length >= filteredPlaces.length) return;

    setLoading(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoading(false);
    }, 500);
  }, [loading, displayedPlaces.length, filteredPlaces.length]);


  const handleToggle = useCallback(
    (id: string) => {
      dispatch(toggleVisited(id));
    },
    [dispatch]
  );

  const suggestRandomPlace = useCallback(() => {
    if (places.length === 0) return;
    const unvisitedPlaces = places.filter((place) => !place.visited);

    if (unvisitedPlaces.length === 0) {
      alert("All place already visited!");
      return;
    }

    const randomPlace =
      unvisitedPlaces[Math.floor(Math.random() * unvisitedPlaces.length)];
    router.push(`/details/${randomPlace.id}`);
  }, [places, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Top Historical Places</Text>

        <View style={styles.nav}>
          <TouchableOpacity style={styles.suggestButton} onPress={suggestRandomPlace}>
            <Text style={styles.suggestButtonText}>Suggestions</Text>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search places..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <FlatList
          data={displayedPlaces}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 10,
          }}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loading ? <ActivityIndicator size="small" color="#007bff" /> : null
          }

          renderItem={({ item }) => (
            <PlaceItem item={item} onToggle={handleToggle} router={router} search={search} />
          )}
          ListEmptyComponent={
            <Text style={styles.noResults}>No places found</Text>
          }
        />
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
    padding: cardMargin,
  },
  header: {
    padding: 5,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  nav: { flexDirection: "row", alignItems: "center", justifyContent:'space-between', marginBottom: 20 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius:25,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    width: 175
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, height: 40, fontSize: 14, color: "#333" },
  suggestButton: {
    backgroundColor: "#ff5722",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
  },
  suggestButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  item: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  image: {
    width: "100%",
    height: cardWidth * 0.6,
    borderRadius: 8,
    marginBottom: 5,
    resizeMode: "cover",
  },
  name: { fontSize: 16, fontWeight: "bold", marginBottom: 3, color: "#222" },
  highlight: { color: "gold", fontWeight: "bold" },
  desc: { fontSize: 12, marginBottom: 5, color: "#555" },
  button: {
    paddingVertical: 8,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  visitedButton: { backgroundColor: "#28a745" },
  unvisitedButton: { backgroundColor: "#007bff" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  noResults: { textAlign: "center", marginTop: 20, color: "#888", fontSize: 14 },
});
