import { Ionicons } from "@expo/vector-icons";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";

// --- Expanded Dummy Data (25 Entries) - Photo removed ---
const DUMMY_DATA = [
  {
    id: "1",
    name: "Aarav Sharma",
    profession: "Doctor",
    location: "Delhi",
    phone: "+919876543210",
  },
  {
    id: "2",
    name: "Priya Desai",
    profession: "Advocate",
    location: "Mumbai",
    phone: "+919876543211",
  },
  {
    id: "3",
    name: "Rohan Gupta",
    profession: "Engineer",
    location: "Bangalore",
    phone: "+919876543212",
  },
  {
    id: "4",
    name: "Sneha Patel",
    profession: "Architect",
    location: "Ahmedabad",
    phone: "+919876543213",
  },
  {
    id: "5",
    name: "Vikram Singh",
    profession: "Advisor",
    location: "Pune",
    phone: "+919876543214",
  },
  {
    id: "6",
    name: "Ananya Iyer",
    profession: "Teacher",
    location: "Chennai",
    phone: "+919876543215",
  },
  {
    id: "7",
    name: "Kabir Khan",
    profession: "Chef",
    location: "Lucknow",
    phone: "+919876543216",
  },
  {
    id: "8",
    name: "Ishani Verma",
    profession: "Artist",
    location: "Jaipur",
    phone: "+919876543217",
  },
  {
    id: "9",
    name: "Arjun Reddy",
    profession: "Pilot",
    location: "Hyderabad",
    phone: "+919876543218",
  },
  {
    id: "10",
    name: "Meera Nair",
    profession: "Nurse",
    location: "Kochi",
    phone: "+919876543219",
  },
  {
    id: "11",
    name: "Aditya Roy",
    profession: "Journalist",
    location: "Kolkata",
    phone: "+919876543220",
  },
  {
    id: "12",
    name: "Zoya Malik",
    profession: "Designer",
    location: "Noida",
    phone: "+919876543221",
  },
  {
    id: "13",
    name: "Yash Bajaj",
    profession: "CA",
    location: "Gurugram",
    phone: "+919876543222",
  },
  {
    id: "14",
    name: "Sanya Malhotra",
    profession: "Dentist",
    location: "Chandigarh",
    phone: "+919876543223",
  },
  {
    id: "15",
    name: "Rahul Bose",
    profession: "Police",
    location: "Patna",
    phone: "+919876543224",
  },
  {
    id: "16",
    name: "Kiara Advani",
    profession: "Advocate",
    location: "Indore",
    phone: "+919876543225",
  },
  {
    id: "17",
    name: "Devansh Mehra",
    profession: "Scientist",
    location: "Dehradun",
    phone: "+919876543226",
  },
  {
    id: "18",
    name: "Nisha Rao",
    profession: "Physio",
    location: "Mysore",
    phone: "+919876543227",
  },
  {
    id: "19",
    name: "Rishi Kapoor",
    profession: "Actor",
    location: "Surat",
    phone: "+919876543228",
  },
  {
    id: "20",
    name: "Tanya Duggal",
    profession: "HR",
    location: "Ludhiana",
    phone: "+919876543229",
  },
  {
    id: "21",
    name: "Manish Paul",
    profession: "Host",
    location: "Bhopal",
    phone: "+919876543230",
  },
  {
    id: "22",
    name: "Alisha Chinai",
    profession: "Singer",
    location: "Goa",
    phone: "+919876543231",
  },
  {
    id: "23",
    name: "Gaurav Taneja",
    profession: "Pilot",
    location: "Kanpur",
    phone: "+919876543232",
  },
  {
    id: "24",
    name: "Bhuvan Bam",
    profession: "Writer",
    location: "Delhi",
    phone: "+919876543233",
  },
  {
    id: "25",
    name: "Carry Minati",
    profession: "Gamer",
    location: "Faridabad",
    phone: "+919876543234",
  },
];

