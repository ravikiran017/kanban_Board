import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDatabase, ref, get, set, push } from "firebase/database";
import { toast } from "react-toastify";

const AddTask: React.FC = () => {
  const { id } = useParams<{ id?: string }>(); // Read the task ID from the URL
  const [taskData, setTaskData] = useState({
    task_name: "",
    user: "",
    description: "",
    due_date: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Fetch task data for editing
      const fetchTaskData = async () => {
        try {
          const database = getDatabase();
          const taskRef = ref(database, `Task Details/${id}`);
          const snapshot = await get(taskRef);
          if (snapshot.exists()) {
            setTaskData(snapshot.val());
          } else {
            toast.error("Task not found.");
            navigate("/home"); // Navigate back to home if task not found
          }
        } catch (error) {
          toast.error(`Error fetching task: ${(error as Error).message}`);
        }
      };
      fetchTaskData();
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { task_name, user, description, due_date } = taskData;

    if (!task_name || !user || !description || !due_date) {
      toast.error("Please fill out all fields.");
      return;
    }

    try {
      const database = getDatabase();
      if (id) {
        // Update existing task
        const taskRef = ref(database, `Task Details/${id}`);
        await set(taskRef, taskData);
        toast.success("Task updated successfully!");
      } else {
        // Add new task
        const tasksRef = ref(database, "Task Details");
        await push(tasksRef, taskData);
        toast.success("Task added successfully!");
      }

      navigate("/home"); // Navigate back to home after submission
    } catch (error) {
      toast.error(`Error saving task: ${(error as Error).message}`);
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <form
        className="w-full max-w-md bg-white p-6 rounded-md shadow-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold mb-4">{id ? "Edit Task" : "Add Task"}</h2>
        <label htmlFor="task_name" className="block mb-2 text-gray-700">
          Task Name
        </label>
        <input
          type="text"
          id="task_name"
          name="task_name"
          value={taskData.task_name}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          placeholder="Enter task name..."
        />

        <label htmlFor="user" className="block mb-2 text-gray-700">
          Assigned To
        </label>
        <input
          type="text"
          id="user"
          name="user"
          value={taskData.user}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          placeholder="Enter assigned user..."
        />

        <label htmlFor="description" className="block mb-2 text-gray-700">
          Description
        </label>
        <input
          type="text"
          id="description"
          name="description"
          value={taskData.description}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
          placeholder="Enter description..."
        />

        <label htmlFor="due_date" className="block mb-2 text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          id="due_date"
          name="due_date"
          value={taskData.due_date}
          onChange={handleInputChange}
          className="w-full mb-6 p-2 border border-gray-300 rounded-md"
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          {id ? "Update Task" : "Add Task"}
        </button>
      </form>
    </div>
  );
};

export default AddTask;
