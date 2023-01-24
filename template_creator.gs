var TemplateCreator = class TemplateCreator {
  /**
   * Constructor.
   * @param {String} tasksSheetNameToShowTasks - a sheet name to show tasks
   */
  constructor(tasksSheetNameToShowTasks) {
    this._tasksSheetNameToShowTasks = tasksSheetNameToShowTasks;
    
    // Define row positions for showing tasks to be fixed.
    this._headerRowPositionToShowTasks = 1;
    
    // Define column positions for showing tasks to be fixed.
    // The order of columns is defined as follows.
    let currentUsedColumnsToShowTasks = 1;

    this._taskListTitleColumnPositionToShowTasks = currentUsedColumnsToShowTasks++;
    this._statusColumnPositionToShowTasks = currentUsedColumnsToShowTasks++;
    this._taskTitleColumnPositionToShowTasks = currentUsedColumnsToShowTasks++;
    this._parentTitleColumnPositionToShowTasks = currentUsedColumnsToShowTasks++;
    this._dueColumnPositionToShowTasks = currentUsedColumnsToShowTasks++;
    this._notesColumnPositionToShowTasks = currentUsedColumnsToShowTasks++;

    this._numUsedColumnToShowTasks = currentUsedColumnsToShowTasks - 1;
  }

  /**
   * Sheet name to show tasks.
   */
  get tasksSheetNameToShowTasks() { return this._tasksSheetNameToShowTasks; }
  /**
   * Last position of header row.
   */
  get headerRowPositionToShowTasks() { return this._headerRowPositionToShowTasks; }
  /**
   * First row position of data.
   */
  get firstRowPositionToShowTasks() { return this._headerRowPositionToShowTasks + 1;}
  /**
   * Column position of task list titles.
   */
  get taskListTitleColumnPositionToShowTasks() { return this._taskListTitleColumnPositionToShowTasks; }
  /**
   * Column position of statuses.
   */
  get statusColumnPositionToShowTasks() { return this._statusColumnPositionToShowTasks; }
  /**
   * Column position of task titles.
   */
  get taskTitleColumnPositionToShowTasks() { return this._taskTitleColumnPositionToShowTasks; }
  /**
   * Column position of parent task titles.
   */
  get parentTitleColumnPositionToShowTasks() { return this._parentTitleColumnPositionToShowTasks; }
  /**
   * Column position of dues.
   */
  get dueColumnPositionToShowTasks() { return this._dueColumnPositionToShowTasks; }
  /**
   * Column position of notes's.
   */
  get notesColumnPositionToShowTasks() { return this._notesColumnPositionToShowTasks; }
  /**
   * Number of used columns.
   */
  get numUsedColumnToShowTasks() { return this._numUsedColumnToShowTasks; }

  /**
   * Create a sheet to show tasks.
   * @param {String} sheetName - a sheet name
   * @return {Sheet} an arranged sheet to show tasks
   */
  createArrangedSheetToShowTasks(sheetName) {
    const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Remove the sheet if the sheet specified by this.sheetName does already exist.
    let targetSheet = activeSpreadsheet.getSheetByName(sheetName);
    if (targetSheet) {
      activeSpreadsheet.deleteSheet(targetSheet);
    }
    
    // Create a new sheet and name it this.sheeName.
    targetSheet = activeSpreadsheet.insertSheet();
    targetSheet.setName(sheetName);

    this._arrangeSheetToShowTasks(targetSheet);

    return targetSheet;
  }

  /**
   * Arrange a sheet to show tasks.
   * @param {Sheet} sheet - a sheet to show tasks
   */
  _arrangeSheetToShowTasks(sheet) {
    // Freeze header rows.
    sheet.setFrozenRows(this.headerRowPositionToShowTasks);

    // Set names on the header and font weight as bold.
    sheet.getRange(this.headerRowPositionToShowTasks, this.taskListTitleColumnPositionToShowTasks).setValue("task list");
    sheet.getRange(this.headerRowPositionToShowTasks, this.statusColumnPositionToShowTasks).setValue("status");
    sheet.getRange(this.headerRowPositionToShowTasks, this.taskTitleColumnPositionToShowTasks).setValue("title");
    sheet.getRange(this.headerRowPositionToShowTasks, this.parentTitleColumnPositionToShowTasks).setValue("parent title");
    sheet.getRange(this.headerRowPositionToShowTasks, this.dueColumnPositionToShowTasks).setValue("due");
    sheet.getRange(this.headerRowPositionToShowTasks, this.notesColumnPositionToShowTasks).setValue("notes");
    sheet.getRange(this.headerRowPositionToShowTasks, 1, 1, this.numUsedColumnToShowTasks).setFontWeight("bold");
  }
}