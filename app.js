// const { act } = require("react");

//                                      ----DOM----                                   \\
let main = document.querySelector('main');

const loginPageDOM = document.getElementById("login");
const menuPageDOM = document.getElementById("menu");
const apartmentsDOM = document.getElementById("apartments");
const serviceDOM = document.getElementById("services");
const feesDOM = document.getElementById("fees");

document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("building-btn").addEventListener("click", apartments);
document.getElementById("back-btnAp").addEventListener("click", homePage);
document.getElementById("deleteAps").addEventListener("click", deleteAp)
document.getElementById("addAps").addEventListener("click", addApsBlock);
document.getElementById("editAps").addEventListener("click", editApsBlock);
document.getElementById("cancel-apt").addEventListener("click", endAddAps);
document.getElementById("services-btn").addEventListener("click", services);
document.getElementById("back-btnSer").addEventListener("click", homePage);
document.getElementById("addSer").addEventListener("click", addSerBlock);
document.getElementById("cancel-ser").addEventListener("click", backBlockSer);
document.getElementById("deleteSer").addEventListener("click", deleteSer);
document.getElementById("editSer").addEventListener("click", editSerBlock);
document.getElementById("data-btn").addEventListener("click", fees);
document.getElementById("back-btnTax").addEventListener("click", homePage);
document.getElementById("generate-btn").addEventListener("click", generateTax);
document.getElementById("cancel-tax").addEventListener("click", backBlockAutoTax);
document.getElementById("taxAddBtn").addEventListener("click", payTaxeBlock);




//                                      ----DOM----                                   \\

//                                      ----DR----                                   \\
let whereObj = {
    par1: "",
    par2: "",
    par3: ""
}

let tBody = document.getElementById("tBody");
let tBodySer = document.getElementById("tBodySer");
let tBodyTax = document.getElementById("tBodyTax");

const url = "http://localhost:3000";
const dateZero = new Date('1910-01-01');


//                                      ----DR----                                   \\
function homePage() {
    main.innerHTML = '';

    if (sessionStorage.getItem('accessToken')) {
        main.appendChild(menuPageDOM);
    } else {
        main.appendChild(loginPageDOM);
    }
}

homePage();

async function login(e) {
    e.preventDefault();

    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const userObj = { username, password };

    let resp = await fetch("http://localhost:3000/user", {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userObj)
    })

    if (username.length < 1 || password.length < 1) {
        return alert("Потребителското име и парола са задължителни")

    } else if (resp.status != 200) {
        return alert("Такъв потребител не съществува")
    } else {
        let data = await resp.json();
        sessionStorage.setItem('accessToken', data.token);
        sessionStorage.setItem('userId', data.user.id);

        main.innerHTML = '';
        main.appendChild(menuPageDOM);
    }


}

function logout() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('userId')

    homePage();
}
//-------------------------------------------------------------------------------------\\
//                                      ----APART----                                   \\
async function apartments() {
    main.innerHTML = '';
    main.appendChild(apartmentsDOM);

    tBody.innerHTML = ''



    let resp = await fetch("http://localhost:3000/apartaments", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
    })

    if (resp.status == 403) {
        alert("Изтекла валидност!")
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('userId')
        homePage();
    } else if (resp.status !== 200) {
        alert("Проблем с взимането на апартаментите!");
    } else {
        let data = await resp.json();

        for (const key of data) {
            if (key.valid_to > "2000-01-01") {

            } else {
                const name = document.createElement("td");
                name.textContent = key.name;
                const floor = document.createElement("td");
                floor.textContent = key.floor;
                const number = document.createElement("td");
                number.textContent = key.number;
                const numPeople = document.createElement("td");
                numPeople.textContent = key.living;
                const money = document.createElement("td");
                money.textContent = key.remaining;
                const chip = document.createElement("td");
                chip.textContent = key.chip;
                const checkBoxTd = document.createElement("td");
                checkBoxTd.className = 'check-col';
                const checkBox = document.createElement("input");
                checkBox.type = "checkbox";
                checkBox.className = 'row-check';
                checkBoxTd.appendChild(checkBox);

                let tr = document.createElement("tr");
                tr.appendChild(name);
                tr.appendChild(floor);
                tr.appendChild(number);
                tr.appendChild(numPeople);
                tr.appendChild(money);
                tr.appendChild(chip);
                tr.appendChild(checkBoxTd);



                tBody.appendChild(tr);
            }
        }
    }
}

