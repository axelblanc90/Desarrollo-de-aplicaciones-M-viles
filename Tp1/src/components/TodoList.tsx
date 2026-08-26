import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../types/todo';
import { colors, ThemeType, useThemeStyles } from '../hooks/useThemeStyles';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TodoListProps {
  theme: ThemeType;
}

type FilterType = 'all' | 'active' | 'completed';

const STORAGE_KEY = '@todos_key';

export const TodoList: React.FC<TodoListProps> = ({ theme }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  // States for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // Refs for tracking double tap
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  const globalStyles = useThemeStyles(theme);
  const activeColors = colors[theme];

  // Load todos on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTodos(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load todos from storage', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTodos();
  }, []);

  // Centralized state updater that saves to storage and animates layout changes
  const updateTodosState = (newTodos: Todo[]) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTodos(newTodos);
    if (isLoaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos)).catch((e) =>
        console.error('Failed to save todos to storage', e)
      );
    }
  };

  const handleAddTodo = () => {
    const trimmedText = inputText.trim();
    if (!trimmedText) return;

    const newTodo: Todo = {
      id: Date.now().toString(),
      title: trimmedText,
      completed: false,
      createdAt: Date.now(),
    };

    updateTodosState([newTodo, ...todos]);
    setInputText('');
  };

  const handleTodoPress = (id: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    // Check if double tap on the same item (within 300ms)
    if (lastTap && lastTap.id === id && now - lastTap.time < 300) {
      // Double tap: Start inline editing
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        setEditingId(id);
        setEditingText(todo.title);
      }
      lastTapRef.current = null; // Reset double tap tracker
    } else {
      // Single tap: Toggle completed state
      lastTapRef.current = { id, time: now };
      
      // Delay check slightly to differentiate single from double tap
      setTimeout(() => {
        // Only trigger single tap if another tap didn't clear the ref (which double tap does)
        if (lastTapRef.current && lastTapRef.current.id === id && lastTapRef.current.time === now) {
          const newTodos = todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          );
          updateTodosState(newTodos);
        }
      }, 250);
    }
  };

  const handleLongPressDelete = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    Alert.alert(
      'Confirmar Eliminación',
      `¿Deseas eliminar la tarea "${todo.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const newTodos = todos.filter((t) => t.id !== id);
            updateTodosState(newTodos);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleSaveEdit = (id: string) => {
    const trimmedEdit = editingText.trim();
    if (!trimmedEdit) {
      // Keep old title if edited content is empty
      setEditingId(null);
      return;
    }

    const newTodos = todos.map((t) =>
      t.id === id ? { ...t, title: trimmedEdit } : t
    );
    updateTodosState(newTodos);
    setEditingId(null);
  };

  // Filter computation
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed).length;

  const renderTodoItem = ({ item }: { item: Todo }) => {
    const isEditing = editingId === item.id;

    return (
      <Pressable
        onPress={() => handleTodoPress(item.id)}
        onLongPress={() => handleLongPressDelete(item.id)}
        style={({ pressed }) => [
          styles.todoItem,
          {
            backgroundColor: activeColors.card,
            borderColor: activeColors.border,
            opacity: pressed && Platform.OS === 'ios' ? 0.8 : 1,
          },
        ]}
        android_ripple={{ color: activeColors.ripple }}
      >
        <View style={styles.todoContentContainer}>
          <Pressable
            onPress={() => {
              // Quick check: checkbox direct press toggles state
              const newTodos = todos.map((t) =>
                t.id === item.id ? { ...t, completed: !t.completed } : t
              );
              updateTodosState(newTodos);
            }}
            style={styles.checkbox}
          >
            <Ionicons
              name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={item.completed ? activeColors.success : activeColors.textSecondary}
            />
          </Pressable>

          {isEditing ? (
            <TextInput
              value={editingText}
              onChangeText={setEditingText}
              onBlur={() => handleSaveEdit(item.id)}
              onSubmitEditing={() => handleSaveEdit(item.id)}
              autoFocus
              style={[
                styles.editInput,
                { color: activeColors.text, borderBottomColor: activeColors.primary },
              ]}
            />
          ) : (
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.todoText,
                  { color: activeColors.text },
                  item.completed && [
                    styles.todoTextCompleted,
                    { color: activeColors.textSecondary },
                  ],
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <Text style={[styles.hintText, { color: activeColors.textSecondary }]}>
                Doble tap para editar • Mantén presionado para borrar
              </Text>
            </View>
          )}
        </View>

        {isEditing && (
          <Pressable onPress={() => handleSaveEdit(item.id)} style={styles.saveIcon}>
            <Ionicons name="checkmark" size={20} color={activeColors.success} />
          </Pressable>
        )}
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <View style={[globalStyles.card, styles.container]}>
        <Text style={[globalStyles.title, styles.title]}>Mis Tareas</Text>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="¿Qué tienes planeado hacer hoy?"
            placeholderTextColor={activeColors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleAddTodo}
            style={[
              globalStyles.input,
              styles.input,
              { backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC' },
            ]}
          />
          <Pressable
            onPress={handleAddTodo}
            disabled={!inputText.trim()}
            style={({ pressed }) => [
              globalStyles.button,
              styles.addButton,
              !inputText.trim() && styles.addButtonDisabled,
              {
                opacity: pressed && Platform.OS === 'ios' ? 0.8 : 1,
              },
            ]}
            android_ripple={{ color: '#FFFFFF30' }}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Filters and Stats */}
        <View style={styles.filterSection}>
          <View style={styles.filterBar}>
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => {
              const isActive = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setFilter(f);
                  }}
                  style={[
                    styles.filterTab,
                    isActive && {
                      backgroundColor: activeColors.activeFilterBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      { color: activeColors.textSecondary },
                      isActive && {
                        color: activeColors.activeFilterText,
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Listas'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.statsText, { color: activeColors.textSecondary }]}>
              {completedCount} de {totalCount} completadas
            </Text>
          </View>
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item.id}
          renderItem={renderTodoItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="clipboard-outline"
                size={48}
                color={activeColors.textSecondary + '60'}
              />
              <Text style={[styles.emptyText, { color: activeColors.textSecondary }]}>
                {filter === 'all'
                  ? 'No tienes tareas pendientes.'
                  : filter === 'active'
                  ? 'No hay tareas activas.'
                  : 'No has completado ninguna tarea.'}
              </Text>
            </View>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    width: '100%',
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    marginBottom: 0,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.06)',
    padding: 3,
    marginBottom: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.02)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  todoContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  todoTextCompleted: {
    textDecorationLine: 'line-through',
  },
  hintText: {
    fontSize: 10,
    marginTop: 2,
  },
  editInput: {
    flex: 1,
    fontSize: 15,
    borderBottomWidth: 1,
    paddingVertical: 2,
    fontWeight: '500',
  },
  saveIcon: {
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});
