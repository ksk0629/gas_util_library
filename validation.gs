const Validation = (() => {
  /**
   * Check if a given value is an integer.
   * @param {Number} value - a value
   * @return {boolean} whether or not a given value is an integer.
   */
  const isInteger = (value) => {
    return Number.isInteger(value);
  }

  /**
   * Check if a given targetValue is less than or equal to a given baseValue.
   * @param {Number} targetValue - a value being compared
   * @param {Number} baseValue - a value to compare
   * @return {boolean} whether or not a given targetValue is less than or equal to a given baseValue 
   */
  const isLessOrEq = (targetValue, baseValue) => {
    if (isInteger(targetValue) && isInteger(baseValue)) {
      return targetValue <= baseValue
    } else {
      return false;
    }
  }
  
  /**
   * Check if a given targetValue is more than or equal to a given baseValue.
   * @param {Number} targetValue - a value being compared
   * @param {Number} baseValue - a value to compare
   * @return {boolean} whether or not a given targetValue is more than or equal to a given baseValue
   */
  const isMoreOrEq = (targetValue, baseValue) => {
    if (isInteger(targetValue) && isInteger(baseValue)) {
      return targetValue >= baseValue
    } else {
      return false;
    }
  }

  /**
   * Check if a given value is month, which is in the range from 1 to 12.
   * @param {Number} value - a value
   * @return {boolean} whether or not a given value is month
   */
  const isMonth = (value) => {
    return isInteger(value) && isLessOrEq(value, 12) && isMoreOrEq(value, 1);
  }

  /**
   * Check if a given value is date, which is in the range from 1 to 31.
   * @param {Number} value - a value
   * @return {boolean} whether or not a given value is date
   */
  const isDate = (value) => {
    return isInteger(value) && isLessOrEq(value, 31) && isMoreOrEq(value, 1);
  }

  /**
   * Check if a given year, month and date is after today.
   * @param {Number} year - year
   * @param {Number} month - month
   * @param {Number} date - date
   * @return {boolean} whether or not a given year, month and date is after today
   */
  const isAfterToday = (year, month, date) => {
    if (isInteger(year) && isMonth(month) && isDate(date)) {
      const now = new Date();
      const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
      const targetValue = new Date(Date.UTC(year, month - 1, date));
      return targetValue >= today;
    } else {
      return false;
    }
  }

  return {
    isAfterToday
  }
})();
