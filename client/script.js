
var params;
function getCustomers() {
    fetch('http://localhost:3000/customers')
    .then(response => response.json())
    .then(data => {
      let customers = data.customers;
      let ct = document.getElementById('customersTable');
        for( let i = 0; i < customers.length; i++) {
            let newRow = ct.insertRow(i+1);
            let nameCell = newRow.insertCell(0);
            let actionCell = newRow.insertCell(1);
            nameCell.innerHTML = customers[i].name;
            actionCell.innerHTML = `
                <button onclick="goToView(${customers[i].id})">View</button>
            `
        }
    });
}
function goToView (customerId) {
    window.location.href = '/details?id='+customerId
}

function getCustomerDetails () {
    const urlSearchParams = new URLSearchParams(window.location.search);
    params = Object.fromEntries(urlSearchParams.entries());
    if(typeof params.id === 'undefined') {
        window.location.href = "/";
    } else {
        // call api to fetch contact details
        fetch('http://localhost:3000/customers/'+params.id)
        .then(response => response.json())
        .then(data => {
            console.log('customer here is ', data.customer[0]);
            document.getElementById('customerName').innerHTML = data.customer[0].name;
            document.getElementById('cName').innerHTML = data.customer[0].name+"'s Profile";
            document.getElementById('customerAge').innerHTML = data.customer[0].age;
            document.getElementById('customerBalance').innerHTML = data.customer[0].amount;
            document.getElementById('customerEmail').innerHTML = data.customer[0].email;
        });

        fetch('http://localhost:3000/customers')
        .then(response => response.json())
        .then(data => {
            let dataList = document.getElementById('toContact');
            dataList.innerHTML += `<option value=""> Select contact </option>`;
            for(let i = 0 ; i < data.customers.length; i++) {
                if(params.id != data.customers[i].id)
                    dataList.innerHTML += `<option value="${data.customers[i].id}"> ${data.customers[i].name}</option>`
            }
        });
    }
}

function transferAmount() {
    let transferToContact = document.getElementById('toContact').value;
    let transferAmount = document.getElementById('transferAmount').value;
    if(transferAmount && transferToContact) {
        // call api to transfer the amount
        fetch('http://localhost:3000/transfer', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromid: params.id,
                toid: document.getElementById('toContact').value,
                amount: transferAmount
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.error) {
                alert(data.message);
            } else {
                window.location.href = '/';
                setTimeout(() => {
                    alert(data.message);
                }, 2000);   
            }
        });
    } else {
        alert('Please provide Contact and Amount to transfer!!');
    }
}