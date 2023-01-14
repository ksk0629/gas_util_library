const UtilTasks =  (() => {
  /**
   * Get all task lists.
   * @return {Object(TaskList) | null} task lists or null if there is nothing
   */
  const getTaskLists = () => {
    const taskLists = Tasks.Tasklists.list();

    if (taskLists.items) {
      return taskLists;
    } else {
      return null;
    }
  }

  /**
   * Get tasks in a task list, which is specified by a given taskListId.
   * @param {string} taskListId - an identifier of a task list
   * @return {Object(Task) | null} tasks or null if there is nothing
   */
  const getTasks = (taskListId) => {
    const tasks = Tasks.Tasks.list(taskListId);

    if (tasks.items) {
      return tasks;
    } else {
      return null;
    }
  }

  /**
   * Add a new task into a task list, which is specified by a given taskListId.
   * A due of a task must be after today if being specified.
   * @param {string} taskListId - an identifier of a task list
   * @param {string} title - a title of a new task
   * @param {string | null} notes - notes of a new task or null
   * @param {number | null} year - year to be done, of a new task or null
   * @param {number | null} month - month to be done, of a new task or null
   * @param {number | nill} date - date to be done, of a new task or null
   */
  const addTask = (taskListId, title, notes, year, month, date) => {
    let due = null;
    if (Validation.isAfterToday(year, month, date)) {
      const dueDate = new Date(Date.UTC(year, month - 1, date));
      due = Utilities.formatDate(dueDate, "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
    }
    const task = {
      "title": title,
      "notes": notes,
      "due" : due
    }
    Tasks.Tasks.insert(task, taskListId);
  }

  /**
   * Add a new task that has only title into a task list, which is specified by a given taskListId.
   * @param {string} taskListId - an identifier of a task list
   * @param {string} title - a title of a new task
   */
  const addSimpleTask = (taskListId, title) => {
    addTask(taskListId, title, null, null, null, null);
  }

  /**
   * Remove a task from a task list, which are specified by ID's.
   * @param {string} taskListId - an identifier of a task list
   * @param {string} taskId - an identifier of a task
   */
  const removeTask = (taskListId, taskId) => {
    Tasks.Tasks.remove(taskListId, taskId);
  }

  // The followings are for only public use.
  return {
    getTaskLists, 
    getTasks,
    addTask,
    addSimpleTask,
    removeTask,
  };
})();

function test() {
  // Check for getTaskLists function
  const taskLists = UtilTasks.getTaskLists();
  console.log("getTaskLists: Successfuly done.");

  const taskList = taskLists.items[0];

  // Check for getTasks function
  const tasks = UtilTasks.getTasks(taskList.id);
  console.log("getTasks: Successfuly done.");

  // Check four addTask function
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const taskTitle = "test task title";
  const notes = "This is notes.";
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth() + 1;
  const date = today.getUTCDate();
  UtilTasks.addTask(taskList.id, taskTitle, notes, year, month, date);
  console.log("addTask: Successfuly done.");

  // Check for deleteTask function
  const updatedTasks = UtilTasks.getTasks(taskList.id);
  let addedTask = null;
  for (task of updatedTasks.items) {
    if (task.title === taskTitle) {
      addedTask = task;
      break;
    }
  }
  if (addedTask){
    UtilTasks.removeTask(taskList.id, addedTask.id);
    console.log("deleteTask: Successfuly done.");
  }
}
