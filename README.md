# Hours Parser

## Running the example

    npm install
    npm test

## Architecture

We use PEG.js Parser Generator to parse opening hours strings into the form

    [day_expression1, day_expression2 ...]

where each day_expression takes the form

    day_expression = [day_phrase time_phrase1, time_phrase2 ...]

    day_phrase = [day1, day2]
    time_phrase = [hours1, minutes1, hours2, minutes2]

We group all the day_expressions by day and combine times to remove overlaps.
We then 'invert' the grouping so that we can combine days with like times.
Finally we apply string formatting with the correct separators (',' ';').

## Extension

The parser can be easily extended provided that it returns arrays of the form above.
For example to parse "9:30 a.m. - 5:00 p.m. Mon to Fri" we could add a rule to the grammar

    reverse_day = time_phrase+ day_phrase
