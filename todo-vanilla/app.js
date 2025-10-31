// ===== Date & Time =====
const todayDate = document.querySelector('#date');
const nowTime = document.querySelector('#time');

//date
function fmtDate(d = new Date()) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    }).format(d);
}


//time
function fmtTime(d = new Date()) {
    //Intl = formate into a localized string (locale, option)
    //locale: controls language/region rules
    //option: tilles which parts to show
    //format(d): convert to human readable string
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', second: '2-digit'
    }).format(d);
}

//Initialize once on page load
todayDate.textContent = fmtDate();
nowTime.textContent = fmtTime();
//update time pre-second
setInterval(() => nowTime.textContent = fmtTime(), 1000);




// ===== Week (Sun - Sat) =====
const weekContainer = document.querySelector('#week');
//current selected day
let selectedDate = new Date();

function showWeek() {
    //cleaning up the old date and get it ready for rendering the week
    weekContainer.innerHTML = "";

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);

        const dayBox = document.createElement("div");
        dayBox.classList.add("day");
        dayBox.innerHTML = `
            <div class="dow">${weekNames[i]}</div>
            <div class="dnum">${dayDate.getDate()}</div>
            `;

        const isSelected =
            dayDate.getFullYear() === selectedDate.getFullYear() &&
            dayDate.getMonth() === selectedDate.getMonth() &&
            dayDate.getDate() === selectedDate.getDate();
        if (isSelected) dayBox.classList.add("active");


        dayBox.addEventListener("click", () => {
            selectedDate = dayDate;
            showWeek();
            renderTodos();              //re-render todo

        });

        weekContainer.appendChild(dayBox);
    }
}

showWeek();


// ===== To do =====
const taskList = document.querySelector('#task-list');
const emptyMsg = document.querySelector('#message');
// ===== add button + form =====
const addBtn = document.querySelector('#add-btn');
const form = document.querySelector('#new-task');
const textInput = document.querySelector('#task-text');
const timeInput = document.querySelector('#task-time')

//read the local storage
let todos = JSON.parse(localStorage.getItem('todos') || '[]');

//for edit feature, null means no task is being edit
let editingTaskId = null;

//function to save todos
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}


//helper: convert date
function ymd(dateObj) {
    const y = dateObj.getFullYear();   //get year
    //padStart(target length, content that needs to be fill)
    //getMonth() and .getDay() always need to +1 because it start at 0
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');  //get month number and add 0
    const d = String(dateObj.getDate()).padStart(2, '0');  //get day and add 0
    return `${y}-${m}-${d}`
}


//add event: show form
addBtn.addEventListener('click', () => {
    addBtn.style.display = 'none';
    form.style.display = 'flex';
    textInput.focus();
});


// submit event
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (!text) return;

    //todo object
    todos.push({
        id: crypto.randomUUID(),
        date: ymd(selectedDate),
        text,
        time: timeInput.value || '',
        isDone: false
    });

    saveTodos();

    textInput.value = '';
    timeInput.value = '';
    form.style.display = 'none';
    addBtn.textContent = 'Add more';
    addBtn.style.display = 'inline-block';

    renderTodos();
})



// ===== render todo task =====
// format time
function format12h(hhmm) {
    if (!hhmm) return '--:--';
    const [h, m] = hhmm.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat('en-US', {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    }).format(d);
}


//render function
function renderTodos() {
    const dayKey = ymd(selectedDate);
    //filter the todo and only showing today's todo
    const todayTodos = todos.filter(t => t.date === dayKey);

    //cleaning the list
    taskList.innerHTML = '';

    // if there's no todo, return the empty message
    if (todayTodos.length === 0) {
        emptyMsg.style.display = 'block';
        addBtn.textContent = 'Add';
        addBtn.style.display = 'inline-block';
        form.style.display = 'none';
        return;
    }

    //if there's todo, hide the message, change button to add more
    emptyMsg.style.display = 'none';
    addBtn.textContent = 'Add more';
    addBtn.style.display = 'inline-block';
    form.style.display = 'none';

    //todo content
    todayTodos.forEach(t => {

        //render a todo list DOM
        const li = document.createElement('li');
        li.className = 'item';
        if (t.isDone) li.classList.add('done');
        li.dataset.id = t.id;

        //check box
        const checkBox = document.createElement('span');
        checkBox.className = 'check-box';
        checkBox.addEventListener('click', () => {
            t.isDone = !t.isDone;
            saveTodos();
            renderTodos();
        });
        li.appendChild(checkBox);


        //if the selected task is being edit, switch to edit mode
        if (t.id === editingTaskId) {
            //input
            const textInput = document.createElement('input');
            textInput.className = 'inputBox';
            textInput.value = t.text;
            li.appendChild(textInput);

            //time
            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.className = 'timeBox';
            timeInput.value = t.time || "";
            li.appendChild(timeInput);

            //save new edited task (support enter key)
            textInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveEditTask(t.id, textInput.value, timeInput.value);
                }

                if(e.key === 'Escape') {
                    editingTaskId = null;
                    renderTodos;
                }
            });

            //update button
            const updateTaskBtn = document.createElement('button');
            updateTaskBtn.className = 'updateTask-btn';
            updateTaskBtn.textContent = 'Update';
            updateTaskBtn.type = 'button';
            updateTaskBtn.addEventListener('click', () => {
                const newText = textInput.value.trim();
                const newTime = timeInput.value;
                if(!newText) return; //avoid empty text
                //if the content stays the same, just exit
                if(newText === t.text && newTime === (t.time || "")){
                    editingTaskId = null;
                    renderTodos();
                    return;
                    
                }
                saveEditTask(t.id, textInput.value, timeInput.value);
            });
            li.appendChild(updateTaskBtn);
            
            //calcel del button
            const calBtn = document.createElement('button');
            calBtn.className = 'cancel-btn';
            calBtn.textContent = 'Cancel';
            updateTaskBtn.type = 'button';
            calBtn.addEventListener('click',() =>{
                editingTaskId = null;
                    renderTodos();
            })
            li.appendChild(calBtn);



        } else {

            //show regular view ui
            //text
            const textSpan = document.createElement('span');
            textSpan.className = 'text';
            textSpan.textContent = t.text;
            li.appendChild(textSpan);

            //time
            const timeSpan = document.createElement('span');
            timeSpan.className = 'time';
            timeSpan.textContent = format12h(t.time);
            li.appendChild(timeSpan);

            //edit
            const editButton = document.createElement('button');
            editButton.className = 'edit-btn';
            editButton.addEventListener('click', () => {
                editingTask(t.id);
            });
            li.appendChild(editButton);

            //delete
            const delButton = document.createElement('button');
            delButton.className = 'del-btn'
            delButton.addEventListener('click', () => {
                if (confirm('Delete this task?'))
                    deleteTask(t.id);
            });
            li.appendChild(delButton);


        }

        taskList.appendChild(li);
    });



}


//telling which ui to render(switch mode)
function editingTask(id) {
    editingTaskId = id;
    renderTodos();
}


function saveEditTask(id, newInput, newTime) {
    //find the task
    const task = todos.find(t => t.id === id);
    if (!task) return;
    //update content
    task.text = newInput;
    if (typeof newTime === 'string' && newTime) task.time = newTime;
    //exit editing mode
    editingTaskId = null;

    saveTodos();
    renderTodos();

}


function deleteTask(id) {
    //if editing the task, when del, exit
    if (editingTaskId === id) editingTask = null;

    //delete the task
    todos = todos.filter(t => t.id !== id);

    saveTodos();
    renderTodos();
}


renderTodos();