async function deleteAp() {
    let allEl = document.querySelectorAll(".row-check:checked");
    const token = sessionStorage.getItem('accessToken');

    for (let i = 0; i < allEl.length; i++) {
        let trEl = allEl[i].closest('tr');
        const tdElFloor = trEl.children[1].textContent;
        const tdElApNumber = trEl.children[2].textContent;
        const elObj = { 'floor': tdElFloor, 'number': tdElApNumber }

        let resp = await fetch('http://localhost:3000/deleteAp', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            body: JSON.stringify(elObj)
        })

        if (resp.status == 403) {
            alert("Изтекла валидност!")
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('userId')
            homePage();
        } else if (resp.status !== 200) {
            alert("Проблем с изтриването!");
        } else if (resp.status === 200) {
            trEl.remove();
        }
    }
}

function addApsBlock() {
    document.getElementById("add-modal").style.display = 'flex';
    document.getElementById("save-apt").addEventListener("click", addAps);
}

async function addAps() {
    const name = document.getElementById("apt-name").value;
    const floor = document.getElementById("apt-floor").value;
    const number = document.getElementById("apt-number").value;
    const living = document.getElementById("apt-people").value;
    const remaining = document.getElementById("apt-debt").value;
    const chip = document.getElementById("apt-chip").value;

    const token = sessionStorage.getItem('accessToken');

    if (name.length < 1 || floor.length < 1 || number.length < 1 || living.length < 1 || remaining.length < 1 || chip.length < 1) {
        alert("Всички полета са задължителни!")
    } else {
        const apppObj = { name, floor, number, living, remaining, chip }

        let resp = await fetch('http://localhost:3000/addAp', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            body: JSON.stringify(apppObj),
        })

        if (resp.status == 403) {
            alert("Изтекла валидност!")
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('userId')
            homePage();
        } else if (resp.status !== 200) {
            alert("Проблем с добавянето!");
        } else if (resp.status === 200) {
            alert("Успешно добавяне!");

            const newApName = document.createElement("td");
            newApName.textContent = name;
            const newApFloor = document.createElement("td");
            newApFloor.textContent = floor;
            const newApNumber = document.createElement("td");
            newApNumber.textContent = number;
            const NewApNumPeople = document.createElement("td");
            NewApNumPeople.textContent = living;
            const newApMoney = document.createElement("td");
            newApMoney.textContent = remaining;
            const newApChip = document.createElement("td");
            newApChip.textContent = chip;

            const checkBoxTd = document.createElement("td");
            checkBoxTd.className = 'check-col';
            const checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.className = 'row-check';
            checkBoxTd.appendChild(checkBox);

            let tr = document.createElement("tr");
            tr.appendChild(newApName);
            tr.appendChild(newApFloor);
            tr.appendChild(newApNumber);
            tr.appendChild(NewApNumPeople);
            tr.appendChild(newApMoney);
            tr.appendChild(newApChip);
            tr.appendChild(checkBoxTd);

            tBody.appendChild(tr);


            document.getElementById("apt-name").value = '';
            document.getElementById("apt-floor").value = '';
            document.getElementById("apt-number").value = '';
            document.getElementById("apt-people").value = '';
            document.getElementById("apt-debt").value = '';
            document.getElementById("apt-chip").value = '';


            document.getElementById("add-modal").style.display = "none";
        }
    }
}

function endAddAps() {
    document.getElementById("add-modal").style.display = "none";
}

function editApsBlock() {
    let allEl = document.querySelectorAll(".row-check:checked");

    if (allEl.length > 1) {
        alert("Моля изберете само един запис за редактиране!")
    } else if (allEl.length === 0) {
        alert("Моля изберете запис за редактиране!")
    } else {
        document.getElementById("add-modal").style.display = 'flex';

        let trEl = allEl[0].closest('tr');
        const tdElName = trEl.children[0].textContent;
        const tdElFloor = trEl.children[1].textContent;
        const tdElApNumber = trEl.children[2].textContent;
        const tdElLiving = trEl.children[3].textContent;
        const tdElRemaining = trEl.children[4].textContent;
        const tdElChip = trEl.children[5].textContent;


        document.getElementById("apt-name").value = tdElName;
        document.getElementById("apt-floor").value = tdElFloor;
        document.getElementById("apt-number").value = tdElApNumber;
        document.getElementById("apt-people").value = tdElLiving;
        document.getElementById("apt-debt").value = tdElRemaining;
        document.getElementById("apt-chip").value = tdElChip;


        whereObj.par1 = tdElFloor;
        whereObj.par2 = tdElApNumber
        document.getElementById("save-apt").addEventListener("click", editAps);
    }
}

