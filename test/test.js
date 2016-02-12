/*******************************************************************************
 *
 * Copyright:: Copyright 2013 Kites Ltd
 * Original Author:: Edwin Shao (eshao@kitesplex.com)
 *
 *                                                                        [n=80]
 ******************************************************************************/

(function() {

  "use strict";

  var assert = require('assert')
    , _ = require('underscore')
  var hours = require('../lib')


  /**
   * Generates a single mocha test case.
   *
   * @params {string} expected result after calling parse function
   * @params {string} freetext to pass to hours.parse
   */
  var check = function(expected, freetext) {
    test(freetext, function() {
      var result = hours.parse(freetext)
      assert.equal(result, expected)
    })
  }

  suite('Parses simple sentences correctly')
  var cases = {
    'Sunday: 7:00 to 11:00': 'S0:0700-1100'
  , 'Sunday: 15:00 to 1:00': 'S0:1500-2500'
  , 'Sun: 07:00-00:00': 'S0:0700-2400'
  }
  _.each(cases, check)


  suite('Parses THROUGH sentences correctly')
  cases = {
    'Mon-Sun: 12:30-01:00': 'S0-6:1230-2500'
  , 'Mon to Sun: 06:30 - 22:30': 'S0-6:0630-2230'
  , 'Fri to Tue: 06:30 - 22:30': 'S5-2:0630-2230'
  , 'Mon - Wed: 07:00-01:00': 'S1-3:0700-2500'
  }
  _.each(cases, check)


  suite('Parses AND sentences correctly')
  cases = {
    'Mon-Thu & Sun: 09:30-22:30': 'S0-4:0930-2230'
  , 'Fri-Sat & PH: 09:30-23:00': 'S5-6:0930-2300'
  }
  _.each(cases, check)


  suite('Parses sentences with multiple times correctly')
  cases = {
    'Mon-Fri: 11:45-16:30; 17:45-23:30': 'S1-5:1145-1630,1745-2330'
  , 'Monday to Sunday: 12:00-15:00, 18:00-22:00': 'S0-6:1200-1500,1800-2200'
  }
  _.each(cases, check)


  suite('Deals with strange Unicode characters correctly')
  cases = {
    'Mon：18:00-00:00': 'S1:1800-2400'  // :
  , 'Sat & Sun: 12:00-14:30；18:00-23:00': 'S6-0:1200-1430,1800-2300'  // ;
  , 'Mon to Fri: 6:30 – 20:30': 'S1-5:0630-2030'  // -
  }
  _.each(cases, check)


  suite('Tokenizes multiline hours correctly')
  cases = {
    'Mon.-Sat.: 11:30-22:30; Sun.: 10:30-22:30': 'S0:1030-2230;1-6:1130-2230'
  , 'Sun.-Thur. 11:00-23:00, Fri.-Sat. 11:00-00:00': 'S0-4:1100-2300;5-6:1100-2400'
  }
  _.each(cases, check)


  suite('Parses complex sentences correctly')
  cases = {
    'Mon-Sun\nBreakfast 07:00-11:00\nLunch 11:30-14:30\nTea 14:00-18:00\nSun-Thu Dinner 18:30-22:30\nFri & Sat Dinner 18:30-23:30': 'S0-4:0700-1100,1130-1800,1830-2230;5-6:0700-1100,1130-1800,1830-2330'
  , 'Mon-Sun: 06:00-23:00\n(Tea: 06:00-16:00)': 'S0-6:0600-2300'
  , 'Mon-Sat: 11:00-21:00 until 300 quotas soldout': 'S1-6:1100-2100'
  , 'Monday to Sunday & Public Holiday:\n12:00-15:00, 18:00-00:00': 'S0-6:1200-1500,1800-2400'
  , 'Restaurant Mon-Sun: 06:30-23:00\nBar Mon-Sun: 15:00-00:00\nBe on Canton Mon-Sun: 12:00-00:00': 'S0-6:0630-2400'
  }
  _.each(cases, check)


  suite('Custom tests')
  cases = {
    'Mon-Sat: 2300-2500,0600-0800': 'S1-6:0600-0800,2300-2500'
  , 'Mon-Sat: 0000-2300,2301-2800': 'S1-6:0000-2300,2301-2800'
  , 'Fri-Sat: 0000-2300, Mon: 0000-2300': 'S1,5-6:0000-2300'
  , 'Fri-Sat: 0000-2300, Mon: 0000-2301': 'S1:0000-2301;5-6:0000-2300'
  }
  _.each(cases, check)


  suite('Chinese')
  cases = {
    'Mon.-Sun.: 12:00-22:30': 'S0-6:1200-2230'
  , '星期一至日: 12:00-22:30': 'S0-6:1200-2230'
   , 'Mon.-Sat.: 12:00-23:00': 'S1-6:1200-2300'
   , '星期一至六: 12:00-23:00 ': 'S1-6:1200-2300'
   , 'Mon.-Sun.: 12:00-14:30, 19:00-22:30': 'S0-6:1200-1430,1900-2230'
   , '星期一至日: 12:00-14:30, 19:00-22:30': 'S0-6:1200-1430,1900-2230'
   , 'Mon to Sat: 12:00 – 14:30; 18:30 – 23:00\nSun: 12:00 – 15:00; 18:30 – 23:00': 'S0:1200-1500,1830-2300;1-6:1200-1430,1830-2300'
   , '星期一至六：12:00 – 14:30; 18:30 – 23:00\n星期日：12:00 – 15:00; 18:30 – 23:00': 'S0:1200-1500,1830-2300;1-6:1200-1430,1830-2300'
   , 'Mon.-Fri.: 12:00-14:30； 18:00-22:30\nSat.-Sun.&Public Holidays: 11:30-15:00; 18:00-22:30': 'S6-0:1130-1500,1800-2230;1-5:1200-1430,1800-2230'
   , '星期一至五：12:00-14:30； 18:00-22:30\n星期六、日及公眾假期：11:30-15:00； 18:00-22:30': 'S6-0:1130-1500,1800-2230;1-5:1200-1430,1800-2230'
   , 'Mon.-Sat.: 11:30-14:30, 18:00-22:30; Sun.&Public Holidays: 11:00-14:30, 18:00-22:30': 'S0:1100-1430,1800-2230;1-6:1130-1430,1800-2230'
   , '星期一至六: 11:30-14:30, 18:00-22:30; 星期日及公眾假期: 11:00-14:30, 18:00-22:30': 'S0:1100-1430,1800-2230;1-6:1130-1430,1800-2230'
   , 'Breakfast (Weekday): 07:00-10:00\nBreakfast (Sunday and Public Holiday): 07:00-10:30\nLunch: 12:00-14:30\nDinner: 18:00-22:00\nVerandah Café : 07:00-23:00 (cakes and sandwiches only available from 14:00-18:00 daily)': 'S0:0700-2300;1-5:0700-1000'
   , '早餐(星期一至六): 07:00-10:00\n早餐(星期日及公眾假期): 07:00-10:30\n午餐: 12:00-14:30\n晚餐: 18:00-22:00\n露台咖啡廳: 07:00-23:00 (糕點及三文治於14:00-18:00供應)': 'S0:0700-2300;1-6:0700-1000'
   , '星期一至星期日: 07:00-21:00': 'S0-6:0700-2100'
  }
  _.each(cases, check)

  /*
  * Matt's additional tests
  */

  suite('12 hours')
  cases = {
    'Mon - Sun: 6:00 am - 6:00 pm': 'S0-6:0600-1800',
    'Mon - Sun: 6:00 a.m. - 0600 p.m.': 'S0-6:0600-1800'
  }
  _.each(cases, check)

  suite('Reverse order times')
  cases = {
    '9:30 a.m. - 5:00 p.m. Mon to Fri': 'S1-5:0930-1700',
    '0400 - 0600, 1200 - 1400 Mon to Tue': 'S1-2:0400-0600,1200-1400'
  }
  _.each(cases, check)

  suite('Random examples from the net')
  cases = {
    '\
Hong Kong Central Library  \
\
Monday, Tuesday, Thursday, Friday,\
Saturday & Sunday	10:00 am - 9:00 pm\
Wednesday	1:00 pm - 9:00 pm\
Public Holiday*	10:00 am - 7:00 pm': 'S3:1300-2100;4-2:1000-2100',

'"HKEX\
Trading Hours \
 \
Trading is conducted on Monday to Friday at the following times:\
Trading Hours\
Auction Session\
 \
     Pre-opening Session\
9:00 a.m. to 9:30 a.m.\
Continuous Trading Session\
 \
     Morning Session\
9:30 a.m. to 12:00 noon\
     Extended Morning Session\
12:00 noon to 1:00 p.m.\
     Afternoon Session\
1:00 p.m. to 4:00 p.m.";': 'S1-5:0900-1600'
  }
  _.each(cases, check)

}());
