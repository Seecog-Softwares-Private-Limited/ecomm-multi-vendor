import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from "react-native";
import * as React from "react";

type Product = { id: string; name: string; price: string };
type OrderStatus = "Delivered" | "Shipped" | "Processing" | "Cancelled";
type Order = {
  id: string;
  date: string;
  total: string;
  status: OrderStatus;
  payment: string;
  address: string;
  items: Array<{ name: string; qty: number; price: string }>;
};

const sampleProducts: Product[] = [
  { id: "p1", name: "Wireless Earbuds", price: "₹1,999" },
  { id: "p2", name: "Smart Watch Pro", price: "₹2,499" },
  { id: "p3", name: "Bluetooth Speaker", price: "₹1,799" },
  { id: "p4", name: "Gaming Mouse", price: "₹1,299" },
];
type SearchProduct = {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  imageUrl?: string | null;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://stellapetservices.com";
const categories = ["Fashion", "Electronics", "Beauty", "Home", "Sports", "Groceries"];
const topOffers = [
  { title: "Mega Deal Day", subtitle: "Min 50% off on top brands", colors: ["#F97316", "#FB7185"] as const },
  { title: "New Arrivals", subtitle: "Latest launches at best prices", colors: ["#2563EB", "#06B6D4"] as const },
];
const sampleOrders: Order[] = [
  {
    id: "ORD-892341",
    date: "26 Mar 2026",
    total: "₹3,798",
    status: "Delivered",
    payment: "Paid via UPI",
    address: "Bengaluru, Karnataka",
    items: [
      { name: "Wireless Earbuds", qty: 1, price: "₹1,999" },
      { name: "Bluetooth Speaker", qty: 1, price: "₹1,799" },
    ],
  },
  {
    id: "ORD-892112",
    date: "24 Mar 2026",
    total: "₹2,499",
    status: "Shipped",
    payment: "Paid via Card",
    address: "Kolkata, West Bengal",
    items: [{ name: "Smart Watch Pro", qty: 1, price: "₹2,499" }],
  },
  {
    id: "ORD-891002",
    date: "22 Mar 2026",
    total: "₹1,299",
    status: "Processing",
    payment: "Cash on Delivery",
    address: "Jaipur, Rajasthan",
    items: [{ name: "Gaming Mouse", qty: 1, price: "₹1,299" }],
  },
];

function formatRupee(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.glassCard}>{children}</View>;
}

