// Reload webpage to go home
const reloadLinks = document.querySelectorAll(".reloadLink");
reloadLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    location.reload();
  });
});

// Function to retrieve and display all todos
function fetchTodos() {
  console.log('invoking - fetchTodos');
  viewingCompletedSublist = false;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:3000/api/todos', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const todos = JSON.parse(xhr.responseText);
        const allTodosLength = todos.length;
        displayTodos(todos);
        displayTodoCountOnListHeader(todos, allTodosLength);
        // createSublists(todos);
        // createCompletedSublists(todos);
        fetchUpdatesForSidebar();
      } else {
        alert('Failed to fetch todos.');
      }
    }
  };
  xhr.send();
}

// Function to fetch and display only completed todos
function fetchCompletedTodos() {
  console.log('invoking - fetchCompletedTodos');
  viewingCompletedSublist = true;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:3000/api/todos', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const todos = JSON.parse(xhr.responseText);
        const allTodosLength = todos.length;
        const filteredTodos = todos.filter(function(todo) {
          return todo.completed === true;
        });
        clearTodos();
        displayTodos(filteredTodos);
        displayTodoCountOnListHeader(filteredTodos, allTodosLength);
      } else {
        alert('Failed to fetch todos.');
      }
    }
  };
  xhr.send();
}

function clearTodos(){
  const todoList = document.getElementById('todosList');
  const liElements = todoList.querySelectorAll('li');
  liElements.forEach(li => {
    li.remove();
  });
}

// Move completed todos to bottom of Content section
function sortTodos(todos){
  todos.sort(function(a, b) {
    if (a.completed && !b.completed) { return 1 };
    if (!a.completed && b.completed) { return -1 };
    return 0;
  });
  return todos;
}

function createCheckbox(todo) {
  const checkbox = document.createElement('input');
  checkbox.setAttribute('type', 'checkbox');
  checkbox.classList.add('todo-checkbox');
  checkbox.checked = todo.completed;

  checkbox.addEventListener('click', function(event) {
    event.stopPropagation();
    const updatedTodo = { completed: !todo.completed };
    console.log('checkbox event listener');
    updateTodoItem(todo.id, updatedTodo);
  });
  return checkbox;
}

// Adds trashcan to each todo box
function createDeleteButton(todo, todos){
  const deleteButton = document.createElement('button');
  deleteButton.innerHTML = '<i class="fas fa-trash"></i>'; // Add the trash can icon
  deleteButton.addEventListener('click', function () {
    event.stopPropagation();
    deleteTodoItem(todo.id, todos);
  });
  return deleteButton;
}

// Function to delete a todo item
function deleteTodoItem(todoId, todos) {
  const xhr = new XMLHttpRequest();
  xhr.open('DELETE', `http://localhost:3000/api/todos/${todoId}`, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 204) {
        // Remove the deleted todo from the todos array
        const updatedTodos = todos.filter(todo => todo.id !== todoId);
        clearTodos();
        displayTodos(updatedTodos);
        fetchUpdatesForSidebar();
        displayTodoCountOnListHeader(updatedTodos, updatedTodos.length);
      } else {
        alert('Failed to delete todo.');
      }
    }
  };
  xhr.send();
}

function clickTodoBoxChangeStatus(todo, listItem) {
  listItem.addEventListener('click', function (event) {
    if (event.target.tagName !== 'SPAN' && event.target.tagName !== 'BUTTON') {
      const updatedTodo = { completed: !todo.completed };
      // console.log('clickTodoBoxChangeStatus event listener');
      updateTodoItem(todo.id, updatedTodo);
    }
  });
}

function displayTodoCountOnListHeader(todos, allTodosLength) {
  const todoCount = document.createElement('span');
  todoCount.textContent = todos.length;

  const todoHeader = document.querySelector('#listHeader');
  const existingSpan = todoHeader.querySelector('span');

  if (existingSpan) { 
    todosHeader.removeChild(existingSpan);
    todoHeader.textContent = todoHeader.textContent.replace(' - ', '');
  };

  todoHeader.appendChild(document.createTextNode(' - '));
  todoHeader.appendChild(todoCount);
}

