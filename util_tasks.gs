const UtilTasks =  (() => {
  // >>> public >>>
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

    addTaskWithDue(taskListId, title, notes, due);
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

  /**
   * Change a task list of a task, which are specified by ID's.
   * @param {string} originalTaskListId - an identifier of an original task list
   * @param {string} newTaskListId - an identifier of a new task list
   * @param {string} taskId - an identifier of a task
   */
  const changeTaskList = (originalTaskListId, newTaskListId, taskId) => {
    const targetTask = getTaskById(originalTaskListId, taskId)
    if (targetTask) {
      removeTask(originalTaskListId, targetTask.id);
      addTaskWithDue(newTaskListId, targetTask.title, targetTask.notes, targetTask.due);
    }
  }
  
  const changeParentTask = (taskListId, taskId, newParentTaskId) => {
    const targetTask = getTaskById(taskListId, taskId)
    if (targetTask) {
      Tasks.Tasks.move(taskListId, taskId, {"parent": newParentTaskId});
    }
  }
  // <<< public <<<

  // >>> private >>>
  /**
   * Get a task in a task list, which are specified by ID's.
   * @param {string} taskListId - an identifier of a task list
   * @param {string} taskId - an identifier of a task
   * @return {Object(Task) | null | undefined} a target task if it does exist
   */
  const getTaskById = (taskListId, taskId) => {
    const tasks = getTasks(taskListId);
    if (tasks) {
      const targetTask = tasks.items.find((task) => task.id === taskId);
      return targetTask;
    }
    return null;
  }

  /**
   * Add a new task into a task list, which is specified by a given taskListId, with due.
   * @param {string} taskListId - an identifier of a task list
   * @param {string} title - a title of a new task
   * @param {string | null} notes - notes of a new task or null
   * @param {string | null} due - due of a new task or null
   */
  const addTaskWithDue = (taskListId, title, notes, due) => {
    const task = {
      "title": title,
      "notes": notes,
      "due" : due
    }
    Tasks.Tasks.insert(task, taskListId);
  }
  // <<< private <<<

  // The followings are for only public use.
  return {
    getTaskLists, 
    getTasks,
    addTask,
    addSimpleTask,
    removeTask,
    changeTaskList,
    changeParentTask
  };
})();

function test() {
  // Define test-util functions
  const addNewTaskOnToday = (taskListId, taskTitle) => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const notes = "This is notes.";
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1;
    const date = today.getUTCDate();
    UtilTasks.addTask(taskListId, taskTitle, notes, year, month, date);
  }
  const getTaskByTitle = (taskListId, taskTitle) => {
    const tasks = UtilTasks.getTasks(taskListId);
    let targetTask = null;
    for (task of tasks.items) {
      if (task.title === taskTitle) {
        targetTask = task;
        break;
      }
    }
    return targetTask;
  }

  // Check for getTaskLists function
  const taskLists = UtilTasks.getTaskLists();
  console.log("getTaskLists: Successfully done.");

  const taskList = taskLists.items[0];

  // Check for getTasks function
  const tasks = UtilTasks.getTasks(taskList.id);
  console.log("getTasks: Successfully done.");

  // Check four addTask function
  const taskTitle = "test task title";
  addNewTaskOnToday(taskList.id, taskTitle);
  console.log("addTask: Successfully done.");

  // Check for deleteTask function
  let targetTask = getTaskByTitle(taskList.id, taskTitle);
  if (targetTask){
    UtilTasks.removeTask(taskList.id, targetTask.id);
    console.log("deleteTask: Successfully done.");
  }

  // Check for changeTaskList function
  if (taskLists.items[1]) {
    const newTaskList = taskLists.items[1];
    addNewTaskOnToday(taskList.id, taskTitle);
    targetTask = getTaskByTitle(taskList.id, taskTitle);
    if (targetTask) {
      UtilTasks.changeTaskList(taskList.id, newTaskList.id, targetTask.id);
      targetTask = getTaskByTitle(newTaskList.id, taskTitle);
      if (targetTask) {
        UtilTasks.removeTask(newTaskList.id, targetTask.id);
        console.log("ChangeTaskList: Successfully done.");
      }
    }
  }

  // Check for changeParentTask function
  addNewTaskOnToday(taskList.id, taskTitle);
  const newTaskTitle = "this is new task title baby!";
  addNewTaskOnToday(taskList.id, newTaskTitle);
  targetTask = getTaskByTitle(taskList.id, taskTitle);
  let newTargetTask = getTaskByTitle(taskList.id, newTaskTitle);
  if (targetTask && newTargetTask) {
    UtilTasks.changeParentTask(taskList.id, targetTask.id, newTargetTask.id);
    UtilTasks.removeTask(taskList.id, newTargetTask.id);
    console.log("changeParentTask: Successfully done.");
  }
}
