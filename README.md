# 239 Project

### Revision #2 Notes

I realized what I was doing wrong that was causing the issues:

My functions to handle updates to an existing todo was too convoluted. The app was originally attempting to fetch only the updates existing todo from the server, then to combine it with the rest of the todos being viewed in a sublist.

Instead, I decided it would be much easier to store the date logic (i.e. `02/23` or `No Due Date`, etc.) of the currently loaded sublist being viewed. Then, the app will fetch the entire todo list from the server after an update is made. After fetching the entire todo list, the code will then filter down the entire todo list to display the todos matching the current sublist's date logic.

The result is a much more simplified `fetchUpdates` function as it simply retrieves all todos from the server after an update is made to an existing todo. Then, the new `displayUpdatesOnContent` function filters down the todo list retrieved from `fetchUpdates` to match the parameters of the todo sublist the user was originally viewing to display to the user only the todos in the currently viewed sublist, post-update.

Other small fixes include handling bugs that were occurring in instances where the user removes the month and/or year value from an existing todo.


### Revision #1 Notes

* Fixed the issue of the modal displaying incorrect content when clicking from the modal for editing a todo to the modal for adding a new todo.

* Clicking on the area surrounding a todo's name toggles the todo as complete/incomplete.

* When updating a todo, the current todo sublist is maintained

* When a todo is toggled/deleted, the currently selected todo group doesn't change

* I had to use global variables in two locations, which I understand isn't ideal and should be avoided.

* Javascript browser alerts removed except to inform the user as to error responses from the server.


### Original Submission Notes

* I did almost 100% of the development of the Javascript code directly inside the `<script>` tags inside the HTML document. Then after finishing the coding process, I moved the JS code to the separate `script.js` file. Everything seems to still be working properly, but it's possible there still may be some edgecase issues as I ran out of time to do some more robust testing.

* I decided to hide the `Mark As Complete` button on the new todo modal and only display it on the modal to edit an existing incomplete todo.

* I also added a new button `Mark As Incomplete` which will display on the edit todo modal instead of the `Mark As Complete` button if the todo is already been completed. In case the user would like to change the todo's status from completed back to incomplete.

* Several of the JS functions are in dire need of refactoring, to have parts of their code split out into helpfer functions to improve code readability and maintainability. I ran out of time to do this.

* Several of the functions and parts of the codebase are repetitive, and don't always follow DRY practices. 
