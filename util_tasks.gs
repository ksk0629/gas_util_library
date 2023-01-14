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

  // The followings are for only public use.
  return {
    getTaskLists, 
    getTasks,
  };
})();
