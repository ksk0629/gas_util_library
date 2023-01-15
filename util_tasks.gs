const UtilTasks = (() => {
  // >>> public >>>
  /**
   * Get all task lists.
   * @return {Object(TaskList) | undefined} task lists if it exists
   */
  const getTaskLists = () => {
    const taskLists = Tasks.Tasklists.list();

    return taskLists.items;
  }

  /**
   * Get tasks in a task list, which is specified by a given taskListId.
   * @param {String} taskListId - an identifier of a task list
   * @return {Object(Task) | undefined} tasks if it exists
   */
  const getTasks = (taskListId) => {
    const tasks = Tasks.Tasks.list(taskListId);

    return tasks.items;
  }

  /**
   * Add a new task into a task list, which is specified by a given taskListId.
   * A due of a task must be after today if being specified.
   * @param {String} taskListId - an identifier of a task list
   * @param {String} title - a title of a new task
   * @param {String | null} notes - notes of a new task or null
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
   * @param {String} taskListId - an identifier of a task list
   * @param {String} title - a title of a new task
   */
  const addSimpleTask = (taskListId, title) => {
    addTask(taskListId, title, null, null, null, null);
  }

  /**
   * Remove a task from a task list, which are specified by ID's.
   * @param {String} taskListId - an identifier of a task list
   * @param {String} taskId - an identifier of a task
   */
  const removeTask = (taskListId, taskId) => {
    Tasks.Tasks.remove(taskListId, taskId);
  }

  /**
   * Change a task list of a task, which are specified by ID's.
   * @param {String} originalTaskListId - an identifier of an original task list
   * @param {String} newTaskListId - an identifier of a new task list
   * @param {String} taskId - an identifier of a task
   */
  const changeTaskList = (originalTaskListId, newTaskListId, taskId) => {
    const targetTask = getTaskById(originalTaskListId, taskId)
    if (targetTask) {
      removeTask(originalTaskListId, targetTask.id);
      addTaskWithDue(newTaskListId, targetTask.title, targetTask.notes, targetTask.due);
    }
  }
  
  /**
   * Change a parent task of a task.
   * @param {String} taskListId - an identifier of a task list
   * @param {String} taskId - an identifier of a task, which is a child task
   * @param {String} newParentId - an identifier of a parent task
   */
  const changeParentTask = (taskListId, taskId, newParentTaskId) => {
    const targetTask = getTaskById(taskListId, taskId)
    if (targetTask) {
      Tasks.Tasks.move(taskListId, taskId, {"parent": newParentTaskId});
    }
  }

  /**
   * Update a task simply.
   * @param {String} taskListId - an identifieer of a task list
   * @param {String} taskId - an identifier of a task
   * @param {String | null} newTitle - a new title of a task
   * @param {String | null} newNotes - new notes of a task
   * @param {Number | null} newYear - a new year
   * @param {Number | null} newMonth - a new month
   * @param {Number | null} newDate - a new date
   */
  const updateTaskSimply = (taskListId, taskId, newTitle, newNotes, newYear, newMonth, newDate) => {
    let due = null;
    if (Validation.isAfterToday(newYear, newMonth, newDate)) {
      const dueDate = new Date(Date.UTC(newYear, newMonth - 1, newDate));
      due = Utilities.formatDate(dueDate, "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
    }

    updateTaskSimplyWithDue(taskListId, taskId, newTitle, newNotes, due);
  }

  /** 
   * Mark a task as completed.
   * @param {String} taskListId - an identifier of a task list
   * @param {String} taskId - an identifier of a task
   */
  const completeTask = (taskListId, taskId) => {
    const targetTask = getTaskById(taskListId, taskId)
    if (targetTask) {
      const doneTask = {...targetTask};
      doneTask.status = "completed";

      Tasks.Tasks.update(doneTask, taskListId, targetTask.id);
    }
  }

  /**
   * Add a task list.
   * @param {String} taskListTitle - a title of a task list
   */
  const addTaskList = (taskListTitle) => {
    const taskList = {
      "title": taskListTitle,
    };
    Tasks.Tasklists.insert(taskList);
  }

  /**
   * Remove a task list, which is specified by an ID.
   * @param {String} taskListId - an identifier of a task list
   */
  const removeTaskList = (taskListId) => {
    Tasks.Tasklists.remove(taskListId);
  }
  // <<< public <<<

  // >>> private >>>
  /**
   * Get a task in a task list, which are specified by ID's.
   * @param {String} taskListId - an identifier of a task list
   * @param {String} taskId - an identifier of a task
   * @return {Task | null | undefined} a target task if it does exist
   */
  const getTaskById = (taskListId, taskId) => {
    const tasks = getTasks(taskListId);
    if (tasks) {
      const targetTask = tasks.find((task) => task.id === taskId);
      return targetTask;
    }
    return null;
  }

  /**
   * Add a new task into a task list, which is specified by a given taskListId, with due.
   * @param {String} taskListId - an identifier of a task list
   * @param {String} title - a title of a new task
   * @param {String | null} notes - notes of a new task or null
   * @param {String | null} due - due of a new task or null
   */
  const addTaskWithDue = (taskListId, title, notes, due) => {
    const task = {
      "title": title,
      "notes": notes,
      "due" : due
    }
    Tasks.Tasks.insert(task, taskListId);
  }

  /**
   * Update a task simply with a due.
   * @param {String} taskListId - an identifieer of a task list
   * @param {String} taskId - an identifier of a task
   * @param {String | null} newTitle - a new title of a task
   * @param {String | null} newNotes - new notes of a task
   * @param {String | null} newDue - a new due
   */
  const updateTaskSimplyWithDue = (taskListId, taskId, newTitle, newNotes, newDue) => {
    const targetTask = getTaskById(taskListId, taskId);
    if (targetTask) {
      const newTask = {...targetTask};
      newTask.title = newTitle;
      newTask.notes = newNotes;
      newTask.due = newDue;

      Tasks.Tasks.update(newTask, taskListId, targetTask.id);
    }
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
    changeParentTask,
    updateTaskSimply,
    completeTask,
    addTaskList,
    removeTaskList
  };
})();

function test() {
  // Define test-util functions
  const addNewTaskOnToday = (taskListId, taskTitle) => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    const notes = "This is notes.";
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    UtilTasks.addTask(taskListId, taskTitle, notes, year, month, date);
  }
  const getTaskByTitle = (taskListId, taskTitle) => {
    const tasks = UtilTasks.getTasks(taskListId);
    if (tasks) {
      const targetTask = tasks.find((task) => task.title === taskTitle);
      return targetTask;
    }
  }
  const getTaskListByTitle = (taskListTitle) => {
    const taskLists = UtilTasks.getTaskLists();
    if (taskLists) {
      const taregetTaskList = taskLists.find((taskList) => taskList.title === taskListTitle);
      return taregetTaskList;
    }
  }

  // Check for getTaskLists function
  const taskLists = UtilTasks.getTaskLists();
  console.log("getTaskLists: Successfully done.");

  const taskList = taskLists[0];

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
  if (taskLists.length >= 2) {
    const newTaskList = taskLists[1];
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

  // Check for updateTask function
  addNewTaskOnToday(taskList.id, taskTitle);
  targetTask = getTaskByTitle(taskList.id, taskTitle);
  UtilTasks.updateTaskSimply(taskList.id, targetTask.id, newTaskTitle, null, null, null);
  UtilTasks.removeTask(taskList.id, targetTask.id);
  console.log("updateTaskSimply: Successfully done.");

  // // Check for completeTask function
  // addNewTaskOnToday(taskList.id, taskTitle);
  // targetTask = getTaskByTitle(taskList.id, taskTitle);
  // UtilTasks.completeTask(taskList.id, targetTask.id);
  // console.log("completeTask: Successfully done.");

  // Check for addTaskList function
  const taskListTitle = "testTask List!";
  UtilTasks.addTaskList(taskListTitle);
  console.log("addTaskList: Successfully done.");

  // Check for removeTaskList function
  let targetTaskList = getTaskListByTitle(taskListTitle);
  UtilTasks.removeTaskList(targetTaskList.id);
  console.log("removeTaskList: Successfully done.");
}

function exportUtilTasks () {
  return UtilTasks;
}
