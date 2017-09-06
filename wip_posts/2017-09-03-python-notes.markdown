---
layout: post
title:  "Programming Notes: Think Python 2e"
description: "Brief notes about Python"
date: 2017-09-03
tags: [python, programming]
---

# Variables, Expressions and Statements

- **Syntax Error:** "Syntax" refers to the structure of a program and the rules about that structure. For example, parentheses have to come in matching pairs, so (1 + 2) is legal, but 8) is a syntax error.
- **Runtime Error:** The second type of error is a runtime error, so called because the error does not appear until after the program has started running. These errors are also called exceptions because they usually indicate that something exceptional (and bad) has happened.
- **Semantic Error:** The third type of error is "semantic", which means related to meaning. If there is a semantic error in your program, it will run without generating error messages, but it will not do the right thing.

# Functions

- The argument is evaluated before the function is called.
- When you create a variable outside of any function, it belongs to `__main__`.
