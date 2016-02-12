# Hours Parser

## Testing

    npm install
    npm test # tests on node
    npm run test-phantomjs
    npm run test-browser # tests on saucelabs.  Requires ~/.zuulrc to be set.

All tests pass on node, phantomjs and all browsers provided by opensauce with the following exceptions

    ie 6, 7

That is because the PEG.js parser generator does not support ie 6 and 7.  For the full list of browsers inspect `.zuul.yml`

## Architecture

We use PEG.js parser generator to parse opening hours strings into the form

    [day_expression1, day_expression2 ...]

where each day_expression takes the form

    day_expression = [day_phrase time_phrase1, time_phrase2 ...]

    day_phrase = [day1, day2 ...]
    time_phrase = [hours1, minutes1, hours2, minutes2]

We group all the day_expressions by day and combine times to remove overlaps.
We then 'invert' the grouping so that we can combine days with like times.
Finally we apply string formatting with the correct separators (',' ';').

## Extension

The parser can be easily extended provided that it returns arrays of the form above.
Tests have been added to the end of `test/test.js` to demonstrate this.