async function editAps() {
    const name = document.getElementById("apt-name").value;
    const floor = document.getElementById("apt-floor").value;
    const number = document.getElementById("apt-number").value;
    const living = document.getElementById("apt-people").value;
    const remaining = document.getElementById("apt-debt").value;
    const chip = document.getElementById("apt-chip").value;
    const token = sessionStorage.getItem('accessToken');

    if (name.length < 1 || floor.length < 1 || number.length < 1 || living.length < 1 || remaining.length < 1 || chip.length < 1) {
        alert("Всички полета са задължителни!")
    } else {
        const apppObj = { name, floor, number, living, remaining, chip, oldFloor: whereObj.par1, oldNumber: whereObj.par2 }

        let resp = await fetch('http://localhost:3000/editAp', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            body: JSON.stringify(apppObj),
        })

        if (resp.status == 403) {
            alert("Изтекла валидност!")
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('userId')
            homePage();
        } else if (resp.status !== 200) {
            alert("Проблем с добавянето!");
        } else if (resp.status === 200) {
            alert("Успешно редактиране!");

            let allEl = document.querySelectorAll(".row-check:checked");
            let trEl = allEl[0].closest('tr');

            const newApName = document.createElement("td");
            newApName.textContent = name;
            const newApFloor = document.createElement("td");
            newApFloor.textContent = floor;
            const newApNumber = document.createElement("td");
            newApNumber.textContent = number;
            const NewApNumPeople = document.createElement("td");
            NewApNumPeople.textContent = living;
            const newApMoney = document.createElement("td");
            newApMoney.textContent = remaining;
            const newApChip = document.createElement("td");
            newApChip.textContent = chip;

            const checkBoxTd = document.createElement("td");
            checkBoxTd.className = 'check-col';
            const checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.className = 'row-check';
            checkBoxTd.appendChild(checkBox);

            let tr = document.createElement("tr");
            tr.appendChild(newApName);
            tr.appendChild(newApFloor);
            tr.appendChild(newApNumber);
            tr.appendChild(NewApNumPeople);
            tr.appendChild(newApMoney);
            tr.appendChild(newApChip);
            tr.appendChild(checkBoxTd);

            tBody.appendChild(tr);

            document.getElementById("apt-name").value = '';
            document.getElementById("apt-floor").value = '';
            document.getElementById("apt-number").value = '';
            document.getElementById("apt-people").value = '';
            document.getElementById("apt-debt").value = '';
            document.getElementById("apt-chip").value = '';

            trEl.remove();
            document.getElementById("add-modal").style.display = "none";
        }
    }
}
//                                      ----APART----                                   \\
//---------------------------------------------------------------------------------------\\
//                                      ----SERVICE----                                   \\
async function services() {
    main.innerHTML = '';
    main.appendChild(serviceDOM);
    tBodySer.innerHTML = '';

    const token = sessionStorage.getItem('accessToken');

    let resp = await fetch("http://localhost:3000/services", {
        method: 'get',
        headers: { 'Content-Type': 'application/json', 'X-Authorization': token }
    })

    if (resp.status == 403) {
        alert("Изтекла валидност!")
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('userId')
        homePage();
    } else if (resp.status != 200) {
        alert("Проблем с взимането на РАЗХОДИТЕ!")
    } else if (resp.status == 200) {

        let data = await resp.json();

        for (const key of data) {
            const name = document.createElement("td");
            name.textContent = key.name;
            const price = document.createElement("td");
            price.textContent = key.price;
            const type = document.createElement("td");
            type.textContent = key.type;
            const date = document.createElement("td");
            let d = new Date(key.date);

            if (d < dateZero) {
                date.textContent = '00-00-0000';
            } else {
                date.textContent = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            }

            const checkBoxTd = document.createElement("td");
            checkBoxTd.className = 'check-col';
            const checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.className = 'row-check';
            checkBoxTd.appendChild(checkBox);

            let tr = document.createElement("tr");
            tr.appendChild(name);
            tr.appendChild(price);
            tr.appendChild(type);
            tr.appendChild(date);
            tr.appendChild(checkBoxTd);



            tBodySer.appendChild(tr);

        }

    }







}

