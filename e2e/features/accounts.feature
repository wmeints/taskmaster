Feature: Accounts
  People create an account from the landing page and sign back in later to find their tasks.

  Scenario: Sign up from the landing page
    Given Ada is on the landing page
    When Ada creates an account from the landing page
    Then Ada sees the "Today" view
    And Ada is signed in

  Scenario: Sign out and sign back in
    Given Ada has an account
    When Ada signs out
    And Ada signs in
    Then Ada sees the "Today" view
    And Ada is signed in
