import React, {useCallback, useEffect,useState,} from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect,} from "expo-router";
import { useTheme } from "../context/ThemeContext";

type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "@simple_notes";

export default function HomeScreen() {

  const {
    theme,
    colors,
    toggleTheme,
  } = useTheme();


  const [notes, setNotes] =
    useState<Note[]>([]);

  const [search, setSearch] =
    useState("");

  const [modalVisible, setModalVisible] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [loaded, setLoaded] =
    useState(false);


  const loadNotes = useCallback(
    async () => {
      try {
        const savedNotes =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (savedNotes) {
          const parsedNotes: Note[] =
            JSON.parse(savedNotes);

          setNotes(parsedNotes);
        } else {
          setNotes([]);
        }
      } catch (error) {
        console.log(
          "Failed to load notes:",
          error
        );
      } finally {
        setLoaded(true);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );


  useEffect(() => {
    if (!loaded) {
      return;
    }

    saveNotes(notes);
  }, [notes, loaded]);

  const saveNotes = async (
    updatedNotes: Note[]
  ) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedNotes)
      );
    } catch (error) {
      console.log(
        "Failed to save notes:",
        error
      );
    }
  };


  const handleAddNote = () => {
    setTitle("");
    setContent("");
    setModalVisible(true);
  };


  const handleSaveNote = async () => {
    if (
      !title.trim() &&
      !content.trim()
    ) {
      return;
    }

    const now =
      new Date().toLocaleString();

    const newNote: Note = {
      id: Date.now().toString(),
      title:
        title.trim() || "Untitled",
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const updatedNotes = [
      newNote,
      ...notes,
    ];

    setNotes(updatedNotes);

    await saveNotes(updatedNotes);

    closeModal();
  };

  const closeModal = () => {
    setModalVisible(false);
    setTitle("");
    setContent("");
  };

  const filteredNotes =
    notes.filter((note) => {
      const query =
        search.toLowerCase().trim();

      return (
        note.title
          .toLowerCase()
          .includes(query) ||
        note.content
          .toLowerCase()
          .includes(query)
      );
    });

  const renderNote = ({
    item,
  }: {
    item: Note;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.noteCard,
          {
            backgroundColor:
              colors.card,
            borderColor:
              colors.border,
          },
        ]}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/notes",
            params: {
              id: item.id,
            },
          })
        }
      >
        <View style={styles.noteMain}>
          <Text
            style={[
              styles.noteTitle,
              {
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={[
              styles.noteContent,
              {
                color:
                  colors.secondaryText,
              },
            ]}
            numberOfLines={2}
          >
            {item.content ||
              "No content"}
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
            {item.updatedAt}
          </Text>
        </View>

        <Text
          style={[
            styles.arrow,
            {
              color:
                colors.secondaryText,
            },
          ]}
        >
          ›
        </Text>
      </TouchableOpacity>
    );
  };

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

        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              Simple Notes
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              Your offline notes
            </Text>
          </View>

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

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor:
                colors.input,
              borderColor:
                colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Search notes..."
          placeholderTextColor={
            colors.placeholder
          }
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.countContainer}>
          <Text
            style={[
              styles.countText,
              {
                color:
                  colors.secondaryText,
              },
            ]}
          >
            {notes.length}{" "}
            {notes.length === 1
              ? "Note"
              : "Notes"}
          </Text>
        </View>

        {filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>

            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    colors.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.emptyIconText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                +
              </Text>
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {search
                ? "No Results"
                : "No Notes Yet"}
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.secondaryText,
                },
              ]}
            >
              {search
                ? "No note matches your search."
                : "Tap the + button to create your first note."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotes}
            keyExtractor={(item) =>
              item.id
            }
            renderItem={renderNote}
            contentContainerStyle={
              styles.list
            }
            showsVerticalScrollIndicator={
              false
            }
          />
        )}


        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor:
                colors.button,
            },
          ]}
          activeOpacity={0.8}
          onPress={handleAddNote}
        >
          <Text
            style={[
              styles.addButtonText,
              {
                color:
                  colors.buttonText,
              },
            ]}
          >
            +
          </Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            style={
              styles.modalBackground
            }
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
          >
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor:
                    colors.card,
                },
              ]}
            >

              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                New Note
              </Text>

              <Text
                style={[
                  styles.inputLabel,
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
                placeholder="Enter note title"
                placeholderTextColor={
                  colors.placeholder
                }
                value={title}
                onChangeText={setTitle}
                autoCapitalize="sentences"
              />

              <Text
                style={[
                  styles.inputLabel,
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
                placeholder="Write your note..."
                placeholderTextColor={
                  colors.placeholder
                }
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
              />

              {/* BUTTONS */}

              <View
                style={styles.modalButtons}
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
                  onPress={closeModal}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
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
                    styles.saveButton,
                    {
                      backgroundColor:
                        colors.button,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={
                    handleSaveNote
                  }
                >
                  <Text
                    style={[
                      styles.saveButtonText,
                      {
                        color:
                          colors.buttonText,
                      },
                    ]}
                  >
                    Save Note
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTextContainer: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
  },

  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },


  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },

  themeIcon: {
    fontSize: 20,
  },

  searchInput: {
    height: 48,
    marginHorizontal: 20,
    marginTop: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 15,
  },


  countContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },

  countText: {
    fontSize: 13,
    fontWeight: "600",
  },


  list: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },

  noteMain: {
    flex: 1,
    marginRight: 10,
  },

  noteTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },

  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },

  noteDate: {
    fontSize: 11,
  },

  arrow: {
    fontSize: 28,
    fontWeight: "300",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  emptyIconText: {
    fontSize: 30,
    fontWeight: "400",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },

  addButton: {
    position: "absolute",
    right: 24,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  addButtonText: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "400",
  },

  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor:
      "rgba(0, 0, 0, 0.35)",
  },

  modalContainer: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
  },

  titleInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    fontSize: 16,
    marginBottom: 16,
  },

  contentInput: {
    height: 160,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  saveButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
