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
    this.parentColumnPosition = currentUsedColumns++;
    this.dueColumnPosition = currentUsedColumns++;
    this.notesColumnPosition = currentUsedColumns++;

    this.usedColumnPositions = Array.from(Array(currentUsedColumns - this.fisrtColumnPosition)).map((e, i) => i + 1);
    this.necessaryColumnPositions = [this.taskListTitleColumnPosition, this.taskTitleColumnPosition];

    this.extraRows = 30;
    this.separater = ":";
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
    sheet.getRange(this.headerRowPosition, this.parentColumnPosition).setValue("parent title");
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

    // Adjust column sizes.
    const lastColumnPosition = sheet.getLastColumn();
    sheet.autoResizeColumns(1, lastColumnPosition);
    const extraWidthForButton = 20;
    const taskListTitleColumnWidth = sheet.getColumnWidth(this.taskListTitleColumnPosition);
    sheet.setColumnWidth(this.taskListTitleColumnPosition, taskListTitleColumnWidth + extraWidthForButton);
    const parentTitleColumnWidth = sheet.getColumnWidth(this.parentColumnPosition);
    sheet.setColumnWidth(this.parentColumnPosition, parentTitleColumnWidth + extraWidthForButton);
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
        if (parentTask) {
          parentTaskTitle = parentTask.title;
        }
        this.__setOneRow(sheet, taskList.title, taskList.id, task, parentTaskTitle, currentRowPosition);

        const tasksWithoutMe = tasks.filter((_t) => _t.id !== task.id);
        const taskTitlesWithoutMe = tasksWithoutMe.map((task) => task.title);
        UtilSheet.setPullDownsOnColumn(sheet,
                                       taskTitlesWithoutMe,
                                       this.parentColumnPosition,
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
   * @param {String | null} parentTitle - a title of a parent task if there is a parent
   * @param {Number} rowPosition - a row position
   */
  __setOneRow(sheet, taskListTitle, taskListId, task, parentTitle, rowPosition) {
    const taskListTitleRange = sheet.getRange(rowPosition, this.taskListTitleColumnPosition);
    const taskTitleRange = sheet.getRange(rowPosition, this.taskTitleColumnPosition);
    const dueRange = sheet.getRange(rowPosition, this.dueColumnPosition);
    const notesRange = sheet.getRange(rowPosition, this.notesColumnPosition);
    const parentTitleRange = sheet.getRange(rowPosition, this.parentColumnPosition);
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
    if (parentTitle) {
      parentTitleRange.setValue(parentTitle);
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
}