let currentTodoSubset = [];

function displayTodos(todos) {
  console.log('invoking - displayTodos');
  todos = sortTodos(todos);
  console.log('todos: ', todos);
  currentTodoSubset = todos; 

  const todoList = document.createElement('ul');
  todoList.setAttribute('id', 'todosList');

  todos.forEach(function (todo) {
    const listItem = document.createElement('li');
    const title = todo.title;
    const month = todo.month;
    const year = todo.year;
    let dueDate = '';

    if (month === '00' || month === '') {
      dueDate = 'No Due Date';
    } else if (year === '' || year === '0000') {
      dueDate = `No Due Date`;
    } else {
      dueDate = `${month}/${year.slice(-2)}`;
    }

    // Create the checkbox element
    let checkbox = createCheckbox(todo);
    listItem.appendChild(checkbox);

    // Create the todo text span
    const todoText = document.createElement('span');
    todoText.classList.add('todo-text');
    todoText.textContent = `${title} - ${dueDate}`;
    listItem.appendChild(todoText);

    // Apply strikethrough if todo is completed
    if (todo.completed) {
      listItem.style.textDecoration = 'line-through';
      checkbox.checked = true;
    }

    listItem.classList.add('todo');
    let deleteButton = createDeleteButton(todo, todos);

    // Add click event listener to open modal with todo details
    todoText.addEventListener('click', function () { openTodoModal(todo) });

    clickTodoBoxChangeStatus(todo, listItem);

    listItem.appendChild(deleteButton);
    todoList.appendChild(listItem);
  });

  const addTodo = document.getElementById('addTodo');
  addTodo.parentNode.insertBefore(todoList, addTodo.nextSibling);
}

// Call the fetchTodos function when the webpage loads
window.addEventListener('load', function() {
  fetchTodos();
});

// group todos by mm/yy combination
function createSublists(todos) {
  const sublists = {};

  todos.forEach(function (todo) {
    const month = todo.month;
    const year = todo.year;
    const dueDate = (month === '00' || year === '0000') ? 'No Due Date' : (month && year) ? `${month}/${year.slice(-2)}` : 'No Due Date';

    if (!sublists[dueDate]) {
      sublists[dueDate] = [];
    }
    sublists[dueDate].push(todo);
  });
  displaySublistsOnSidebar(sublists);
  displaySublistsOnContent(sublists);
}

function displaySublistsOnSidebar(sublists) {
  const sidebar = document.getElementById('sidebar');
  const allTodosLabel = sidebar.querySelector('h4');

  // Clear existing sublists
  const existingSublists = sidebar.querySelectorAll('.sublist');
  existingSublists.forEach((sublist) => { sublist.remove() });

  // Order sublists by month/year combination
  const orderedSublists = Object.keys(sublists).sort((a, b) => {
    if (a === 'No Due Date') return 1; // 'No Due Date' sublist should always be at the top
    const [monthA, yearA] = a.split('/');
    const [monthB, yearB] = b.split('/');
    const dateA = new Date(Number(yearA), Number(monthA) - 1, 1);
    const dateB = new Date(Number(yearB), Number(monthB) - 1, 1);
    return dateB - dateA;
  });

  // Display sublists
  orderedSublists.forEach((sublistKey) => {
    const sublist = sublists[sublistKey];
    const sublistItem = document.createElement('h6');
    sublistItem.textContent = `${sublistKey} - (${sublist.length})`;
    sublistItem.classList.add('sublist');
    allTodosLabel.parentNode.insertBefore(sublistItem, allTodosLabel.nextSibling);
  });
}

