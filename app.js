// BUDGET CONTROLLER
const budgetController = (() => {

    // function constructor for expenses
    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    // function constructor for incomes
    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = (type) => {
        let sum = 0;
        data.allItems[type].forEach((cur) => {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // data Structure for saving data
    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: (type, des, val) => { // add item is a method

            let newItem;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id;
            } else {
                ID = 0;
            }            

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
         
            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: (type, id) => {
            let ids, index;
            // id = 3
            // data.allItems[type][id];
            // ids = [1 2  4 6 8]
            //index = 3
            ids = data.allItems[type].map((current) => {
                return current.id;
            });
             index = ids.indexOf(id);

             if (index !== -1) {
                 data.allItems[type].splice(index, 1);
             }
        },

        calculateBudget: () => {
            // Calculate total income and expenses
                calculateTotal('exp');
                calculateTotal('inc');

            // Calculate the budget: income - expenses
                data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spend
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: () => {
            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: () => {
            let allPerc = data.allItems.exp.map((cur) => {
                return cur.getPercentage(); 
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: () => {
            console.log(data);
        } 
    }

})();

// UI CONTROLLER
const UIController = (() => {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    const formatNumber = (num, type) => {
        // + or - before number 2310.3456 -> + 2,310.34 and 2000 -> + 2,000.00
        // excactly 2 decimal points
        // comma separating the thousands

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        return `${sign} ${int}.${dec}`; 
    };

    const nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
            
        },

        addListItem: (obj, type) => {
            let html, newHtml;
            // Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = `
                <div class="item clearfix" id="inc-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn">
                            <i class="ion-ios-close-outline"></i>
                        </button>
                    </div>
                </div>
                </div>
                `;
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = `
                <div class="item clearfix" id="exp-%id%">
                <div class="item__description">%description%</div>
                <div class="right clearfix">
                    <div class="item__value">%value%</div>
                    <div class="item__percentage">21%</div>
                    <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                </div>
                </div>
                `;
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: (selectorID) => {
            const el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: () => {
            const fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);

            const fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current, index, array) => {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: (obj) => {
            let type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: (percentages) => {
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);            

            nodeListForEach(fields, function(current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }   
            });
        },

        displayMonth: () => {
        
            const now = new Date();

            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            const month = now.getMonth();
            const year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
        },

        changedType: () => {
            const fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);

                nodeListForEach(fields, (cur) => {
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: () => {
            return DOMstrings;
        }
    };
})();


// GLOBAL APP CONTROLER
const controller = ((budgetCtrl, UICtrl) => {

    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', (event) => {
            if (event.keycode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    const updateBudget = () => {
        
        // 1. Calculate the budget
            budgetCtrl.calculateBudget();

        // 2. Return the budget
            const budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
            // console.log(budget);
            UICtrl.displayBudget(budget);
    }

    updatePerdentages = () => {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        const percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
            // console.log(percentages);
        UICtrl.displayPercentages(percentages);
    }
    

    const ctrlAddItem = () => {
        // 1. Get the field input data
        const input = UICtrl.getInput();
        // console.log(input);

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update Budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePerdentages();
        }
        // console.log('It works');
    };

    const ctrlDeleteItem = (event) => {

        let splitID, type, ID;
        const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
       
        // inc-1
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
                budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from the UI
                UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
                updateBudget();

            // 4. Calculate and update percentages
            updatePerdentages();
        }
    }

    return {
        init: () => {
            console.log('Started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

    

})(budgetController, UIController);

controller.init();