export default function DataScreen() {
  const theme = useTheme();

  // Opens the native phone dialer
  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text style={[styles.screenTitle, { color: theme.colors.onSurface }]}>
        Work In progress: These are dummy data.
      </Text>

      <View
        style={[
          styles.tableWrapper,
          { borderColor: theme.colors.outlineVariant },
        ]}
      >
        {/* Outer Vertical ScrollView handles scrolling up/down for the ENTIRE table perfectly in sync */}
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View style={{ flexDirection: "row" }}>
            {/* --- FIXED LEFT SECTION --- */}
            {/* This section stays in place while the right section scrolls horizontally */}
            <View
              style={[
                styles.fixedSection,
                {
                  backgroundColor: theme.colors.surface,
                  shadowColor: theme.dark ? "#000" : "#888",
                  borderRightColor: theme.colors.outlineVariant,
                },
              ]}
            >
              {/* Fixed Header */}
              <View
                style={[
                  styles.headerRow,
                  {
                    backgroundColor: theme.dark ? "#1E293B" : "#F1F5F9",
                    borderBottomColor: theme.colors.outlineVariant,
                  },
                ]}
              >
                <Text
                  style={[styles.cellText, styles.headerText, { width: 40 }]}
                >
                  No.
                </Text>
                <Text
                  style={[styles.cellText, styles.headerText, { width: 140 }]}
                >
                  Name
                </Text>
              </View>

              {/* Fixed Data Rows */}
              {DUMMY_DATA.map((item, index) => (
                <View
                  key={`fixed-${item.id}`}
                  style={[
                    styles.row,
                    { borderBottomColor: theme.colors.outlineVariant },
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      { width: 40, color: theme.colors.onSurface },
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.cellText,
                      {
                        width: 140,
                        color: theme.colors.onSurface,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>

            {/* --- SCROLLABLE RIGHT SECTION --- */}
            {/* This section can be swiped left and right */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              style={{ flex: 1 }}
            >
              <View>
                {/* Scrollable Header */}
                <View
                  style={[
                    styles.headerRow,
                    {
                      backgroundColor: theme.dark ? "#1E293B" : "#F1F5F9",
                      borderBottomColor: theme.colors.outlineVariant,
                    },
                  ]}
                >
                  <Text
                    style={[styles.cellText, styles.headerText, { width: 120 }]}
                  >
                    Profession
                  </Text>
                  <Text
                    style={[styles.cellText, styles.headerText, { width: 110 }]}
                  >
                    Location
                  </Text>
                  <Text
                    style={[styles.cellText, styles.headerText, { width: 130 }]}
                  >
                    Phone No
                  </Text>
                  <Text
                    style={[
                      styles.cellText,
                      styles.headerText,
                      { width: 60, textAlign: "center" },
                    ]}
                  >
                    Call
                  </Text>
                </View>

                {/* Scrollable Data Rows */}
                {DUMMY_DATA.map((item) => (
                  <View
                    key={`scroll-${item.id}`}
                    style={[
                      styles.row,
                      { borderBottomColor: theme.colors.outlineVariant },
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cellText,
                        { width: 120, color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {item.profession}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cellText,
                        { width: 110, color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {item.location}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cellText,
                        { width: 130, color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      {item.phone}
                    </Text>
                    <View style={{ width: 60, alignItems: "center" }}>
                      <TouchableOpacity
                        onPress={() => handleCall(item.phone)}
                        style={[
                          styles.callButton,
                          { backgroundColor: theme.colors.primaryContainer },
                        ]}
                      >
                        <Ionicons
                          name="call"
                          size={18}
                          color={theme.colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tableWrapper: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden", // Ensures rounded corners apply correctly
  },
  fixedSection: {
    width: 180, // 40 (No) + 140 (Name)
    zIndex: 10,
    elevation: 5,
    borderRightWidth: 1,
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 56, // Fixed height ensures left & right columns stay perfectly aligned
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  cellText: {
    fontSize: 13,
    paddingHorizontal: 4,
  },
  headerText: {
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  callButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