function displaySublistsOnContent(sublists) {
  console.log('invoking - displaySublistsOnContent');
  console.log('sublists: ', sublists);
  const sidebar = document.getElementById('sidebar');
  const sublistItems = sidebar.querySelectorAll('.sublist');

  sublistItems.forEach(function(sublistItem) {
    sublistItem.addEventListener('click', function() {
      dateOfSublistBeingCurrentlyViewed = sublistItem.textContent.split(' - ')[0];
      viewingCompletedSublist = false;
      const parts = sublistItem.textContent.split('-');
      const selectedSublist = parts[0].trim();
      const todos = sublists[selectedSublist];
      clearTodos();
      displayTodos(todos);

      const todoCount = todos.length;
      displaySublistNameInListHeader(selectedSublist, todoCount);
    });
  });
}

function displaySublistNameInListHeader(sublistName, todoCount) {
  const listHeader = document.querySelector('h3');
  const spanElement = document.createElement('span');
  spanElement.textContent = todoCount;
  listHeader.innerHTML = `${sublistName} - `;
  listHeader.appendChild(spanElement);
}

// group completed todos by mm/yy combination
function createCompletedSublists(todos) {
  const sublists = {};

  todos.forEach(function (todo) {
    if (todo.completed) {
      const month = todo.month;
      const year = todo.year;
      const dueDate = (month === '00' || year === '0000') ? 'No Due Date' : (month && year) ? `${month}/${year.slice(-2)}` : 'No Due Date';

      if (!sublists[dueDate]) { sublists[dueDate] = []; }
      sublists[dueDate].push(todo);
    }
  });
  displayCompletedSublistsOnSidebar(sublists);
  displayCompletedSublistsOnContent(sublists);
  return sublists;
}

function displayCompletedSublistsOnSidebar(sublists) {
  const sidebar = document.getElementById('sidebar');
  const completedTodosLabel = sidebar.querySelector('#completedTodos');

  // Clear existing completed sublists
  const existingSublists = sidebar.querySelectorAll('.completed-sublist');
  existingSublists.forEach((sublist) => { sublist.remove(); });

   // Order sublists by month/year combination
  const orderedSublists = Object.keys(sublists).sort((a, b) => {
    if (a === 'No Due Date') return 1; // 'No Due Date' sublist should always be at the top
    const [monthA, yearA] = a.split('/');
    const [monthB, yearB] = b.split('/');
    const dateA = new Date(Number(yearA), Number(monthA) - 1, 1);
    const dateB = new Date(Number(yearB), Number(monthB) - 1, 1);
    return dateB - dateA;
  });

  // Display completed sublists
  orderedSublists.forEach((sublistKey) => {
    const sublist = sublists[sublistKey];
    const sublistItem = document.createElement('h6');
    sublistItem.textContent = `${sublistKey} - (${sublist.length})`;
    sublistItem.classList.add('completed-sublist');
    completedTodosLabel.parentNode.insertBefore(sublistItem, completedTodosLabel.nextSibling);
  });
}

let viewingCompletedSublist = false;
let dateOfSublistBeingCurrentlyViewed = '';

function displayCompletedSublistsOnContent(sublists) {
  console.log('invoking - displayCompletedSublistsOnContent');
  console.log('sublists: ', sublists);
  const sidebar = document.getElementById('sidebar');
  const sublistItems = sidebar.querySelectorAll('.completed-sublist');

  sublistItems.forEach(function (sublistItem) {
    sublistItem.addEventListener('click', function () {
      dateOfSublistBeingCurrentlyViewed = sublistItem.textContent.split(' - ')[0];
      viewingCompletedSublist = true;
      const parts = sublistItem.textContent.split('-');
      const selectedSublist = parts[0].trim();
      const todos = sublists[selectedSublist];
      clearTodos();
      displayTodos(todos);

      const todoCount = todos.length;
      displaySublistNameInListHeader(selectedSublist, todoCount);
    });
  });
}

function showModal() {
  modalOverlay.style.display = 'block';
  modal.style.display = 'block';
  clearModalFields();
}

function hideModal() {
  modalOverlay.style.display = 'none';
  modal.style.display = 'none';
}

