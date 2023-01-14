const UtilTasks =  (() => {
  /**
   * Get all task lists.
   * @return {Object(TaskList) | null}
   */
  const getTaskLists = () => {
    const taskLists = Tasks.Tasklists.list();

    if (taskLists.items) {
      return taskLists;
    } else {
      return null;
    }
  }

  // The followings are for only public use.
  return {
    getTaskLists
  };
})();