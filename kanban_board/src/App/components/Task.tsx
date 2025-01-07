import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove, update } from "firebase/database";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Searchbar from "./searchBar";

interface Task {
  id: string;
  name: string;
  column_id: string;
  due_date: string;
  user: string;
  status?: string;
}

const Task: React.FC = () => {
  const [data, setData] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const database = getDatabase(); // Initialize Firebase Realtime Database
    const tasksRef = ref(database, "Task Details"); // Reference to 'Task Details' node

    // Fetch data from Firebase
    const unsubscribe = onValue(tasksRef, (snapshot) => {
      if (snapshot.exists()) {
        const tasksData = snapshot.val() as Record<string, Task>;

        // Add default status if not available
        const tasksWithStatus = Object.entries(tasksData).map(([id, task]) => ({
          ...task,
          id,
          status: task.status || "Opened", // Default status if missing
        }));

        setData(tasksWithStatus); // Update state with data
      } else {
        setData({});
      }
    });

    return () => unsubscribe(); // Cleanup the Firebase listener
  }, []);

  const onDelete = (id: string): void => {
    if (window.confirm("Are you sure that you want to delete the Task?")) {
      const database = getDatabase();
      const taskRef = ref(database, `Task Details/${id}`);

      // Remove the task from Firebase
      remove(taskRef)
        .then(() => {
          toast.success("Task deleted successfully");
        })
        .catch((err) => {
          toast.error(`Error deleting task: ${err.message}`);
        });
    }
  };

  const onEdit = (id: string): void => {
    navigate(`/addtask/${id}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredTasks = (tasks: Task[]) => {
    if (!searchQuery) return tasks;

    return tasks.filter((task) => {
      const taskName = task.name ? task.name.toLowerCase() : "";
      const taskDueDate = task.due_date ? task.due_date.toLowerCase() : "";
      const taskUser = task.user ? task.user.toLowerCase() : "";
      const taskStatus =task.status ? task.status.toLowerCase():"";

      return (
        taskName.includes(searchQuery.toLowerCase()) ||
        taskDueDate.includes(searchQuery.toLowerCase()) ||
        taskUser.includes(searchQuery.toLowerCase()) || 
        taskStatus.includes(searchQuery.toLowerCase())
      );
    });
  };

  const filteredData = Object.entries(data)
    .map(([id, task]) => ({ id, ...task }))
    .filter((task) => filteredTasks([task]).length > 0);

  // Update the task status in Firebase
  const updateStatus = (id: string, value: string): void => {
    const database = getDatabase();
    const taskRef = ref(database, `Task Details/${id}`);

    // Update the status of the task in Firebase
    update(taskRef, {
      status: value,
    })
      .then(() => {
        toast.success("Task status updated successfully");
      })
      .catch((err) => {
        toast.error(`Error updating task status: ${err.message}`);
      });
  };

  return (
    <div className="mt-10 ml-10 mr-10">
      {/* Searchbar Section */}
      <div className="flex justify-between items-center mb-4">
        <Searchbar
          onSearchChange={handleSearchChange}
          showFilter={false}
          width={"80%"}
          height={60}
        />
      </div>
      <div className="mt-10 flex justify-center">
        <table className="min-w-full border-collapse bg-white shadow-lg">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-2 px-4 text-center">No.</th>
              <th className="py-2 px-4 text-center">Title</th>
              <th className="py-2 px-4 text-center">Assigned</th>
              <th className="py-2 px-4 text-center">Description</th>
              <th className="py-2 px-4 text-center">Due Date</th>
              <th className="py-2 px-4 text-center">Status</th>
              <th className="py-2 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 px-2 text-center text-gray-500">
                  No tasks found.
                </td>
              </tr>
            ) : (
              filteredData.map((task, index) => (
                <tr key={task.id} className="border-b even:bg-gray-100">
                  <td className="py-2 px-4 text-center">{index + 1}</td>
                  <td className="py-2 px-4 text-center">{task.name}</td>
                  <td className="py-2 px-4 text-center">{task.user}</td>
                  <td className="py-2 px-4 text-center">{task.description}</td>
                  <td className="py-2 px-4 text-center">{task.due_date}</td>
                  <td className="py-2 px-4 text-center">
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className="p-1 border rounded"
                    >
                      <option value="Opened">Opened</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                      onClick={() => onEdit(task.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 ml-2"
                      onClick={() => onDelete(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Task;
