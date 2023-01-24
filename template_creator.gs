var TemplateCreator = class TemplateCreator {
  /**
   * Constructor.
   * @param {String} sheetname - a sheet name
   */
  constructor(sheetname) {
    this._sheetName = sheetname;
    
    // Define row positions to be fixed.
    this.headerRowPosition = 2;
    this.firstRowPosition = this.headerRowPosition + 1;
    
    // Define column positions to be fixed.
    // The order of columns is defined as follows.
    let currentUsedColumns = 1;

    this._taskListTitleColumnPosition = currentUsedColumns++;
    this._statusColumnPosition = currentUsedColumns++;
    this._taskTitleColumnPosition = currentUsedColumns++;
    this._parentTitleColumnPosition = currentUsedColumns++;
    this._dueColumnPosition = currentUsedColumns++;
    this._notesColumnPosition = currentUsedColumns++;

    this._usedNumColumn = currentUsedColumns - 1;
  }

  /**
   * Sheet name.
   */
  get sheetName() { return this._sheetName; }
  /**
   * Column position of task list titles.
   */
  get taskListTitleColumnPosition() { return this._taskListTitleColumnPosition; }
  /**
   * Column position of statuses.
   */
  get statusColumnPosition() { return this._statusColumnPosition; }
  /**
   * Column position of task titles.
   */
  get taskTitleColumnPosition() { return this._taskTitleColumnPosition; }
  /**
   * Column position of parent task titles.
   */
  get parentTitleColumnPosition() { return this._parentTitleColumnPosition; }
  /**
   * Column position of dues.
   */
  get dueColumnPosition() { return this._dueColumnPosition; }
  /**
   * Column position of notes's.
   */
  get notesColumnPosition() { return this._notesColumnPosition; }
  /**
   * Number of used columns.
   */
  get usedNumColumn() { return this._usedNumColumn; }
}