// Show modal when "+ Add new todo" is clicked
const addTodo = document.getElementById('addTodo');
const modalOverlay = document.getElementById('modal-overlay');
const modal = document.getElementById('modal');

const cancelButton = document.getElementById('cancelButton');
const newSaveButton = document.getElementById('new-saveButton');
const hideEditSaveButton = document.getElementById('edit-saveButton');
const showNewSaveButton = document.getElementById('new-saveButton');
const hideMarkCompleteButton = document.getElementById('markCompleteButton');
const hideMarkIncompleteButton = document.getElementById('markIncompleteButton');

addTodo.addEventListener('click', function(){
  showModal();
  hideEditSaveButton.style.display = "none";
  hideMarkCompleteButton.style.display = "none";
  hideMarkIncompleteButton.style.display = "none";
  showNewSaveButton.style.display = "block";
});
cancelButton.addEventListener('click', hideModal);
newSaveButton.addEventListener('click', function() { addNewTodo() });

// Clear the input fields of the modal
function clearModalFields() {
  document.getElementById('title').value = '';
  document.getElementById('dueDay').selectedIndex = 0;
  document.getElementById('dueMonth').selectedIndex = 0;
  document.getElementById('dueYear').value = '';
  document.getElementById('description').value = '';
}

function addNewTodo() {
  const title = document.getElementById('title').value.trim();
  if (title.length < 3) {
    alert('Title must be at least 3 characters long.');
    return;
  }

  const dueDay = document.getElementById('dueDay').selectedIndex;
  const dueMonth = document.getElementById('dueMonth').selectedIndex;
  const dueYear = document.getElementById('dueYear').value;
  const completed = false;
  const description = document.getElementById('description').value.trim();

  const todoData = {
    title,
    day: dueDay.toString().padStart(2, '0'),
    month: dueMonth.toString().padStart(2, '0'),
    year: dueYear,
    completed,
    description,
  };

  const xhr = new XMLHttpRequest();

  xhr.open('POST', 'http://localhost:3000/api/todos', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 201) {
        const response = JSON.parse(xhr.responseText);
        hideModal();
        location.reload();
      } else {
        alert('Todo cannot be saved.');
      }
    }
  };
  xhr.send(JSON.stringify(todoData));
}

// Close modal when click is outside
window.onclick = function(event){
  if (event.target === modalOverlay){ modalOverlay.style.display = 'none' };
  if (event.target === modal){ modal.style.display = 'none'; };
}

function updateTodoItem(todoId, updatedTodo) {
  console.log('invoking - updateTodoItem');
  console.log('todoId: ', todoId);
  console.log('updatedTodo: ', updatedTodo);
  console.log('----');
  if (updatedTodo.month === '-1' || updatedTodo.month === '') { updatedTodo.month = '00' };
  if (updatedTodo.year === '-1' || updatedTodo.year === '') { updatedTodo.year = '0000' };
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', `http://localhost:3000/api/todos/${todoId}`, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        hideModal();
        const updatedObj = JSON.parse(xhr.responseText);
        fetchUpdates();
      } else {
        alert('Failed to update todo.');
      }
    }
  };
  xhr.send(JSON.stringify(updatedTodo));
}

// Function to fetch updated master todo list from the server
function fetchUpdates() {
  console.log('invoking - fetchUpdates');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `http://localhost:3000/api/todos`, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const updatedTodoList = JSON.parse(xhr.responseText);
        console.log('updatedTodoList: ', updatedTodoList);
        displayUpdatesOnContent(updatedTodoList);
      } else {
        alert('Failed to fetch updates.');
      }
    }
  };
  xhr.send();
}

