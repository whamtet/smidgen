/*******************************************************************************
 *
 * Kites Challenge Solution
 *
 * See README.md for architecture explanation
 *
 ******************************************************************************/

 var PEG = require("pegjs");
 var fs = require('fs');
 var DAYS_IN_WEEK = 7

module.exports = (function() {
  "use strict";

  /*
  * Read in parser grammar and construct parser
  */
  var parserGrammar = fs.readFileSync(__dirname + '/hoursGrammar.pegjs')
  parserGrammar = parserGrammar.toString()
  var parser = PEG.buildParser(parserGrammar)

  /*
  * map(f, s)
  * maps s[i] to f(s[i]) for i = 0 ... n
  */
  function map(f, s) {
    var out = []
    for (var i = 0; i < s.length; i++) {
      out.push(f(s[i]))
    }
    return out
  }

  /*
  * update_in(m, k, v)
  * puts value v into map m or appends it if key k already exists
  */
  function update_in(m, k, v) {
    if (k in m) {
      m[k] = m[k].concat(v)
    } else {
      m[k] = v
    }
  }

  /*
  * value_map(f, m)
  * similar to map but converts m[k] to f(m[k]) k = key1, key2 ...
  */
  function value_map(f, m) {
      for (var k in m) {
        m[k] = f(m[k])
      }
      return m
  }

  /*
  * invert_map(m)
  * swaps keys and values of m, grouping items with the same value
  * because general objects do not hash correctly in javascript we have to convert them
  * to string representation via JSON
  */
  function invert_map(m) {
    var out = {}
    for (var k in m) {
      var v = JSON.stringify(m[k])
      if (v in out) {
        out[v].push(Number(k))
      } else {
        out[v] = [Number(k)]
      }
    }
    return out
  }

  function last(s) {
    return s[s.length - 1]
  }

  /*
  * day_string(s)
  * takes an array of nums and converts to string ranges, for example
  * s = [1, 2, 4, 5, 6]
  * output = 1-2,4-6
  */
  function day_string(s) {
    s.sort()

    /*
    * if last(s) == 6 we wish to push contiguous numbers from the front to the back
    * this takes care of the case s = [0, 1, 6] which we wish to display as 6-1
    */
    if (last(s) == 6) {
      var tail = []
      for (var i = 0; i < DAYS_IN_WEEK; i++) {
        if (s[i] == i) {
          tail.push(i)
        } else {
          break;
        }
      }
      //push front onto back
      s = s.slice(tail.length).concat(tail)
    }

    // now we advance through array, splitting every time the day count increments by more than one
    var last_val = s[0], group_count = 1
    var out = []
    for (var i = 1; i < s.length; i++) {
      var gap = s[i] - last_val
      var discontiguous = gap > i
      if (discontiguous) {
        if (group_count == 1) {
          var a = last_val
          out.push(a)
        } else {
          var a = last_val
          var b = (last_val + group_count - 1) % DAYS_IN_WEEK
          out.push(a + '-' + b)
        }
        last_val = s[i]
        group_count = 1
      } else {
        group_count++
      }
    }
    if (group_count == 1) {
      var a = last_val
      out.push(a)
    } else {
      var a = last_val
      var b = (last_val + group_count - 1) % DAYS_IN_WEEK
      out.push(a + '-' + b)
    }
    return out.join(',')
  }

  /*
  * merge_times(times)
  * times is array of [time1, time2 ...]
  * time1 = [hours1, minutes1, hours2, minutes2]
  * output contains times with overlaps removed
  */
  function merge_times(times) {
    var first_sort = function(a, b) {return a[0] - b[0]}
    times.sort(first_sort)
    var out = []
    for (var i = 0; i < times.length; i++) {
      var time1 = times[i]
      if (i == times.length - 1) {
        out.push(time1)
      } else {
        var time2 = times[i + 1]
        var h1 = time1[0], m1 = time1[1], h2 = time1[2], m2 = time1[3]
        var h3 = time2[0], m3 = time2[1], h4 = time2[2], m4 = time2[3]

        var times_overlap = h2 > h3 || (h2 == h3 && m2 >= m3)
        if (times_overlap) {

          var h2_bigger = h2 > h4 || (h2 == h4 && m2 > m4)
          if (h2_bigger) {
            times[i + 1] = [h1, m1, h2, m2]
          } else {
            times[i + 1] = [h1, m1, h4, m4]
          }

        } else {
          // no overlap, just push time1 on
          out.push(time1)
        }
      }
    }
    return out
  }
  /*
  * format_time(time)
  * formats time array into string
  */
  function format_time(time) {
    var h1 = time[0], m1 = time[1], h2 = time[2], m2 = time[3]
    return '' + expand_num(h1) + expand_num(m1) + '-' + expand_num(h2) + expand_num(m2)
  }
  function expand_num(num) {
    if (num < 10) {
      return '0' + num
    } else {
      return num
    }
  }
  /*
  * contains(s, substring)
  * returns true if s contains substring
  */
  function contains(s, substring) {
    return s.indexOf(substring) != -1
  }
  /*
  * compare_string(a, b)
  * compares strings for sorting
  */
  function compare_string(a, b) {
    if (a > b) {
      return 1
    }
    if (a == b) {
      return 0
    }
    return -1
  }
  /*
  * not_empty(s)
  * returns true if s is not empty
  */
  function not_empty(s) {
    return s && s.length && s.length > 0
  }
  /*
  * finalize(parser_output)
  *
  * parser_output = [day_expression1, day_expression2 ...]
  * day_expression = [day_phrase time_phrase1, time_phrase2 ...]
  *
  * day_phrase = [day1, day2]
  * time_phrase = [hours1, minutes1, hours2, minutes2]
  *
  * We group all the day_expressions by day and combine times to remove overlaps.
  * We then 'invert' the grouping so that we can combine days with like times.
  * Finally we apply string formatting with the correct separators (',' ';').
  */
  function finalize(parser_output) {
    var day_expressions = parser_output
    var day_values = {}
    for (var i = 0; i < day_expressions.length; i++) {
      var day_expression = day_expressions[i]
      var day_phrase = day_expression[0]
      var time_phrase = day_expression[1]

      for (var j = 0; j < day_phrase.length; j++) {
        var day = day_phrase[j]
        if (day || day == 0) {
          update_in(day_values, day, time_phrase)
        }
      }
    }
    // merge times in day_values
    day_values = value_map(merge_times, day_values)
    // invert day_values to combine like days
    day_values = invert_map(day_values)
    var out = []
    for (var k in day_values) {
      var day_str = day_string(day_values[k])
      var times_str = JSON.parse(k)
      times_str = map(format_time, times_str).join(',')
      out.push(day_str + ':' + times_str)
    }
    // finally sort groups of days
    var sort_f = function(a, b) {
      a = a.split(':')[0]
      b = b.split(':')[0]

      if (contains(a, '0')) return -1
      if (contains(b, '0')) return 1
      return compare_string(a, b)
    }
    // need to sort on f
    out.sort(sort_f)
    return 'S' + out.join(';')
  }
  /*
  * return object with parse function attached
  */
  return {
    parse: function(s) {return finalize(parser.parse(s.toLowerCase()))},
    original_parse: function(s) { return JSON.stringify(parser.parse(s.toLowerCase()))}
  }

}());
