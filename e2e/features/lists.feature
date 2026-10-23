Feature: Lists
  People group related tasks in lists of their own.

  Background:
    Given Ada has an account

  Scenario: Collect tasks in a new list
    When Ada creates the list "Groceries"
    Then Ada sees the "Groceries" view
    When Ada adds the task "Buy oat milk"
    And Ada reloads the page
    Then Ada sees the task "Buy oat milk"
    And Ada sees 1 open task in the list "Groceries"