function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={["#F97316", "#FB7185", "#7C3AED"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
          <Text style={styles.brandLight}>Indovyapar</Text>
          <Text style={styles.heroTitleLight}>Discover Trending Products</Text>
          <Text style={styles.heroSubLight}>Colorful deals, fast delivery, and premium shopping experience.</Text>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput
              placeholder="Search products, brands, categories..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>
        </LinearGradient>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Shop by Category</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {categories.map((item, idx) => (
            <LinearGradient
              key={item}
              colors={idx % 2 ? ["#22C55E", "#14B8A6"] : ["#2563EB", "#7C3AED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryChip}
            >
              <Text style={styles.categoryText}>{item}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Top Offers</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.offersRow}>
          {topOffers.map((offer) => (
            <LinearGradient
              key={offer.title}
              colors={offer.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.offerCard}
            >
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerSub}>{offer.subtitle}</Text>
            </LinearGradient>
          ))}
        </ScrollView>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionHeading}>Recommended For You</Text>
        </View>
        <View style={styles.gridTwoCol}>
          {sampleProducts.map((p) => (
            <Pressable key={p.id} style={styles.productCard} onPress={() => navigation.navigate("ProductDetail", { product: p })}>
              <LinearGradient
                colors={["rgba(255,255,255,0.9)", "rgba(241,245,249,0.75)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.productCardInner}
              >
                <LinearGradient colors={["#93C5FD", "#A78BFA"]} style={styles.thumb} />
                <Text style={styles.cardTitle}>{p.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{p.price}</Text>
                  <Ionicons name="arrow-forward-circle" size={20} color="#F97316" />
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductDetailScreen({ route }: { route: any }) {
  const product: Product = route.params?.product ?? sampleProducts[0];
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard>
          <View style={[styles.thumb, { height: 260 }]} />
          <Text style={[styles.cardTitle, { marginTop: 12, fontSize: 20 }]}>{product.name}</Text>
          <Text style={styles.price}>{product.price}</Text>
          <Text style={styles.heroSub}>Premium quality, fast delivery, easy returns.</Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GlassCard>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.heroSub}>This real React Native screen is scaffolded and ready for API integration.</Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusStyles(status: OrderStatus) {
  if (status === "Delivered") return { bg: "#DCFCE7", text: "#166534" };
  if (status === "Shipped") return { bg: "#DBEAFE", text: "#1D4ED8" };
  if (status === "Cancelled") return { bg: "#FEE2E2", text: "#B91C1C" };
  return { bg: "#FEF3C7", text: "#92400E" };
}

function MyOrdersScreen({ navigation }: { navigation: any }) {
  const tabs: Array<"All" | OrderStatus> = ["All", "Processing", "Shipped", "Delivered"];
  const [activeTab, setActiveTab] = React.useState<"All" | OrderStatus>("All");
  const visibleOrders = sampleOrders.filter((order) => activeTab === "All" || order.status === activeTab);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={["#4F46E5", "#7C3AED", "#EC4899"]} style={styles.ordersHero}>
          <Text style={styles.ordersHeroTitle}>My Orders</Text>
          <Text style={styles.ordersHeroSub}>Track, reorder, and manage returns with ease.</Text>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.orderFilterRow}>
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <Pressable key={tab} onPress={() => setActiveTab(tab)} style={[styles.orderFilterChip, active && styles.orderFilterChipActive]}>
                <Text style={[styles.orderFilterText, active && styles.orderFilterTextActive]}>{tab}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visibleOrders.map((order) => {
          const statusStyle = getStatusStyles(order.status);
          return (
            <LinearGradient key={order.id} colors={["rgba(255,255,255,0.96)", "rgba(241,245,249,0.88)"]} style={styles.orderCard}>
              <View style={styles.orderTopRow}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderMeta}>Placed on {order.date}</Text>
                </View>
                <View style={[styles.statusChip, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.orderDivider} />
              <Text style={styles.orderItemText}>{order.items[0]?.name}</Text>
              <Text style={styles.orderMeta}>
                {order.items.length} item(s) • {order.payment}
              </Text>

              <View style={styles.orderBottomRow}>
                <Text style={styles.orderTotal}>{order.total}</Text>
                <View style={styles.orderActions}>
                  <Pressable style={styles.secondaryBtn}>
                    <Text style={styles.secondaryBtnText}>Reorder</Text>
                  </Pressable>
                  <Pressable style={styles.primaryBtnSmall} onPress={() => navigation.navigate("OrderDetail", { order })}>
                    <Text style={styles.primaryBtnText}>Details</Text>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function OrderDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const order: Order = route.params?.order ?? sampleOrders[0];
  const statusStyle = getStatusStyles(order.status);
  const timeline = [
    { label: "Order confirmed", done: true },
    { label: "Packed at warehouse", done: order.status !== "Processing" },
    { label: "Out for delivery", done: order.status === "Shipped" || order.status === "Delivered" },
    { label: "Delivered", done: order.status === "Delivered" },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={styles.orderDetailHeader}>
          <Text style={styles.orderDetailId}>{order.id}</Text>
          <View style={[styles.statusChip, { backgroundColor: statusStyle.bg, alignSelf: "flex-start", marginTop: 8 }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{order.status}</Text>
          </View>
        </LinearGradient>

        <GlassCard>
          <Text style={styles.detailSectionTitle}>Items</Text>
          {order.items.map((item) => (
            <View key={item.name} style={styles.itemRow}>
              <Text style={styles.orderItemText}>
                {item.name} x{item.qty}
              </Text>
              <Text style={styles.orderItemText}>{item.price}</Text>
            </View>
          ))}
          <View style={styles.orderDivider} />
          <View style={styles.itemRow}>
            <Text style={styles.orderMeta}>Total</Text>
            <Text style={styles.orderTotal}>{order.total}</Text>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.detailSectionTitle}>Delivery & Payment</Text>
          <Text style={styles.orderMeta}>Date: {order.date}</Text>
          <Text style={styles.orderMeta}>Address: {order.address}</Text>
          <Text style={styles.orderMeta}>Payment: {order.payment}</Text>
        </GlassCard>

        <GlassCard>
          <Text style={styles.detailSectionTitle}>Order Timeline</Text>
          {timeline.map((step) => (
            <View key={step.label} style={styles.timelineRow}>
              <Ionicons name={step.done ? "checkmark-circle" : "ellipse-outline"} size={18} color={step.done ? "#10B981" : "#94A3B8"} />
              <Text style={styles.timelineText}>{step.label}</Text>
            </View>
          ))}
        </GlassCard>

        <View style={styles.orderActionsRow}>
          <Pressable style={styles.secondaryBtnWide} onPress={() => navigation.navigate("SupportTickets")}>
            <Text style={styles.secondaryBtnText}>Support</Text>
          </Pressable>
          <Pressable style={styles.primaryBtnWide}>
            <Text style={styles.primaryBtnText}>Track Package</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SearchScreen({ navigation }: { navigation: any }) {
  const [query, setQuery] = React.useState("");
  const [submittedQuery, setSubmittedQuery] = React.useState("");
  const [products, setProducts] = React.useState<SearchProduct[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const quickTerms = ["iPhone", "Shoes", "Headphones", "Watch", "Laptop", "Beauty"];

  const fetchProducts = React.useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setProducts([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ q: trimmed, limit: "24" });
      const res = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed to load products");
      const list = Array.isArray(json?.data) ? json.data : [];
      setProducts(
        list.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price ?? 0),
          oldPrice: p.oldPrice != null ? Number(p.oldPrice) : undefined,
          rating: Number(p.rating ?? 0),
          reviews: Number(p.reviews ?? 0),
          imageUrl: p.imageUrl ?? null,
        }))
      );
    } catch (e: any) {
      setError(e?.message ?? "Could not fetch products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitSearch = React.useCallback(
    (term?: string) => {
      const nextTerm = (term ?? query).trim();
      setSubmittedQuery(nextTerm);
      fetchProducts(nextTerm);
    },
    [fetchProducts, query]
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient colors={["#F97316", "#FB7185"]} style={styles.searchHeader}>
          <Text style={styles.searchHeaderTitle}>Search Products</Text>
          <Text style={styles.searchHeaderSub}>Find exactly what you need in seconds.</Text>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => submitSearch()}
              returnKeyType="search"
              placeholder="Search for products, brands and more"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
            <Pressable onPress={() => submitSearch()} style={styles.searchGoBtn}>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </Pressable>
          </View>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickTermsRow}>
          {quickTerms.map((term) => (
            <Pressable key={term} style={styles.quickTermChip} onPress={() => {
              setQuery(term);
              submitSearch(term);
            }}>
              <Text style={styles.quickTermText}>{term}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.orderMeta}>Loading search results...</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <GlassCard>
            <Text style={styles.sectionTitle}>Search Failed</Text>
            <Text style={styles.heroSub}>{error}</Text>
            <Pressable style={styles.primaryBtnSmall} onPress={() => submitSearch(submittedQuery)}>
              <Text style={styles.primaryBtnText}>Retry</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        {!loading && !error && submittedQuery && products.length === 0 ? (
          <GlassCard>
            <Text style={styles.sectionTitle}>No Results</Text>
            <Text style={styles.heroSub}>No products found for "{submittedQuery}". Try another keyword.</Text>
          </GlassCard>
        ) : null}

        {!loading && !error && products.length > 0 ? (
          <>
            <Text style={styles.sectionHeading}>
              {products.length} result{products.length > 1 ? "s" : ""} for "{submittedQuery}"
            </Text>
            <View style={styles.gridTwoCol}>
              {products.map((product) => (
                <Pressable
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => navigation.navigate("ProductDetail", { product: { id: product.id, name: product.name, price: formatRupee(product.price) } })}
                >
                  <LinearGradient
                    colors={["rgba(255,255,255,0.96)", "rgba(241,245,249,0.84)"]}
                    style={styles.productCardInner}
                  >
                    {product.imageUrl ? (
                      <Image source={{ uri: product.imageUrl }} style={styles.thumb} resizeMode="cover" />
                    ) : (
                      <LinearGradient colors={["#93C5FD", "#A78BFA"]} style={styles.thumb} />
                    )}
                    <Text numberOfLines={2} style={styles.cardTitle}>{product.name}</Text>
                    <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)} ({product.reviews})</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{formatRupee(product.price)}</Text>
                      {product.oldPrice && product.oldPrice > product.price ? (
                        <Text style={styles.oldPrice}>{formatRupee(product.oldPrice)}</Text>
                      ) : null}
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function AuthScreen({ title }: { title: string }) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>{title}</Text>
        <GlassCard>
          <TextInput placeholder="Email" placeholderTextColor="#94A3B8" style={styles.searchInput} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#94A3B8"
            style={[styles.searchInput, { marginTop: 10 }]}
            secureTextEntry
          />
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>{title === "Login" ? "Sign In" : "Create Account"}</Text>
          </Pressable>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: "Home" }} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product Detail" }} />
    </HomeStack.Navigator>
  );
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} options={{ title: "Search" }} />
      <SearchStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Product Detail" }} />
    </SearchStack.Navigator>
  );
}

function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator>
      <OrdersStack.Screen name="MyOrders" component={MyOrdersScreen} options={{ title: "My Orders" }} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Order Detail" }} />
      <OrdersStack.Screen name="SupportTickets" options={{ title: "Support Tickets" }}>
        {() => <PlaceholderScreen title="Support Tickets" />}
      </OrdersStack.Screen>
    </OrdersStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="ProfileMain" options={{ title: "Profile" }}>
        {() => <PlaceholderScreen title="Profile" />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="Addresses" options={{ title: "Addresses" }}>
        {() => <PlaceholderScreen title="Address Management" />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="Login" options={{ title: "Login" }}>
        {() => <AuthScreen title="Login" />}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="Register" options={{ title: "Register" }}>
        {() => <AuthScreen title="Register" />}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#F97316",
          tabBarInactiveTintColor: "#64748B",
          tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6 },
          tabBarIcon: ({ color, size }) => {
            const map: Record<string, keyof typeof Ionicons.glyphMap> = {
              Home: "home-outline",
              Search: "search-outline",
              Orders: "receipt-outline",
              Wishlist: "heart-outline",
              Account: "person-outline",
            };
            return <Ionicons name={map[route.name] ?? "ellipse-outline"} size={size ?? 20} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Search" component={SearchStackScreen} />
        <Tab.Screen name="Orders" component={OrdersStackScreen} />
        <Tab.Screen name="Wishlist">{() => <PlaceholderScreen title="Wishlist" />}</Tab.Screen>
        <Tab.Screen name="Account" component={ProfileStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#EEF2FF" },
  content: { padding: 14, gap: 14, paddingBottom: 92 },
  brand: { fontSize: 24, fontWeight: "800", color: "#0F172A" },
  brandLight: { fontSize: 22, fontWeight: "800", color: "#fff" },
  heroBanner: { borderRadius: 22, padding: 16, gap: 10 },
  heroTitleLight: { fontSize: 24, fontWeight: "800", color: "#fff", lineHeight: 30 },
  heroSubLight: { fontSize: 14, color: "rgba(255,255,255,0.92)", lineHeight: 20 },
  searchWrap: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 12,
  },
  searchInput: {
    height: 44,
    flex: 1,
    borderRadius: 12,
    color: "#0F172A",
  },
  sectionRow: { marginTop: 4 },
  sectionHeading: { fontSize: 17, fontWeight: "800", color: "#0F172A" },
  categoryRow: { gap: 10, paddingVertical: 2, paddingRight: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  categoryText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  offersRow: { gap: 10, paddingRight: 8 },
  offerCard: { width: 230, borderRadius: 18, padding: 14 },
  offerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  offerSub: { color: "rgba(255,255,255,0.94)", fontSize: 13, marginTop: 6, lineHeight: 18 },
  glassCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    backgroundColor: "rgba(255,255,255,0.78)",
    padding: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#64748B", textTransform: "uppercase" },
  heroTitle: { marginTop: 4, fontSize: 22, fontWeight: "800", color: "#0F172A" },
  heroSub: { marginTop: 6, fontSize: 14, color: "#475569", lineHeight: 20 },
  gridTwoCol: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  productCard: { width: "48.5%" },
  productCardInner: { borderRadius: 16, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" },
  thumb: { height: 120, borderRadius: 12, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  priceRow: { marginTop: 4, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  price: { marginTop: 4, fontSize: 16, fontWeight: "800", color: "#F97316" },
  primaryBtn: {
    marginTop: 12,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  ordersHero: { borderRadius: 18, padding: 14 },
  ordersHeroTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  ordersHeroSub: { color: "rgba(255,255,255,0.9)", marginTop: 4, fontSize: 13 },
  orderFilterRow: { gap: 8, paddingVertical: 2, paddingRight: 8 },
  orderFilterChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#E2E8F0" },
  orderFilterChipActive: { backgroundColor: "#0F172A" },
  orderFilterText: { fontSize: 12, fontWeight: "700", color: "#475569" },
  orderFilterTextActive: { color: "#fff" },
  orderCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  orderTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderId: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  orderMeta: { fontSize: 13, marginTop: 4, color: "#64748B" },
  statusChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: "800" },
  orderDivider: { marginVertical: 10, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  orderItemText: { fontSize: 14, color: "#1E293B", fontWeight: "600" },
  orderBottomRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderTotal: { fontSize: 18, fontWeight: "800", color: "#F97316" },
  orderActions: { flexDirection: "row", gap: 8 },
  secondaryBtn: {
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: "#334155", fontSize: 13, fontWeight: "700" },
  primaryBtnSmall: {
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F97316",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  orderDetailHeader: { borderRadius: 16, padding: 14 },
  orderDetailId: { color: "#fff", fontSize: 20, fontWeight: "800" },
  detailSectionTitle: { fontSize: 14, fontWeight: "800", color: "#0F172A", marginBottom: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  timelineText: { fontSize: 14, color: "#334155" },
  orderActionsRow: { flexDirection: "row", gap: 10 },
  secondaryBtnWide: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  primaryBtnWide: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F97316",
  },
  searchHeader: { borderRadius: 18, padding: 14, gap: 8 },
  searchHeaderTitle: { color: "#fff", fontSize: 22, fontWeight: "800" },
  searchHeaderSub: { color: "rgba(255,255,255,0.92)", fontSize: 13 },
  searchInputWrap: {
    marginTop: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 6,
    gap: 8,
  },
  searchGoBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  quickTermsRow: { gap: 8, paddingRight: 8 },
  quickTermChip: {
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickTermText: { fontSize: 12, fontWeight: "700", color: "#334155" },
  centerState: { alignItems: "center", justifyContent: "center", paddingVertical: 24, gap: 8 },
  ratingText: { marginTop: 4, fontSize: 12, color: "#64748B" },
  oldPrice: { fontSize: 12, color: "#94A3B8", textDecorationLine: "line-through" },
});
