var TemplateCreator = class TemplateCreator {
  /**
   * Constructor.
   */
  constructor() {
    this.allTasksSheetName = "all tasks";
    this.headerRowPosition = 1;
    this.firstRowPosition = 2;
    
    let currentUsedColumns = 1;
    this.fisrtColumnPosition = currentUsedColumns;

    this.numberColumnPosition = currentUsedColumns++;
    this.taskListTitleColumnPosition = currentUsedColumns++;
    this.statusColumnPosition = currentUsedColumns++;
    this.taskTitleColumnPosition = currentUsedColumns++;
    this.parentTitleColumnPosition = currentUsedColumns++;
    this.dueColumnPosition = currentUsedColumns++;
    this.notesColumnPosition = currentUsedColumns++;

    this.usedColumnPositions = Array.from(Array(currentUsedColumns - this.fisrtColumnPosition)).map((e, i) => i + 1);
    this.necessaryColumnPositions = [this.taskListTitleColumnPosition, this.taskTitleColumnPosition];

    this.extraRows = 30;
    this.separater = ":";
    this.extraWidthForButton = 20;
  }

  /**
   * Create a sheet for showing all tasks. This method is intented to be private.
   * @param {Spreadsheet} spreadsheet -  a created sheet
   * @return {Sheet} a created sheet
   */
  __createAllTasksSheet(spreadsheet) {
    // Check if "all tasks" sheet exists and if it does, remove the sheet.
    let allTasksSheet = spreadsheet.getSheetByName(this.allTasksSheetName);
    if (allTasksSheet) {
      spreadsheet.deleteSheet(allTasksSheet);
    }
    
    // Create a new sheet and name it this.allTasksSheetName.
    allTasksSheet = spreadsheet.insertSheet();
    allTasksSheet.setName(this.allTasksSheetName);

    const setupAllTasksSheet = this.__setupSheetForAllTasks(allTasksSheet);

    return setupAllTasksSheet;
  }

  /**
   * set a sheet up for showing all tasks. This method is intented to be private.
   * @param {Sheet} sheet - a sheet
   * @return {Sheet} set up sheet
   */
  __setupSheetForAllTasks(sheet) {
    // Freeze the first row.
    sheet.setFrozenRows(1);

    // Set names on the header and font weight as bold.
    sheet.getRange(this.headerRowPosition, this.numberColumnPosition).setValue("No");
    sheet.getRange(this.headerRowPosition, this.taskListTitleColumnPosition).setValue("task list");
    sheet.getRange(this.headerRowPosition, this.statusColumnPosition).setValue("status");
    sheet.getRange(this.headerRowPosition, this.taskTitleColumnPosition).setValue("title");
    sheet.getRange(this.headerRowPosition, this.parentTitleColumnPosition).setValue("parent title");
    sheet.getRange(this.headerRowPosition, this.dueColumnPosition).setValue("due");
    sheet.getRange(this.headerRowPosition, this.notesColumnPosition).setValue("notes");
    sheet.getRange(this.headerRowPosition, this.numberColumnPosition, 1, this.usedColumnPositions.length).setFontWeight("bold");

    return sheet;
  }

  /**
   * Set all tasks in the sheet. This method is intented to be private.
   * @param {Sheet} sheet - a sheet
   */
  __setAllTasksOnSheet(sheet) {
    // Get task lists.
    const taskLists = UtilTasks.getTaskLists();
    if (!taskLists) {
      return null;
    }

    // Set each task on each row.
    let currentRowPosition = this.firstRowPosition;
    for (const taskList of taskLists) {
      currentRowPosition = this.__setTasksInOneTaskListOnSheet(sheet, taskList, currentRowPosition);
    }
    // 
    const taskListTitles = taskLists.map((taskList) => taskList.title);
    UtilSheet.setPullDownsOnColumn(sheet,
                                   taskListTitles,
                                   this.taskListTitleColumnPosition,
                                   this.firstRowPosition,
                                   currentRowPosition - 1);

    // Add task numbers.
    this.__setTaskNumber(sheet);

    this.__adjustColumnSize(sheet);
  }

  /**
   * Set tasks in one task list on a sheet. This method is intented to be private.
   * @param {Sheet} sheet - a sheet
   * @param {TaskList} taskList - a task list
   * @param {Number} firstRowPosition - a row position to set task first
   * @return {Number} a row position next to the row that has already been set a task
   */
  __setTasksInOneTaskListOnSheet(sheet, taskList, firstRowPosition) {
    const tasks = UtilTasks.getTasks(taskList.id);
    let currentRowPosition = firstRowPosition;
    if (tasks) {
      for (const task of tasks) {
        const parentTask = tasks.find((_t) => _t.id === task.parent);
        let parentTaskTitle = null;
        let parentTaskId = null;
        if (parentTask) {
          parentTaskTitle = parentTask.title;
          parentTaskId = parentTask.id;
        }
        this.__setOneRow(sheet, taskList.title, taskList.id, task, parentTaskTitle, parentTaskId, currentRowPosition);

        const tasksWithoutMe = tasks.filter((_t) => _t.id !== task.id);
        const taskTitlesWithoutMe = tasksWithoutMe.map((task) => task.title);
        UtilSheet.setPullDownsOnColumn(sheet,
                                       taskTitlesWithoutMe,
                                       this.parentTitleColumnPosition,
                                       currentRowPosition,
                                       currentRowPosition);

        currentRowPosition++;
      }
    }
    return currentRowPosition;
  }

  /**
   * Set a task on one row. This method is intented to be private.
   * @param {Sheet} sheet - a sheet
   * @param {String} taskListTitle - a title of a task list
   * @param {String} taskListId- an identifier of a task list
   * @param {Task} task - a task
   * @param {String | null} parentTaskTitle - a title of a parent task if there is a parent
   * @param {String | null} parentTaskId- an identifier of a parent task if there is a parent
   * @param {Number} rowPosition - a row position
   */
  __setOneRow(sheet, taskListTitle, taskListId, task, parentTaskTitle, parentTaskId, rowPosition) {
    const taskListTitleRange = sheet.getRange(rowPosition, this.taskListTitleColumnPosition);
    const taskTitleRange = sheet.getRange(rowPosition, this.taskTitleColumnPosition);
    const dueRange = sheet.getRange(rowPosition, this.dueColumnPosition);
    const notesRange = sheet.getRange(rowPosition, this.notesColumnPosition);
    const parentRange = sheet.getRange(rowPosition, this.parentTitleColumnPosition);
    const statusRange = sheet.getRange(rowPosition, this.statusColumnPosition);

    taskListTitleRange.setValue(taskListTitle);
    taskListTitleRange.setNote(taskListId);

    taskTitleRange.setValue(task.title);
    taskTitleRange.setNote(task.id);

    statusRange.insertCheckboxes();
    if (task.due) {
      const dueDate = new Date(task.due);

      dueRange.setValue(dueDate);
    }
    if (task.notes) {
      notesRange.setValue(task.notes);
    }
    if (parentTaskTitle && parentTaskId) {
      parentRange.setValue(parentTaskTitle);
      parentRange.setNote(parentTaskId);
    }
  }

  /**
   * Set task numbers on the task number column.
   * @param {Sheet} sheet - a sheet
   */
  __setTaskNumber(sheet) {
    const lastRowPosition = sheet.getLastRow();
    const numberRange = sheet.getRange(this.firstRowPosition, this.numberColumnPosition, lastRowPosition - this.firstRowPosition + 1);
    const values = Array.from(Array(lastRowPosition - this.firstRowPosition + 1)).map((e, i) => [i + 1]);
    numberRange.setValues(values)
  }

  /**
   * Reset pull-downs on the parent title column.
   * @param {Sheet} sheet - a sheet
   */
  __resetParentTaskPullDowns(sheet) {
    const taskLists = UtilTasks.getTaskLists();
    if (!taskLists) {
      return null;
    }

    const lastRowPosition = sheet.getLastRow();
    const taskTitleColumn = sheet.getRange(1, this.taskTitleColumnPosition, lastRowPosition);
    const taskIds = taskTitleColumn.getNotes().map((value) => value[0]);
    for (const taskList of taskLists) {
      const tasks = UtilTasks.getTasks(taskList.id);
      if (!taskLists) {
        continue;
      }

      for (const task of tasks) {
        const currentRowPosition = taskIds.indexOf(task.id) + 1;
        const tasksWithoutMe = tasks.filter((_t) => _t.id !== task.id);
        const taskTitlesWithoutMe = tasksWithoutMe.map((task) => task.title);
        UtilSheet.setPullDownsOnColumn(sheet,
                                      taskTitlesWithoutMe,
                                      this.parentTitleColumnPosition,
                                      currentRowPosition,
                                      currentRowPosition);
      }
    }
  }

  /**
   * Adjust column sizes.
   * @param {Sheet} sheet - a sheet
   */
  __adjustColumnSize(sheet) {
    const lastColumnPosition = sheet.getLastColumn();
    sheet.autoResizeColumns(1, lastColumnPosition);
    const taskListTitleColumnWidth = sheet.getColumnWidth(this.taskListTitleColumnPosition);
    sheet.setColumnWidth(this.taskListTitleColumnPosition, taskListTitleColumnWidth + this.extraWidthForButton);
    const parentTitleColumnWidth = sheet.getColumnWidth(this.parentTitleColumnPosition);
    sheet.setColumnWidth(this.parentTitleColumnPosition, parentTitleColumnWidth + this.extraWidthForButton);
  }

  /**
   * Create a sheet having all tasks information.
   */
  setupAllTasksSheet() {
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const allTasksSheet = this.__createAllTasksSheet(activeSpreadsheet);
    this.__setAllTasksOnSheet(allTasksSheet);
  }

  /**
   * Set all tasks on a given sheet.
   * @param {Sheet} sheet - a sheet
   */
  setAllTasksOn(sheet) {
    // Initialise sheet.
    sheet.clear();
    const allRange = sheet.getRange(1,1, sheet.getMaxRows(), sheet.getMaxColumns());
    allRange.setDataValidation(null);
    allRange.setNote(null);
    sheet.setFrozenRows(0);

    this.__setupSheetForAllTasks(sheet);
    this.__setAllTasksOnSheet(sheet);
  }

  // >>> Event handler >>>
  /**
   * The event handler for Updating the column of a parent.
   * @param {String} sheetName - a sheet name
   */
  updateParentHandler(sheetName) {
    // Get the active sheet.
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      // Early return if the sheet does not exist.
      console.warn(`The sheet named ${sheetName} does not exist.`);
      return null;
    }
    
    // Get the active column position.
    const activeCell = sheet.getActiveCell();
    const activeCellColumnPosition = activeCell.getColumn();
    if (activeCellColumnPosition !== this.parentTitleColumnPosition) {
      // Early return if the active cell is not the column of a parent title.
      console.log("The active cell is not the column of a parent title.");
      return null;
    }

    const activeRowPosition = activeCell.getRow();

    // Get the identifier of the task list.
    const targetTaskListTitleRange = sheet.getRange(activeRowPosition, this.taskListTitleColumnPosition);
    const targetTaskListId = targetTaskListTitleRange.getNote();

    // Get the identifier of the task.
    const targetTaskTitleRange = sheet.getRange(activeRowPosition, this.taskTitleColumnPosition);
    const targetTaskId = targetTaskTitleRange.getNote();

    // Get the identifier of the parent task.
    const parentTaskTitleRange = sheet.getRange(activeRowPosition, this.parentTitleColumnPosition);
    const newParentTaskTitle = parentTaskTitleRange.getValue();
    const tasks = UtilTasks.getTasks(targetTaskListId);
    const newParentTask = tasks.find((task) => task.title === newParentTaskTitle);
    let newParentTaskId = null;
    if (newParentTask) {
      newParentTaskId = newParentTask.id;
    }

    // Change the parent task.
    UtilTasks.changeParentTask(targetTaskListId, targetTaskId, newParentTaskId);
    parentTaskTitleRange.setNote(newParentTaskId);

    this.__adjustColumnSize(sheet);
  }

  /**
   * The event handler for updating the column of a task list.
   * @param {String} sheetName - a sheet name
   */
  updateTaskListHandler(sheetName) {
    // Get the active sheet.
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      // Early return if the sheet does not exist.
      console.warn(`The sheet named ${sheetName} does not exist.`);
      return null;
    }
    
    // Get the active column position.
    const activeCell = sheet.getActiveCell();
    const activeCellColumnPosition = activeCell.getColumn();
    if (activeCellColumnPosition !== this.taskListTitleColumnPosition) {
      // Early return if it is not the same as the column of a task list title.
      console.log("The active cell is not the column of a task list title.");
      return null;
    }

    const activeRowPosition = activeCell.getRow();

    // Get the current identifier of the task list.
    const currentTaskListTitleRange = sheet.getRange(activeRowPosition, this.taskListTitleColumnPosition);
    const currentTaskListId = currentTaskListTitleRange.getNote();

    // Get the identifier of the new task list.
    const taskLists = UtilTasks.getTaskLists();
    const taskListTitles = taskLists.map((taskList) => taskList.title);
    const newTaskListTitle = activeCell.getValue();
    const targetTaskListIndex = taskListTitles.indexOf(newTaskListTitle);
    if (targetTaskListIndex < 0) {
      // Early return if the title of the task name does not exist.
      console.warn(`Task list tile "${newTaskListTitle}" is invalid.`);
      return null;
    }
    const newTaskList = taskLists[targetTaskListIndex];

    // Get the target task.
    const targetTaskTitleRange = sheet.getRange(activeRowPosition, this.taskTitleColumnPosition);
    const targetTaskId = targetTaskTitleRange.getNote();

    // Set null as the parent of the target task.
    UtilTasks.changeParentTask(currentTaskListId, targetTaskId, null);
    const targetParentTitleRange = sheet.getRange(activeRowPosition, this.parentTitleColumnPosition);
    targetParentTitleRange.setNote(null);
    targetParentTitleRange.setValue(null);

    // Get the sub Tree.
    const familyTrees = UtilTasks.createFamilyTrees(currentTaskListId);
    const targetFamilyTree = familyTrees.filter((familyTree) => familyTree.find(targetTaskId))[0];
    const targetNode = targetFamilyTree.find(targetTaskId);
    const targetSubFamilyTree = targetFamilyTree.getSubTree(targetNode);
    const childNodes = targetSubFamilyTree.getAllChildren();

    // Set null as the parent of the child tasks.
    const lastRowPosition = sheet.getLastRow();
    const taskTitleColumn = sheet.getRange(1, this.taskTitleColumnPosition, lastRowPosition);
    const taskIds = taskTitleColumn.getNotes().map((value) => value[0]);
    for (const childNode of childNodes) {
      UtilTasks.changeParentTask(currentTaskListId, childNode.id, null);
      
      const childRowPosition = taskIds.indexOf(childNode.id) + 1;
      const childParentTitleRange = sheet.getRange(childRowPosition, this.parentTitleColumnPosition);
      childParentTitleRange.setNote(null);
    }

    // Change the task list of the target task.
    const newTargetTask = UtilTasks.changeTaskList(currentTaskListId, newTaskList.id, targetTaskId);
    activeCell.setNote(newTaskList.id);
    targetTaskTitleRange.setNote(newTargetTask.id);

    // Make the relation table between the old task ids and the new task ids.
    const tableOfOldAndNewTaskIds = {};
    tableOfOldAndNewTaskIds[targetTaskId] = newTargetTask.id;

    // Change the task list of the child tasks.
    for (const childNode of childNodes) {
      const newChildTask = UtilTasks.changeTaskList(currentTaskListId, newTaskList.id, childNode.id);

      const childRowPosition = taskIds.indexOf(childNode.id) + 1;
      const childTaskListTitleRange = sheet.getRange(childRowPosition, this.taskListTitleColumnPosition);
      childTaskListTitleRange.setNote(newTaskList.id);
      childTaskListTitleRange.setValue(newTaskList.title);

      const childTaskTitleRange = sheet.getRange(childRowPosition, this.taskTitleColumnPosition);
      childTaskTitleRange.setNote(newChildTask.id);

      tableOfOldAndNewTaskIds[childNode.id] = newChildTask.id;
    }

    // Re-set their parent as origin.
    const newTasks = UtilTasks.getTasks(newTaskList.id);
    for (const childNode of childNodes) {
      UtilTasks.changeParentTask(newTaskList.id, tableOfOldAndNewTaskIds[childNode.id], tableOfOldAndNewTaskIds[childNode.parent.id]);

      const childRowPosition = taskIds.indexOf(childNode.id) + 1;
      const childParentTitleRange = sheet.getRange(childRowPosition, this.parentTitleColumnPosition);
      childParentTitleRange.setNote(tableOfOldAndNewTaskIds[childNode.parent.id]);
    }

    this.__resetParentTaskPullDowns(sheet);

    this.__adjustColumnSize(sheet);
  }

  /**
   * The event handler for Updating the column of a parent, especially for the all tasks sheet.
   */
  updateParentHandlerForAllTasksSheet() {
    return this.updateParentHandler(this.allTasksSheetName);
  }

  /**
   * The event handler for Updating the column of a task list, especially for the all tasks sheet.
   */
  updateTaskListHandlerForAllTasksSheet() {
    return this.updateTaskListHandler(this.allTasksSheetName);
  }
  // <<< Event hander <<<

}
