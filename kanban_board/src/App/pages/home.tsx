import React, { useEffect, useState } from "react";
import { getDatabase, onValue, push, ref, remove, set, update } from "firebase/database";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Searchbar from "../components/searchBar";
import { toast } from "react-toastify";

interface Task {
  id: string;
  name: string;
  column_id: string;
  due_date: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const Home: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([
    { id: "1", title: "Task List", tasks: [] }, // Hardcoded Task List column
  ]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newColumnTitle, setNewColumnTitle] = useState("");

  useEffect(() => {
    const database = getDatabase();

    const columnsRef = ref(database, "Columns");
    const tasksRef = ref(database, "Task Details");

    const unsubscribeColumns = onValue(columnsRef, (snapshot) => {
      if (snapshot.exists()) {
        const firebaseColumns = snapshot.val();
        const columns = Object.keys(firebaseColumns).map((id) => ({
          id, // Use the Firebase key as column ID
          title: firebaseColumns[id].title || "Untitled Column",
          tasks: [], // Placeholder for tasks, updated later
        }));

        // Ensure "Task List" is always preserved with ID 0
        setColumns((prevColumns) => {
          const taskListColumn = prevColumns.find((col) => col.id === "0") || {
            id: "0",
            title: "Task List",
            tasks: prevColumns.find((col) => col.id === "0")?.tasks || [],
          };

          return [taskListColumn, ...columns];
        });
      } else {
        // Handle other errors
        toast.error(`Unexpected error}`);
      }
    });

    const unsubscribeTasks = onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const firebaseTasks = snapshot.val();
        const tasks = Object.keys(firebaseTasks).map((id) => ({
          id,
          name: firebaseTasks[id].task_name,
          column_id: firebaseTasks[id].column_id || "default",
          due_date: firebaseTasks[id].due_date || "No due date",
        }));

        setColumns((prevColumns) => {
          return prevColumns.map((col) => {
            if (col.id === "0") {
              // Task List contains all tasks
              return { ...col, tasks: tasks };
            }

            // Filter tasks for specific columns
            const tasksForColumn = tasks.filter((task) => task.column_id === col.id);
            return { ...col, tasks: tasksForColumn };
          });
        });
      } else {
        console.log("No data available in 'Task Details' node.");
      }
    });

    return () => {
      unsubscribeColumns();
      unsubscribeTasks();
    };
  }, []);

  // Function to update Firebase after drag-and-drop
  const updateTasksInFirebase = (updatedColumns: Column[]) => {
    const database = getDatabase();
    const updates: { [key: string]: any } = {};

    updatedColumns.forEach((column) => {
      column.tasks.forEach((task, index) => {
        updates[`Task Details/${task.id}`] = {
          task_name: task.name,
          column_id: column.id,
          due_date: task.due_date,
          position: index,
        };
      });
    });

    update(ref(database), updates);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination || source.droppableId === destination.droppableId) return;

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destinationColumn = columns.find(
      (col) => col.id === destination.droppableId
    );

    if (sourceColumn && destinationColumn) {
      const sourceTasks = Array.from(sourceColumn.tasks);
      const destinationTasks = Array.from(destinationColumn.tasks);

      // Find the moved task
      const [movedTask] = sourceTasks.splice(source.index, 1);

      // Clone the task to avoid mutation and add it to the destination
      const clonedTask = { ...movedTask };
      destinationTasks.splice(destination.index, 0, clonedTask);

      // Update the task's column_id for the copied task
      clonedTask.column_id = destinationColumn.id;

      // Update state with the new columns
      const updatedColumns = columns.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, tasks: sourceTasks };
        }
        if (col.id === destinationColumn.id) {
          return { ...col, tasks: destinationTasks };
        }
        return col;
      });

      setColumns(updatedColumns);
      updateTasksInFirebase(updatedColumns); // Persist changes to Firebase
    }
  };

  // Function to handle adding a new column
  const addNewColumn = (newColumnTitle: string) => {
    const database = getDatabase();
    const columnsRef = ref(database, "Columns");

    const newColumn = {
      title: newColumnTitle,
    };

    const newColumnRef = push(columnsRef);
    set(newColumnRef, newColumn)
      .then(() => {
        toast.error("New column added successfully.");
      })
      .catch((error) => {
        toast.error("Error adding new column:", error);
      });
  };

  const editColumnTitle = (id: string, newTitle: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, title: newTitle } : col))
    );
  };

  const deleteColumn = (id: string) => {
    // Check if the column is the first column (Task List)
    if (id === columns[0].id) {
      alert("You cannot delete the first column.");
      return;
    }

    // Proceed with deletion if it's not the first column
    const database = getDatabase();
    const columnRef = ref(database, `Columns/${id}`);
    remove(columnRef); // Remove the column from Firebase

    // Update the columns state
    setColumns((prev) => prev.filter((col) => col.id !== id));
  };



  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredTasks = (tasks: Task[]) => {
    if (!searchQuery) return tasks;
    return tasks.filter((task) => {
      const taskName = task.name ? task.name.toLowerCase() : "";
      const taskDueDate = task.due_date ? task.due_date.toLowerCase() : "";
      return taskName.includes(searchQuery.toLowerCase()) || taskDueDate.includes(searchQuery.toLowerCase());
    });
  };

  return (
    <div className="container-xl bg-[#f4f6f8] rounded-t-xl" style={{ height: "100vh" }}>
      <div className="layout-body-wrapper ml-6 pt-6 grid grid-cols-2">
        <Searchbar
          onSearchChange={handleSearchChange}
          showFilter={false}
          width={"120%"}
          height={60} />
        <div className="mb-4 mr-4 text-right">
          <input
            type="text"
            placeholder="Enter column name"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)} // Update state on input change
            className="px-4 py-2 border rounded mr-2"
          />
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              if (newColumnTitle.trim() === "") {
                alert("Please enter a column name before adding.");
                return;
              }
              addNewColumn(newColumnTitle);
              setNewColumnTitle(""); // Clear input after adding
            }}
          >
            Add Column
          </button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mb-6 mt-3 mr-3 p-4 bg-white rounded shadow"
                >
                  <div className="flex justify-between items-center">
                    <input
                      className="text-xl font-semibold border-none bg-transparent focus:ring-0 focus:outline-none"
                      value={column.title}
                      onChange={(e) => editColumnTitle(column.id, e.target.value)}
                    />
                    <div>
                      {/* Conditionally render the delete button only if it's not the first column */}
                      {column.id !== columns[0].id && (
                        <button className="text-red-500 hover:text-red-700" onClick={() => deleteColumn(column.id)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="border-b my-4"></div>
                  <ul>
                    {filteredTasks(column.tasks).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center py-2"
                          >
                            <input type="radio" className="mr-2" />
                            <span className="font-semibold">{task.name}</span>
                            {task.due_date && (
                              <span className="ml-auto text-gray-500">Due: {task.due_date}</span>
                            )}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
    </div>
  );
};

export default Home;
