Feature: F1 Todos

  @story-F1.1
  Rule: A todo is added with a title and starts not done

    Scenario: Adding a todo
      Given the todo list is empty
      When Tess adds a todo titled "Book dentist appointment"
      Then the list has one todo titled "Book dentist appointment"
      And that todo is not done

    @negative
    Scenario: A blank title is refused
      Given Tess has an empty todo list
      When Tess adds a todo with a blank title
      Then the list still has no todos

    @negative
    Scenario: A title over 200 characters is refused
      Given Tess has an empty todo list
      When Tess adds a todo whose title is 201 characters long
      Then the list still has no todos

  @story-F1.1
  Rule: Spaces around a title are trimmed

    Scenario: Padded title
      Given Tess has an empty todo list
      When Tess adds a todo titled "  Renew library card  "
      Then the list has one todo titled "Renew library card"

  @story-F1.2
  Rule: Todos are listed oldest first and never reorder

    Scenario: Creation order
      Given Tess has an empty todo list
      When Tess adds "Buy oat milk" and then adds "Renew library card"
      Then the list shows "Buy oat milk" above "Renew library card"

    Scenario: Completing a todo keeps its place
      Given Tess has "Buy oat milk" followed by "Renew library card"
      When Tess marks "Buy oat milk" done
      Then the list still shows "Buy oat milk" above "Renew library card"

  @story-F1.3
  Rule: A todo can be marked done and undone

    Scenario: Marking done
      Given Tess has an open todo "Water the balcony plants"
      When Tess marks "Water the balcony plants" done
      Then "Water the balcony plants" is shown as done

    Scenario: Marking undone
      Given Tess has a done todo "Buy oat milk"
      When Tess marks "Buy oat milk" undone
      Then "Buy oat milk" is shown as not done

  @story-F1.4
  Rule: A todo's title can be edited to a non-blank title

    Scenario: Renaming
      Given Tess has a todo "Book dentist"
      When Tess changes its title to "Book dentist appointment"
      Then the list has one todo titled "Book dentist appointment"

    @negative
    Scenario: A blank title is refused on edit
      Given Tess has a todo "Book dentist"
      When Tess changes its title to a blank title
      Then the todo is still titled "Book dentist"

  @story-F1.5
  Rule: A todo is deleted immediately, without confirmation

    Scenario: Deleting
      Given Tess has only the todo "Renew library card"
      When Tess deletes "Renew library card"
      Then the list has no todos

  @story-F1.6
  Rule: Todos and their done state persist between visits

    Scenario: Returning to the app
      Given Tess has a done todo "Buy oat milk" and an open todo "Renew library card"
      When Tess reloads the app
      Then "Buy oat milk" is shown as done
      And "Renew library card" is shown as not done

  @story-F1.7
  Rule: An empty list shows a message instead of a blank page

    Scenario: No todos yet
      Given Tess has an empty todo list
      When Tess opens the app
      Then a message says there are no todos yet
