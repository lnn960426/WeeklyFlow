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
setInterval(() => {
    nowTime.textContent = fmtTime();
}, 1000);




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

//read the local storage
let todos = JSON.parse(localStorage.getItem('todos') || '[]');

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


// ===== add button + form =====
const addBtn = document.querySelector('#add-btn');
const form = document.querySelector('#new-task');
const textInput = document.querySelector('#task-text');
const timeInput = document.querySelector('#task-time')

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
    const template = document.querySelector("#todo-item");

    //todo is the whole list, t is single task
    for (const t of todayTodos) {
        //get the content from the template, and make a colone of the first element child(li)
        // cloneNode(true) means: clone all the element inside of the template, false means only li
        const li = template.content.firstElementChild.cloneNode(true);

        //dataset is HTML deafult property that show the info of the selected property
        li.dataset.id = t.id;
        //css 
        if (t.isDone) li.classList.add('done');
        //set the text class as t.text
        li.querySelector('.text').textContent = t.text;
        //set the time class as t.time
        li.querySelector('.time').textContent = format12h(t.time);
        // appendchild can only be used in DOM
        taskList.appendChild(li);



    }

}

  const taskArea = document.getElementById('task-list');
  
        taskArea.addEventListener('click', (event) => {
            //check box
            //.closest searches up the DOM tree for elements that matchese a specified CSS selector
            //event only happen when the user click the check-box
            const checkBox = event.target.closest('.check-box');
            if(!checkBox) return;


            const li = checkBox.closest('li');
            if(!li) return;
            
            const id = li.dataset.id;

            //find the selected item's id
            const item = todos.find(t => t.id === id);
            if(!item) return;
            item.isDone = !item.isDone;

            saveTodos();
            renderTodos();



        })
        

renderTodos();


