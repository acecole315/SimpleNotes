import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

import { useTheme } from "../context/ThemeContext";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "@simple_notes";

export default function NotesScreen() {
  

  const {
    colors,
    theme,
    toggleTheme,
  } = useTheme();

  const { id } =
    useLocalSearchParams<{
      id: string;
    }>();

  const [note, setNote] =
    useState<Note | null>(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  useEffect(() => {
    loadNote();
  }, [id]);

  const loadNote = async () => {
    try {
      const savedNotes =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (!savedNotes) {
        return;
      }

      const notes: Note[] =
        JSON.parse(savedNotes);

      const selectedNote =
        notes.find(
          (item) => item.id === id
        );

      if (selectedNote) {
        setNote(selectedNote);
        setTitle(selectedNote.title);
        setContent(
          selectedNote.content
        );
      }
    } catch (error) {
      console.log(
        "Failed to load note:",
        error
      );
    }
  };

  const updateNote = async () => {
    if (!note) {
      return;
    }

    if (
      !title.trim() &&
      !content.trim()
    ) {
      Alert.alert(
        "Empty Note",
        "Please enter a title or content."
      );
      return;
    }

    try {
      const savedNotes =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (!savedNotes) {
        return;
      }

      const notes: Note[] =
        JSON.parse(savedNotes);

      const updatedNote: Note = {
        ...note,
        title:
          title.trim() || "Untitled",
        content: content.trim(),
        updatedAt:
          new Date().toLocaleString(),
      };

      const updatedNotes =
        notes.map((item) =>
          item.id === note.id
            ? updatedNote
            : item
        );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedNotes)
      );

      setNote(updatedNote);
      setTitle(updatedNote.title);
      setContent(updatedNote.content);
      setEditing(false);

      Alert.alert(
        "Success",
        "Note updated successfully."
      );
    } catch (error) {
      console.log(
        "Failed to update note:",
        error
      );
    }
  };

const deleteNote = async () => {
  if (!note) return;

  try {
    const savedNotes =
      await AsyncStorage.getItem(STORAGE_KEY);

    const notes: Note[] = savedNotes
      ? JSON.parse(savedNotes)
      : [];

    const updatedNotes = notes.filter(
      (item) => item.id !== note.id
    );

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedNotes)
    );

    router.back();
  } catch (error) {
    console.log("Failed to delete note:", error);
  }
};
  if (!note) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <View style={styles.center}>
          <Text
            style={[
              styles.notFound,
              {
                color: colors.text,
              },
            ]}
          >
            Note not found.
          </Text>

          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.button,
              },
            ]}
            activeOpacity={0.7}
            onPress={() =>
              router.back()
            }
          >
            <Text
              style={[
                styles.backButtonText,
                {
                  color:
                    colors.buttonText,
                },
              ]}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >

        <View
          style={[
            styles.topBar,
            {
              backgroundColor:
                colors.card,
              borderBottomColor:
                colors.border,
            },
          ]}
        >

          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.backText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              ‹ Back
            </Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.topTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {editing
              ? "Edit Note"
              : "Note"}
          </Text>

          <TouchableOpacity
            style={[
              styles.themeButton,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={toggleTheme}
          >
            <Text style={styles.themeIcon}>
              {theme === "light"
                ? "🌙"
                : "☀️"}
            </Text>
          </TouchableOpacity>

        </View>

        <View
          style={styles.noteContainer}
        >

          {editing ? (
            <>

              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Title
              </Text>

              <TextInput
                style={[
                  styles.titleInput,
                  {
                    backgroundColor:
                      colors.input,
                    borderColor:
                      colors.border,
                    color:
                      colors.text,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter note title"
                placeholderTextColor={
                  colors.placeholder
                }
                autoCapitalize="sentences"
              />

              <Text
                style={[
                  styles.label,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Content
              </Text>

              <TextInput
                style={[
                  styles.contentInput,
                  {
                    backgroundColor:
                      colors.input,
                    borderColor:
                      colors.border,
                    color:
                      colors.text,
                  },
                ]}
                value={content}
                onChangeText={setContent}
                placeholder="Write your note..."
                placeholderTextColor={
                  colors.placeholder
                }
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
              />

              <View
                style={styles.actionRow}
              >

                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      backgroundColor:
                        colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setTitle(
                      note.title
                    );

                    setContent(
                      note.content
                    );

                    setEditing(false);
                  }}
                >
                  <Text
                    style={[
                      styles.cancelText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    {
                      backgroundColor:
                        colors.button,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={updateNote}
                >
                  <Text
                    style={[
                      styles.updateText,
                      {
                        color:
                          colors.buttonText,
                      },
                    ]}
                  >
                    Update
                  </Text>
                </TouchableOpacity>

              </View>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.noteTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {note.title}
              </Text>

              <Text
                style={[
                  styles.noteDate,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Created: {note.createdAt}
              </Text>

              <Text
                style={[
                  styles.updatedDate,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                Updated: {note.updatedAt}
              </Text>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />

              <Text
                style={[
                  styles.noteContentFull,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {note.content ||
                  "No content"}
              </Text>


              <View
                style={styles.actionRow}
              >

                <TouchableOpacity
                  style={[
                    styles.editButton,
                    {
                      backgroundColor:
                        colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    setEditing(true)
                  }
                >
                  <Text
                    style={[
                      styles.editText,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>

<TouchableOpacity
  style={[
    styles.deleteButton,
    { backgroundColor: "#DC2626" },
  ]}
  activeOpacity={0.7}
  onPress={deleteNote}
>
  <Text style={styles.deleteText}>
    Delete
  </Text>
</TouchableOpacity>
              </View>
            </>
          )}

        </View>
      </View>
    </SafeAreaView>
  );
}const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  topBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
  },

  topTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  themeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  themeIcon: {
    fontSize: 19,
  },

  noteContainer: {
    padding: 22,
  },

  noteTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },

  noteDate: {
    fontSize: 12,
    marginBottom: 5,
  },

  updatedDate: {
    fontSize: 12,
    marginBottom: 18,
  },

  divider: {
    height: 1,
    marginBottom: 20,
  },

  noteContentFull: {
    fontSize: 17,
    lineHeight: 27,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 7,
  },

  titleInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 17,
    marginBottom: 18,
  },

  contentInput: {
    height: 220,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 30,
  },

  editButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  editText: {
    fontSize: 15,
    fontWeight: "600",
  },

  deleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  deleteText: {
    fontSize: 15,
    fontWeight: "600",
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  updateButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  updateText: {
    fontSize: 15,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  notFound: {
    fontSize: 18,
    marginBottom: 15,
  },

  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backButtonText: {
    fontWeight: "600",
  },
});
