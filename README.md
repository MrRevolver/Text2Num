# Text2Num
A simple utility to convert numeral words to numbers in your text. This may be relevant for speech recognition services. 

## Description

This can be useful to You, for example, if You use speech recognition to get numbers (meter readings, measurements, time and date, finances).

The script is implemented in JS and Python.

Script structure:
1. numparser - a framework that converts natural language numerals into programming language objects. Use it if you are processing only numerals.
2. textparser - a class that additionally processes text. Give it text containing numbers and it will return text with numbers.
3. helpers - a set of non-specific methods, such as polyfills and debugging tools.
4. "lc" folder contains a set of data specific to a particular natural language. Currently supported:
ru - Russian language.

Let's continue the development of this simple and affordable tool for the development of natural speech recognition and processing.