function addSerBlock() {
    document.getElementById("add-modal-Ser").style.display = 'flex';
    document.getElementById("save-ser").addEventListener("click", addSer);
}

async function addSer() {
    const name = document.getElementById("ser-name").value;
    const price = document.getElementById("ser-price").value;
    const type = document.getElementById("ser-type").value;
    const date = document.getElementById("ser-date").value;
    const token = sessionStorage.getItem('accessToken');


    if (price < 0) {
        alert("Сумата не може да бъде отрицателна сума!")
    } else if (name.length < 1 && price.length < 1 && type.length < 1) {
        alert("Всички полета са задължителни!")
    } else if (type == 2 && date.length < 1) {
        alert("При тип 2 трябва да се попълни полето дата!");
    } else {
        const serObj = { name, price, type, date }

        let resp = await fetch("http://localhost:3000/addServices", {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            body: JSON.stringify(serObj),
        })

        if (resp.status == 403) {
            alert("Изтекла валидност!")
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('userId')
            homePage();
        } else if (resp.status !== 200) {
            alert("Проблем с добавянето!");
        } else if (resp.status === 200) {
            alert("Успешно добавяне!");

            const newSerpName = document.createElement("td");
            newSerpName.textContent = name;
            const newSerPrice = document.createElement("td");
            newSerPrice.textContent = price;
            const newSerType = document.createElement("td");
            newSerType.textContent = type;
            const newSerDate = document.createElement("td");
            newSerDate.textContent = date;


            const checkBoxTd = document.createElement("td");
            checkBoxTd.className = 'check-col';
            const checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.className = 'row-check';
            checkBoxTd.appendChild(checkBox);

            let tr = document.createElement("tr");
            tr.appendChild(newSerpName);
            tr.appendChild(newSerPrice);
            tr.appendChild(newSerType);
            tr.appendChild(newSerDate);
            tr.appendChild(checkBoxTd);

            tBodySer.appendChild(tr);



            document.getElementById("ser-name").value = '';
            document.getElementById("ser-price").value = '';
            document.getElementById("ser-type").value = '';
            document.getElementById("ser-date").value = '';

            document.getElementById("add-modal-Ser").style.display = "none";
        }

    }


}

function backBlockSer() {
    document.getElementById("add-modal-Ser").style.display = "none";
}

async function deleteSer() {
    let allEl = document.querySelectorAll(".row-check:checked");
    const token = sessionStorage.getItem('accessToken');


    for (let i = 0; i < allEl.length; i++) {
        let trEl = allEl[i].closest('tr');
        const tdElName = trEl.children[0].textContent;
        const tdElPrice = trEl.children[1].textContent;
        const elObj = { 'name': tdElName, 'price': tdElPrice }

        let resp = await fetch('http://localhost:3000/deleteService', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            body: JSON.stringify(elObj)
        })

        if (resp.status == 403) {
            alert("Изтекла валидност!")
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('userId')
            homePage();
        } else if (resp.status !== 200) {
            alert("Проблем с изтриването!");
        } else if (resp.status === 200) {
            trEl.remove();
        }
    }
}

function editSerBlock() {
    let allEl = document.querySelectorAll(".row-check:checked");

    if (allEl.length > 1) {
        alert("Моля изберете само един запис за редактиране!")
    } else if (allEl.length === 0) {
        alert("Моля изберете запис за редактиране!")
    } else {
        document.getElementById("add-modal-Ser").style.display = 'flex';

        let trEl = allEl[0].closest('tr');
        console.log(trEl.children);
        const tdElName = trEl.children[0].textContent;
        const tdElPrice = trEl.children[1].textContent;
        const tdElType = trEl.children[2].textContent;
        let tdElDate = trEl.children[3].textContent;
        tdElDate = tdElDate.trim().split('-');
        let year = tdElDate[0];
        let month = tdElDate[1].padStart(2, '0');
        let day = tdElDate[2].padStart(2, '0');
        const dateEl = `${year}-${month}-${day}`;



        document.getElementById("ser-name").value = tdElName;
        document.getElementById("ser-price").value = tdElPrice;
        document.getElementById("ser-type").value = tdElType;
        document.getElementById("ser-date").value = dateEl;

        whereObj.par1 = tdElName;
        whereObj.par2 = tdElPrice;
        document.getElementById("save-ser").addEventListener("click", editSer);
    }
}

