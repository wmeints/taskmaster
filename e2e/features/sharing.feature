Feature: Sharing
  People share a list so others can work on its tasks with them.

  Background:
    Given Ada has an account
    And Grace has an account

  Scenario: Share a list with a teammate
    Given Ada has a list "Launch" with the task "Book the venue"
    When Ada invites Grace to the list "Launch"
    And Grace accepts the invite to the list "Launch"
    And Grace opens the list "Launch"
    Then Grace sees the task "Book the venue"
