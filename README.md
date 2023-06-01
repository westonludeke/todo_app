# 239 Project

### Revision Notes

* Fixed the issue of the modal displaying incorrect content when clicking from the modal for editing a todo to the modal for adding a new todo.

* Clicking on the area surrounding a todo's name toggles the todo as complete/incomplete.

* When updating a todo, the current todo sublist is maintained

* When a todo is toggled/deleted, the currently selected todo group doesn't change

* I had to use global variables in two locations, which I understand isn't ideal and should be avoided.

* Javascript browser alerts are used to inform the user as to responses from the server. Not ideal and should be handled differently.


### Original Submission Notes

* I did almost 100% of the development of the Javascript code directly inside the `<script>` tags inside the HTML document. Then after finishing the coding process, I moved the JS code to the separate `script.js` file. Everything seems to still be working properly, but it's possible there still may be some edgecase issues as I ran out of time to do some more robust testing.

* I decided to hide the `Mark As Complete` button on the new todo modal and only display it on the modal to edit an existing incomplete todo.

* I also added a new button `Mark As Incomplete` which will display on the edit todo modal instead of the `Mark As Complete` button if the todo is already been completed. In case the user would like to change the todo's status from completed back to incomplete.

* Several of the JS functions are in dire need of refactoring, to have parts of their code split out into helpfer functions to improve code readability and maintainability. I ran out of time to do this.

* Several of the functions and parts of the codebase are repetitive, and don't always follow DRY practices. 
