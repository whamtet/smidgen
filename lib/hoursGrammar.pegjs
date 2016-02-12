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
  function flatten(a, b) {
    var out = a
    for (var i = 0; i < b.length; i++) {
      out.push(b[i][1])
    }
    return out
  }
}

start = day_expression+
day_expression = forward_day_expression / reverse_day_expression
reverse_day_expression = (!time_range .)* time_range:time_range+ day_phrase:day_phrase
{
  return [day_phrase, time_range]
}
//9:30 a.m. - 5:00 p.m. Mon to Fri
forward_day_expression = (!day_phrase .)* day_phrase:day_phrase time_range:time_range+
{
  return [day_phrase, time_range]
}

/*
* Day Phrases
*/
day_phrase = day_list / day_range / single_day / chinese_day_range / chinese_single_day / weekday

day_list = day1:day (_ . _) day2:day (_ . _) day3:day days:((_ . _) day)+
{
  return flatten([day1, day2, day3], days)
}

weekday = 'weekday' {
  return [1, 2, 3, 4, 5]
}

single_day = day:day {
  return [day]
}
day_range = day1:day time_separator day2:day and_clause:((_ '&' _) day)?
{
  //add days
  var contiguous = day2 >= day1
  var days = []
  if (contiguous) {
    for (var day = day1; day <= day2; day++) {
      days.push(day)
    }
  } else {
    for (var day = day1; day <= 6; day++) {
      days.push(day)
    }
    for (var day = 0; day <= day2; day++) {
      days.push(day)
    }
  }
  var extra_day = safe_get(and_clause, 1)
  if (extra_day || extra_day == 0) {
    days.push(extra_day)
  }
  return days
}
chinese_public_holiday = '及公眾假期' {return undefined}
chinese_day_range = '星期' day1:chinese_day . '星期'? day2:chinese_day ph:chinese_public_holiday?
{
  //add days
  var contiguous = day2 >= day1
  var days = []
  if (contiguous) {
    for (var day = day1; day <= day2; day++) {
      days.push(day)
    }
  } else {
    for (var day = day1; day <= 6; day++) {
      days.push(day)
    }
    for (var day = 0; day <= day2; day++) {
      days.push(day)
    }
  }
  return days
}
chinese_single_day = '星期' day:chinese_day
{
  return [day]
}

chinese_day = 一 / 二 / 三 / 四 / 五 / 六 / 日
一 = '一' {return 1}
二 = '二' {return 2}
三 = '三' {return 3}
四 = '四' {return 4}
五 = '五' {return 5}
六 = '六' {return 6}
日 = '日' {return 0}

day = sunday / monday / tuesday / wednesday / thursday / friday / saturday / public_holiday

sunday = 'sun' ('day' / '.' / '') {return 0}
monday = 'mon' ('day' / '.' / '') {return 1}
tuesday = 'tue' ('s.' / 'sday' / 's' / '.' / '') {return 2}
wednesday = 'wed' ('nesday' / '.' / '') {return 3}
thursday = 'thu' ('rsday' / 'r.' / 'rs.' / 'rs' / 'r' / '') {return 4}
friday = 'fri' ('day' / 'd.' / 'd' / '.' / '') {return 5}
saturday = 'sat' ('urday' / '.' / '') {return 6}
public_holiday = ('ph' / 'public holiday') {return undefined}

/*
* Time Phrases
*/

time_range = !day_phrase [^0-9]* time1:time_phrase time_separator time2:time_phrase (!day_phrase !time_phrase .)*
{
  var hours1 = time1[0]
  var mins1 = time1[1]
  var hours2 = time2[0]
  var mins2 = time2[1]

  if (hours2 < hours1) {
    hours2 += 24
  }
  return [hours1, mins1, hours2, mins2]
}

am_pm = _ am_pm:(am / pm)? _ {return am_pm || 0}
am = ('am' / 'a.m.' / 'noon') {return 0}
pm = ('pm' / 'p.m.') {return 12}

time_separator = _ ('to' / .) _
_ = [ \t\r\n]*
__ = [ \t\r\n]+

time_phrase = time:long_time am_pm:am_pm
{
  var hours = time[0]
  var mins = time[2]
  return [hours + am_pm, mins]
}

long_time = hours colon minutes / four_digit_time
four_digit_time = a:[0-9] b:[0-9] c:[0-9] d:[0-9]
{
  return [parseInt(a + b, 10), '', parseInt(c + d, 10)]
}

hours = minutes
minutes = minutes:([0-9] [0-9]?) {return parseInt(minutes.join(''), 10)}
colon = ':' / '：'
