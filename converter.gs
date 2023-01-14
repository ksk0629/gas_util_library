const Converter = (() => {
  /**
   * Flip keys and correponding values in a given object.
   * @param {Object} obj - a target object
   * @return {Object} the flipped object
   */
  const flipObject = (obj) => {
    const flippedObj = {};
    for (key of Object.keys(obj)) {
      flippedObj[obj[key]] = key;
    }
    return flippedObj;
  }

  return {
    flipObject
  }
})();