async function editSer() {
    const name = document.getElementById("ser-name").value;
    const price = document.getElementById("ser-price").value;
    const type = document.getElementById("ser-type").value;
    const date = document.getElementById("ser-date").value;
    const token = sessionStorage.getItem('accessToken');

    if (name.length < 1 || price.length < 1 || type.length < 1) {
        alert("Всички полета без ДАТАТА са задължителни!")
    } else {
        const apppObj = { name, price, type, date, oldName: whereObj.par1, oldPrice: whereObj.par2 }

        let resp = await fetch('http://localhost:3000/editSer', {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            body: JSON.stringify(apppObj),
        })

        if (resp.status == 403) {
            alert("Изтекла валидност!")
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('userId')
            homePage();
        } else if (resp.status !== 200) {
            alert("Проблем с добавянето!");
        } else if (resp.status === 200) {
            alert("Успешно редактиране!");
            let allEl = document.querySelectorAll(".row-check:checked");
            let trEl = allEl[0].closest('tr');

            const newSerpName = document.createElement("td");
            newSerpName.textContent = name;
            const newSerPrice = document.createElement("td");
            newSerPrice.textContent = price;
            const newSerType = document.createElement("td");
            newSerType.textContent = type;
            const newSerDate = document.createElement("td");
            newSerDate.textContent = date;


            const checkBoxTd = document.createElement("td");
            checkBoxTd.className = 'check-col';
            const checkBox = document.createElement("input");
            checkBox.type = "checkbox";
            checkBox.className = 'row-check';
            checkBoxTd.appendChild(checkBox);

            let tr = document.createElement("tr");
            tr.appendChild(newSerpName);
            tr.appendChild(newSerPrice);
            tr.appendChild(newSerType);
            tr.appendChild(newSerDate);
            tr.appendChild(checkBoxTd);

            tBodySer.appendChild(tr);

            document.getElementById("ser-name").value = '';
            document.getElementById("ser-price").value = '';
            document.getElementById("ser-type").value = '';
            document.getElementById("ser-date").value = '';

            trEl.remove();
            document.getElementById("add-modal-Ser").style.display = "none";
        }
    }
}
//                                      ----SERVICE----                                 \\
//---------------------------------------------------------------------------------------\\
//                                       ----TAXES----                                    \\
async function fees() {
    main.innerHTML = '';
    main.appendChild(feesDOM);
    tBodyTax.innerHTML = '';
    const newUrl = url + "/payTaxes";
    const token = sessionStorage.getItem('accessToken');


    let resp = await fetch(newUrl, {
        method: 'get',
        headers: { 'Content-Type': 'application/json', 'X-Authorization': token }
    })

    if (resp.status == 403) {
        alert("Изтекла валидност!")
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('userId')
        homePage();
    } else if (resp.status != 200) {
        alert("Проблем с взимането на РАЗХОДИТЕ!")
    } else if (resp.status == 200) {

        let data = await resp.json()

        for (const key of data) {
            const apName = document.createElement("td");
            apName.textContent = key.apNum;
            const month = document.createElement("td");
            month.textContent = key.month;
            const name = document.createElement("td");
            name.textContent = key.name;
            const godina = document.createElement("td");
            godina.textContent = key.year;
            const price = document.createElement("td");
            price.textContent = key.price;
            const date = document.createElement("td");
            let d = new Date(key.date);

            if (d < dateZero) {
                date.textContent = '00-00-0000';
            } else {
                date.textContent = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
            }

            let tr = document.createElement("tr");
            tr.appendChild(name);
            tr.appendChild(apName);
            tr.appendChild(month);
            tr.appendChild(godina);
            tr.appendChild(price);
            tr.appendChild(date);

            tBodyTax.appendChild(tr);
        }

    }


}

function generateTax() {
    document.getElementById("add-modal-genTax").style.display = 'flex';
    document.getElementById("save-tax").addEventListener("click", addTax);
}

