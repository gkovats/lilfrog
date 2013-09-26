var LF = {

  /**
   * Placeholder for future activies
   */
  activities: { },

  setCookie: function (name, value, expires, path) {
    // If expires is undefined or is not an instance of the Date object set an empty expire string
    if (typeof expires === 'undefined' || !(expires instanceof Date)) {
      expires = '';
    } else {
      // expires is a Date object so we can generate the expires string
      expires = "; expires=" + expires.toGMTString();
    }

    // If path is undefined set / as the default
    if (typeof path === 'undefined') {
      path = '/';
    }

    // Set the index cookie
    document.cookie = name + '=' + value + expires + "; path=/";
  },

  getCookie: function (name) {
    // Split document.cookie on the name we are looking. parts length will be 2 if the cookie is found.
    var parts = document.cookie.split(name + "=");

    // If the cookie is found pop split and shift to get the cookie value
    if (parts.length == 2) {
      return parts.pop().split(";").shift();
    }

    // Cookie not found
    return false;
  },

  /**
   * Get random number
   * @param {integer} num1    Lower extent for random number. Optionally, if not num2 is given, lower limit is 0 and upper limit becomes num1.
   * @param {integer} num2    [optoinal] Upper limit for random number
   */
  getRand: function (num1, num2) {
    if (!num2) {
      num2 = num1;
      num1 = 0;
    }
    return Math.floor(Math.random()*(num2-num1+1)+num1);
  },

  /**
   * Helps find nested children within elements
   *
   * @param {array} obj   The array / object to search through
   * @param {string} exp  The dot notation expression to find (Ex: "tier.name.property.list.4")
   * @returns {array}     Either the array found, or false if not found
   * @example
   * var a = _See.objectDig(_See.config, "tenant.language.10_11");
   */
  objectDig: function (obj, exp) {
    exprs = exp.split('.');
    for (var i in exprs){
      if (obj[exprs[i]]) {
        obj = obj[exprs[i]];
      } else {
        return false;
      }
    }
    return obj;
  },
  
  log: function (msg) {
    if (typeof window.console == 'object') {
      console.log(msg);
    }
  }
};