// filter entire todo list to display only the updated sublist on the content section
function displayUpdatesOnContent(updatedTodoList) {
  console.log('invoking - displayUpdatesOnContent');
  console.log('updatedTodoList: ', updatedTodoList);
  let filteredUpdatedTodoList;

  if (dateOfSublistBeingCurrentlyViewed === 'No Due Date') {
    console.log('viewing no due date');
    filteredUpdatedTodoList = updatedTodoList.filter(todo => (todo.month === '00' || todo.month === '') || (todo.year === '0000' || todo.year === ''));
  } else if (dateOfSublistBeingCurrentlyViewed.match(/^\d{2}\/\d{2}$/)) {
    let [month, year] = dateOfSublistBeingCurrentlyViewed.split('/');
    console.log(`viewing ${month}/${year}`);
    year = '20' + year;
    filteredUpdatedTodoList = updatedTodoList.filter(todo => todo.month === month && todo.year === year);
  } else if (dateOfSublistBeingCurrentlyViewed === ''){
    console.log("viewing '' ");
    filteredUpdatedTodoList = updatedTodoList;
  }

  if (viewingCompletedSublist){
    filteredUpdatedTodoList = filteredUpdatedTodoList.filter(todo => todo.completed === true);
  }
  console.log('filteredUpdatedTodoList: ', filteredUpdatedTodoList);
  clearTodos();
  displayTodos(filteredUpdatedTodoList);
  fetchUpdatesForSidebar();
  displayTodoCountOnListHeader(filteredUpdatedTodoList, filteredUpdatedTodoList.length);
}

function fetchUpdatesForSidebar() {
  console.log('invoking - fetchUpdatesForSidebar');
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:3000/api/todos', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const todos = JSON.parse(xhr.responseText);
        const allTodosLength = todos.length;
        createSublists(todos);
        createCompletedSublists(todos);
        const allTodosCount = document.getElementById('allTodosCount');
        const completedTodosCount = document.getElementById('completedTodosCount');
        const completedTodos = todos.filter(todo => todo.completed).length;
        allTodosCount.textContent = `(${allTodosLength})`;
        completedTodosCount.textContent = `(${completedTodos})`;
      } else {
        alert('Failed to fetch sidebar updates.');
      }
    }
  };
  xhr.send();
}

