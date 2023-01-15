var UtilSheet = (() => {
  /** 
   * Set pull-downs on a given column.
   * @param {Sheet} sheet - a sheet
   * @param {Array} values - values set on pull-downs
   * @param {Number} columnPosition - a colomn position, which is set pull-downs]
   * @param {Number} firstRowPosition - the first row position, which is set a pull-down
   * @param {Number} lastRowPosition - the last row position, which is set a pull-down
   */
  const setPullDownsOnColumn = (sheet, values, columnPosition, firstRowPosition, lastRowPosition) => {
    const rule = SpreadsheetApp.newDataValidation().requireValueInList(values).build();
    const numRows = lastRowPosition - firstRowPosition + 1;
    if (numRows > 0) {
      const cell = sheet.getRange(firstRowPosition, columnPosition, numRows);
      cell.setDataValidation(rule);
    }
  }

  /** 
   * Remove all data validation from a given column.
   * @param {Sheet} sheet - a sheet
   * @param {Number} columnPosition - a colomn position, which is set pull-downs]
   * @param {Number} firstRowPosition - the first row position, which is set a pull-down
   * @param {Number} lastRowPosition - the last row position, which is set a pull-down
   */
  const removeDataValidationOnColumn = (sheet, columnPosition, firstRowPosition, lastRowPosition) => {
    const numRows = lastRowPosition - firstRowPosition + 1;
    if (numRows > 0) {
      const cell = sheet.getRange(firstRowPosition, columnPosition, numRows);
      cell.setDataValidation(null);
    }
  }

  return {
    setPullDownsOnColumn,
    removeDataValidationOnColumn
  }
})();
