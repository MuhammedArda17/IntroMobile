import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const Index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎾 PadelPro</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Welkom terug, speler!</Text>
        <Text style={styles.subtitle}>Klaar voor je volgende match?</Text>

        <TouchableOpacity style={styles.buttonPrimary}>
          <Text style={styles.buttonText}>Nieuwe Match</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonTextSecondary}>Bekijk Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonTextSecondary}>Vind Velden</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomBar}>
        <Text style={styles.bottomItem}>🏠 Home</Text>
        <Text style={styles.bottomItem}>🎾 Matches</Text>
        <Text style={styles.bottomItem}>📊 Stats</Text>
        <Text style={styles.bottomItem}>👤 Profiel</Text>
      </View>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    paddingTop: 60,
    alignItems: "center",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#0f172a",
    width: "90%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 20,
  },
  buttonPrimary: {
    backgroundColor: "#38bdf8",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#38bdf8",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#020617",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: "#38bdf8",
    fontWeight: "600",
    fontSize: 15,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    backgroundColor: "#020617",
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  bottomItem: {
    color: "#94a3b8",
    fontSize: 12,
  },
});