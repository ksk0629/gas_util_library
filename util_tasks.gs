const UtilTasks =  (() => {
  /**
   * Get all task lists.
   * @return {Object(TaskList) | null} todo lists or null if there is nothing
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
   * @param {string | null} notes - notes of a new task
   * @param {number | null} year - year to be done, of a new task
   * @param {number | null} month - month to be done, of a new task
   * @param {number | nill} date - date to be done, of a new task
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

  // The followings are for only public use.
  return {
    getTaskLists, 
    getTasks,
    addTask,
    addSimpleTask,
  };
})();
