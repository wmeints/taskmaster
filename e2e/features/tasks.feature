Feature: Tasks
  People plan their day by adding tasks, breaking them into subtasks and completing them.

  Background:
    Given Ada has an account

  Scenario: Plan and finish a task for today
    When Ada adds the task "Write the quarterly report"
    And Ada opens the task "Write the quarterly report"
    And Ada adds the subtask "Collect the figures"
    And Ada ticks off the subtask "Collect the figures"
    Then Ada sees 1 of 1 subtasks done
    When Ada completes the task "Write the quarterly report"
    And Ada reloads the page
    Then Ada sees the task "Write the quarterly report" as completed
