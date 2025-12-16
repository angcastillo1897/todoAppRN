import { createHomeStyles } from "@/assets/styles/home.styles";
import EmptyState from "@/components/EmptyState";
import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import TodoInput from "@/components/TodoInput";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Alert,
    FlatList,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Todo = Doc<"todos">;

export default function Index() {
    const { colors } = useTheme();

    const [editingId, setEditingId] = React.useState<Id<"todos"> | null>(null);
    const [newTodoText, setNewTodoText] = React.useState("");

    const homeStyles = createHomeStyles(colors);

    const todos = useQuery(api.todos.getTodos);
    const toggleTodo = useMutation(api.todos.toggleTodo);
    const deleteTodo = useMutation(api.todos.deleteTodo);
    const updateTodo = useMutation(api.todos.updateTodo);

    const isLoading = todos === undefined;

    if (isLoading) return <LoadingSpinner />;

    const handleToggleTodo = async (id: Id<"todos">) => {
        try {
            await toggleTodo({ todoId: id });
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to toggle todo");
        }
    };

    const handleEditTodo = async (todo: Todo) => {
        setEditingId(todo._id);
        setNewTodoText(todo.text);
    };
    const handleEditSaveTodo = async (id: Id<"todos">) => {
        if (newTodoText.trim() === "") {
            Alert.alert("Error", "Todo text cannot be empty");
            return handleEditCancelTodo();
        }
        try {
            await updateTodo({ todoId: id, text: newTodoText });
            handleEditCancelTodo();
        } catch (error) {
            console.log(error);
            Alert.alert("Error", "Failed to edit todo");
        }
    };
    const handleEditCancelTodo = () => {
        setEditingId(null);
        setNewTodoText("");
    };

    const handleDeleteTodo = async (id: Id<"todos">) => {
        Alert.alert(
            "Delete Todo",
            "Are you sure you want to delete this todo?",
            [
                {
                    text: "Cancel",
                    onPress: () => {},
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteTodo({ todoId: id });
                        } catch (error) {
                            console.log(error);
                            Alert.alert("Error", "Failed to delete todo");
                        }
                    },
                },
            ]
        );
    };

    const renderTodoItem = ({ item }: { item: Todo }) => {
        const isEditing = editingId === item._id;
        return (
            <View style={homeStyles.todoItemWrapper}>
                <LinearGradient
                    colors={colors.gradients.surface}
                    style={homeStyles.todoItem}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <TouchableOpacity
                        style={homeStyles.checkbox}
                        activeOpacity={0.7}
                        onPress={() => handleToggleTodo(item._id)}
                    >
                        <LinearGradient
                            colors={
                                item.isCompleted
                                    ? colors.gradients.success
                                    : colors.gradients.muted
                            }
                            style={[
                                homeStyles.checkboxInner,
                                {
                                    borderColor: item.isCompleted
                                        ? "transparent"
                                        : colors.border,
                                },
                            ]}
                        >
                            {item.isCompleted && (
                                <Ionicons
                                    name="checkmark-outline"
                                    size={18}
                                    color="#fff"
                                />
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {isEditing ? (
                        <View style={homeStyles.editContainer}>
                            <TextInput
                                style={homeStyles.editInput}
                                value={newTodoText}
                                onChangeText={setNewTodoText}
                                autoFocus
                                multiline
                                placeholder="Edit your Todo..."
                                placeholderTextColor={colors.textMuted}
                            />
                            <View style={homeStyles.editButtons}>
                                <TouchableOpacity
                                    onPress={() => handleEditSaveTodo(item._id)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={colors.gradients.success}
                                        style={homeStyles.editButton}
                                    >
                                        <Ionicons
                                            name="checkmark-outline"
                                            size={14}
                                            color="#fff"
                                        />
                                        <Text style={homeStyles.editButtonText}>
                                            Save
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleEditCancelTodo()}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={colors.gradients.muted}
                                        style={homeStyles.editButton}
                                    >
                                        <Ionicons
                                            name="close-outline"
                                            size={14}
                                            color="#fff"
                                        />
                                        <Text style={homeStyles.editButtonText}>
                                            Cancel
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={homeStyles.todoTextContainer}>
                            <Text
                                style={[
                                    homeStyles.todoText,
                                    item.isCompleted && {
                                        textDecorationLine: "line-through",
                                        color: colors.textMuted,
                                        opacity: 0.7,
                                    },
                                ]}
                            >
                                {item.text}
                            </Text>
                            <View style={homeStyles.todoActions}>
                                <TouchableOpacity
                                    onPress={() => handleEditTodo(item)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={colors.gradients.warning}
                                        style={homeStyles.actionButton}
                                    >
                                        <Ionicons
                                            name="pencil"
                                            size={14}
                                            color="#fff"
                                        />
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeleteTodo(item._id)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={colors.gradients.danger}
                                        style={homeStyles.actionButton}
                                    >
                                        <Ionicons
                                            name="trash"
                                            size={14}
                                            color="#fff"
                                        />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </LinearGradient>
            </View>
        );
    };

    return (
        <LinearGradient
            colors={colors.gradients.background}
            style={homeStyles.container}
        >
            <StatusBar barStyle={colors.statusBarStyle} />
            <SafeAreaView style={homeStyles.safeArea}>
                <Header />
                <TodoInput />
                <FlatList
                    data={todos}
                    keyExtractor={(item) => item._id}
                    renderItem={renderTodoItem}
                    style={homeStyles.todoList}
                    contentContainerStyle={homeStyles.todoListContent}
                    ListEmptyComponent={<EmptyState />}
                    // showsVerticalScrollIndicator={false}
                />
            </SafeAreaView>
        </LinearGradient>
    );
}
