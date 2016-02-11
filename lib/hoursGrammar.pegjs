{
  /*
  * safe_get(a, b)
  * safely returns a[b] when a is not null
  */
  function safe_get(a, b) {
    if (a) {
      return a[b]
    }
  }
}

start = day_expression+
day_expression = (!day_phrase .)* day_phrase:day_phrase time_range:time_range+
{
  return [day_phrase, time_range]
}

/*
* Day Phrases
*/
day_phrase = day_range / single_day / chinese_day_range / chinese_single_day / weekday / weekend

single_day = day:day {return [day, day]}
public_holiday = 'ph' {return undefined}
weekday = 'weekday' {return [1,5]}
weekend = 'weekend' {return [6, 0]}
day_range = day1:day time_separator day2:day and_clause:((_ '&' _) (day / public_holiday))?
{
  return [day1, day2, safe_get(and_clause, 1)]
}
chinese_public_holiday = '及公眾假期' {return undefined}
chinese_day_range = '星期' day1:chinese_day . '星期'? day2:chinese_day ph:chinese_public_holiday?
{
  return [day1, day2]
}
chinese_single_day = '星期' day:chinese_day
{
  return [day, day]
}

chinese_day = 一 / 二 / 三 / 四 / 五 / 六 / 日
一 = '一' {return 1}
二 = '二' {return 2}
三 = '三' {return 3}
四 = '四' {return 4}
五 = '五' {return 5}
六 = '六' {return 6}
日 = '日' {return 0}

day = sunday / monday / tuesday / wednesday / thursday / friday / saturday

sunday = 'sun' ('day' / '.' / '') {return 0}
monday = 'mon' ('day' / '.' / '') {return 1}
tuesday = 'tue' ('s.' / 'sday' / 's' / '.' / '') {return 2}
wednesday = 'wed' ('nesday' / '.' / '') {return 3}
thursday = 'thu' ('rsday' / 'r.' / 'rs.' / 'rs' / 'r' / '') {return 4}
friday = 'fri' ('day' / 'd.' / 'd' / '.' / '') {return 5}
saturday = 'sat' ('urday' / '.' / '') {return 6}

/*
* Time Phrases
*/

time_range = !day_phrase [^0-9]* time1:time time_separator time2:time (!day_phrase !time .)*
{
  var hours1 = time1[0]
  var mins1 = time1[2]
  var hours2 = time2[0]
  var mins2 = time2[2]

  if (hours2 < hours1) {
    hours2 += 24
  }
  return [hours1, mins1, hours2, mins2]
}
time_separator = _ ('to' / .) _
_ = [ \t\r\n]*

time = hours colon minutes / simple_time
simple_time = a:[0-9] b:[0-9] c:[0-9] d:[0-9]
{
  return [parseInt(a + b), '', parseInt(c + d)]
}

hours = minutes
minutes = minutes:([0-9] [0-9]?) {return parseInt(minutes.join(''))}
colon = ':' / '：'
