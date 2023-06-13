# Todo App

![todo app screenshot](https://github.com/westonludeke/todo_app/blob/main/public/todo_app.png?raw=true)

### About This Project

This is a todo list CRUD app with a focus on the front-end portion of a Node application. The code was written in Javascript, HTML, and CSS. 

The focus was not on the app's aesthetics (i.e. not the HTML and CSS) and more on the components of building a functional front-end app.

### Goals

* All CRUD operations for the todos happen first on the server, then afterwards on the front-end.

* A `main` content area on the website which will display the todo list

* A `nav` area on the sidebar to display groupings of the different todo sublists (i.e. subgroups of todos grouped by month/year).

* A modal which loads when adding/editing a todo, allowing the user to make the necessary additions and/or changes.

* The `nav` section updates as the master list of all todos updates.


### Directions To Use App

To run the application

1. Install and run a Node version that is between `> 9.0` but `<= LTS Dubnium (v10.24.1)`.
2. Clone the repo
3. Run `npm install` from the root project folder which will install the needed dependencies
4. Run `npm start` to start up the server
5. Navigate to http://localhost:3000/ in your browser to view the project

Note: You can view the application's API documentation by navigating to http://localhost:3000/doc

### Areas for Improvement

* The code isn't nearly as DRY as it should be. Several of the functions should be refactored and/or split into multiple helper functions. For example, the function `openTodoModal` is too complex and the logic can be a bit hard to follow.

* Related logic should be grouped into objects, classes, and/or modules where possible, in order to add a layer of abstraction.