function openTodoModal(todo) {
  console.log('openTodoModal todo: ', todo);
  const titleInput = document.getElementById('title');
  const dueDaySelect = document.getElementById('dueDay');
  const dueMonthSelect = document.getElementById('dueMonth');
  const dueYearSelect = document.getElementById('dueYear');
  const descriptionTextarea = document.getElementById('description');
  const editSaveButton = document.getElementById('edit-saveButton');

  // Hide new save button and show edit save button
  const hideNewSaveButton = document.getElementById('new-saveButton');
  hideNewSaveButton.style.display = "none";
  editSaveButton.style.display = "block";

  if (todo.completed === false){
    // Show Mark As Complete button
    const markCompleteButton = document.getElementById('markCompleteButton');
    markIncompleteButton.style.display = "none";
    markCompleteButton.style.display = "block";

    // mark todo as complete
    markCompleteButton.addEventListener('click', function() {
      const updatedTodo = { completed: true };
      console.log('mark todo as complete');
      updateTodoItem(todo.id, updatedTodo);
    });
  } else {
    // Show Mark As Incomplete button
    const markIncompleteButton = document.getElementById('markIncompleteButton');
    markCompleteButton.style.display = "none";
    markIncompleteButton.style.display = 'block';
    // mark todo as incomplete
    markIncompleteButton.addEventListener('click', function() {
      const updatedTodo = { completed: false };
      console.log('mark todo as incomplete');
      updateTodoItem(todo.id, updatedTodo);
    });
  }

  // Populate the modal with todo data
  titleInput.value = todo.title;
  dueDaySelect.value = todo.day.replace(/^0+/, ''); // Remove leading zero if it exists
  dueMonthSelect.value = convertMonthIndexToName(todo.month);
  dueYearSelect.value = todo.year;
  descriptionTextarea.value = todo.description;

  modalOverlay.style.display = 'block';
  modal.style.display = 'block';

  // Track whether the event listener is removed
  let isEventListenerRemoved = false;

  // Update todo on save button click
  console.log('Attaching editSaveButton event listener');
  editSaveButton.addEventListener('click', handleEditSaveButtonClick);

  // Define the event listener function inside openTodoModal
  function handleEditSaveButtonClick() {
    if (isEventListenerRemoved){
      return;
    }

    console.log('editSaveButton.addEventListener');
    const updatedTitle = titleInput.value.trim();
    if (updatedTitle.length < 3) {
      alert('Title must be at least 3 characters long.');
      return;
    }

    const updatedDueDay = dueDaySelect.value;
    const updatedDueMonth = dueMonthSelect.selectedIndex;
    const updatedDueYear = dueYearSelect.value;
    const updatedDescription = descriptionTextarea.value.trim();

    const updatedTodo = {
      title: updatedTitle,
      day: updatedDueDay.toString().padStart(2, '0'),
      month: updatedDueMonth.toString().padStart(2, '0'),
      year: updatedDueYear,
      description: updatedDescription,
    };

    console.log('update modal');
    console.log('todo.id: ', todo.id);
    updateTodoItem(todo.id, updatedTodo);

    // Remove the event listener
    editSaveButton.removeEventListener('click', handleEditSaveButtonClick);
  }

  function closeModal() {
    modalOverlay.style.display = 'none';
    modal.style.display = 'none';

    // Check if the event listener is already removed
    if (!isEventListenerRemoved) {
      // Remove the event listener
      editSaveButton.removeEventListener('click', handleEditSaveButtonClick);
      isEventListenerRemoved = true;
    }
  }

  // Attach event listener to close the modal when click is outside
  function handleClickOutsideModal(event) {
    if (event.target === modalOverlay || event.target === modal) {
      closeModal();
    }
  }

  // Attach event listener for click events
  window.addEventListener('click', handleClickOutsideModal);

  // Function to cleanup event listener when modal is closed
  function cleanupEventListener() {
    window.removeEventListener('click', handleClickOutsideModal);
  }

  // Event listener for cancelButton click
  function handleCancelButtonClick() {
    editSaveButton.removeEventListener('click', handleEditSaveButtonClick);
    closeModal();
  }

  cancelButton.addEventListener('click', handleCancelButtonClick);

  function handleMarkCompleteButtonClick() {
    editSaveButton.removeEventListener('click', handleEditSaveButtonClick);
    closeModal();
  }

  markCompleteButton.addEventListener('click', handleMarkCompleteButtonClick);

  function handleMarkIncompleteButtonClick() {
    editSaveButton.removeEventListener('click', handleEditSaveButtonClick);
    closeModal();
  }

  markIncompleteButton.addEventListener('click', handleMarkIncompleteButtonClick);
}

// Get references to the required elements
const allTodosList = document.getElementById('allTodos');
const completedTodosList = document.getElementById('completedTodos');
const todosHeader = document.getElementById('listHeader');

// Add click event listener to the 'Completed Todos' list item
completedTodosList.addEventListener('click', function() {
  // Change the header text to 'Completed Todos'
  todosHeader.textContent = 'Completed Todos ';
  fetchCompletedTodos();
});

// Function to convert month index to name
function convertMonthIndexToName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[parseInt(monthIndex) - 1];
}

// Generate options for day dropdown
const dueDaySelect = document.getElementById('dueDay');
for (let day = 1; day <= 31; day++) {
  const option = document.createElement('option');
  option.value = day;
  option.textContent = day;
  dueDaySelect.appendChild(option);
}

// Generate options for month dropdown
const dueMonthSelect = document.getElementById('dueMonth');
const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
];
for (let i = 0; i < months.length; i++) {
  const option = document.createElement('option');
  option.value = months[i];
  option.textContent = months[i];
  dueMonthSelect.appendChild(option);
}

// Generate options for year dropdown
const dueYearSelect = document.getElementById('dueYear');
const currentYear = new Date().getFullYear();
const nextDecade = currentYear + 10;
for (let year = currentYear; year <= nextDecade; year++) {
  const option = document.createElement('option');
  option.value = year;
  option.textContent = year;
  dueYearSelect.appendChild(option);
}