async function addTax() {
    const month = document.getElementById("taxMonth").value;
    const year = document.getElementById("taxYear").value;
    const date = new Date();
    const token = sessionStorage.getItem('accessToken');

    let resp = await fetch("http://localhost:3000/apartaments", {
        method: 'get',
        headers: { 'Content-Type': 'application/json', 'X-Authorization': token }
    })

    if (resp.status == 403) {
        alert("Изтекла валидност!")
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('userId')
        homePage();
    } else if (resp.status !== 200) {
        alert("Проблем с взимането на апартаментите!");
    } else {
        let data = await resp.json();

        for (const key of data) {
            const apNum = key.number;
            let price = 0;

            let resp2 = await fetch("http://localhost:3000/servicesTypeOneTwo", {
                method: 'get',
                headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            })

            let data2 = await resp2.json();
            for (const key2 of data2) {
                if (key2.type === 2) {
                    price += key2.price * key.chip;
                } else if (key2.type === 3) {
                    price += key2.price * key.living;
                } else {
                    price += key2.price;
                }
            }

            console.log(price);
            const autoTaxObj = { apNum, month, year, price, date, pay: 0, type: 1 };

            let resp3 = await fetch("http://localhost:3000/addAutoTax", {
                method: 'post',
                headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
                body: JSON.stringify(autoTaxObj),
            })

            if (resp3.status == 403) {
                alert("Изтекла валидност!")
                sessionStorage.removeItem('accessToken')
                sessionStorage.removeItem('userId')
                homePage();
            } else if (resp3.status != 200) {
                alert("Проблем с вкарването на автоматични такси!")
            } else if (resp3.status == 200) {
                backBlockAutoTax();
            }


        }
    }
}

function backBlockAutoTax() {
    document.getElementById("taxMonth").value = '';
    document.getElementById("taxYear").value = '';
    document.getElementById("add-modal-genTax").style.display = "none";
}

async function payTaxeBlock() {
    document.getElementById("fee-modal").style.display = 'flex';
    document.getElementById("saveTax").addEventListener("click", payTax);
    const token = sessionStorage.getItem('accessToken');

    const newUrl = url + "/apartaments";

    let resp = await fetch(newUrl, {
        method: 'get',
        headers: { 'Content-Type': 'application/json', 'X-Authorization': token }
    })

    if (resp.status == 403) {
        alert("Изтекла валидност!")
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('userId')
        homePage();
    } else if (resp.status != 200) {
        alert("Проблем с взимането на Апартаментите!")
    } else if (resp.status == 200) {

        let data = await resp.json()
        const blockFeeAp = document.getElementById("fee-apartment");
        blockFeeAp.innerHTML = '<option value="">-- Избери апартамент --</option>';

        for (const key of data) {
            const apNumber = document.createElement("option");
            apNumber.textContent = key.name;
            apNumber.value = key.number;


            blockFeeAp.appendChild(apNumber);
        }

    }


    let apNum = '';
    let typeFee = '';

    document.getElementById("fee-apartment").addEventListener("change", async (e) => {
        apNum = e.target.value;
        if (apNum > 0) {
            document.getElementById("fee-type").style.display = 'block';
        } else {
            document.getElementById("fee-type").style.display = 'none';
        }


    });

    document.getElementById("fee-type").addEventListener("change", async (e) => {
        typeFee = e.target.value;

        const newUrl = url + '/taxesForAp';
        const respBody = { apNum, typeFee }

        let resp = await fetch(newUrl, {
            method: 'post',
            headers: { 'Content-Type': 'application/json', 'X-Authorization': token },
            body: JSON.stringify(respBody),
        })

        if (resp.status == 403) {
            alert("Изтекла валидност!")
            sessionStorage.removeItem('accessToken')
            sessionStorage.removeItem('userId')
            homePage();
        } else if (resp.status != 200) {
            alert("Проблем с взимането на такси!")
        } else if (resp.status == 200) {

            let data = await resp.json();
            let data2 = data.taxes
            console.log(data2);

            let tBodyPayTax = document.getElementById("unpaid-fees");
            tBodyPayTax.innerHTML = ""

            for (const key in data2) {
                const apName = document.createElement("td");
                apName.textContent = `Aп. ${key.apNum}`;
                const month = document.createElement("td");
                month.textContent = key.month;
                const godina = document.createElement("td");
                godina.textContent = key.year;
                const price = document.createElement("td");
                price.textContent = key.price;

                let tr = document.createElement("tr");
                tr.appendChild(apName);
                tr.appendChild(month);
                tr.appendChild(godina);
                tr.appendChild(price);

                tBodyTax.appendChild(tr);
            }
        }
    });


}





async function payTax() {

}

//                                       ----TAXES----                                    \\
//-----------------------------------------------------------------------------------------\\
