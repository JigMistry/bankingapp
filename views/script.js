
var params;
var currentCustomer;
var otherCustomers;
var SERVER_API_POINT = 'https://bankingappdemo.herokuapp.com/';
function getCustomers() {
    // Get All Custmers to show on home page
    fetch(SERVER_API_POINT+'customers')
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
    if(typeof params.id === 'undefined' || params.id === '' || isNaN(params.id)) {
        window.location.href = "/";
    } else {
        // Call Api to fetch Current Contact details
        fetch(SERVER_API_POINT+'customers/'+params.id)
        .then(response => response.json())
        .then(data => {
            if (!data.customer[0]) window.location.href = "/";
            currentCustomer = data.customer[0];
            document.getElementById('customerName').innerHTML = data.customer[0].name;
            document.getElementById('cName').innerHTML = data.customer[0].name+"'s Profile";
            document.getElementById('customerAge').innerHTML = data.customer[0].age;
            document.getElementById('customerBalance').innerHTML = '₹ '+data.customer[0].amount;
            document.getElementById('customerEmail').innerHTML = data.customer[0].email;
            // Get Available Customers
            getAvailbleCustmers();
        });
    }
}

function getAvailbleCustmers() {
    fetch(SERVER_API_POINT+'customers')
        .then(response => response.json())
        .then(data => {
            otherCustomers = data.customers;
            let dataList = document.getElementById('toContact');
            dataList.innerHTML = '';
            dataList.innerHTML += `<option value=""> Select contact </option>`;
            for(let i = 0 ; i < data.customers.length; i++) {
                if(params.id != data.customers[i].id)
                    dataList.innerHTML += `<option value="${data.customers[i].id}"> ${data.customers[i].name}</option>`
            }
            // Get Transfer Logs
            getTransferLogs();
        });
}

function getTransferLogs() {
    fetch(SERVER_API_POINT+'transferlogs/'+params.id)
        .then(response => response.json())
        .then(data => {
            let logsTable = document.getElementById('logsTable');
            logsTable.innerHTML = '';
            data.logs = data.logs.reverse();
            for(let i = 0 ; i < data.logs.length; i++) {
                let status = data.logs[i].from_id == params.id ? 'Sent': 'Received';
                let name ;
                if (status === 'Sent') {
                    name = otherCustomers.find((c) => c.id == data.logs[i].to_id).name;
                } else {
                    name = otherCustomers.find((c) => c.id == data.logs[i].from_id).name;
                }

                logsTable.innerHTML += `
                    <div class="row">
                        <div class="${status.toLowerCase()}">${status}</div>
                        <div> ${status === 'Received' ? ' from ': ' to '} ${name}</div>
                        <div>₹ ${data.logs[i].amount}</div>
                        <div>${data.logs[i].created_at || new Date(data.logs[i].created_at).toLocaleString()}</div>
                    </div>`;
            }
        });
}

function transferAmount() {
    let transferToContact = document.getElementById('toContact').value;
    let transferAmount = document.getElementById('transferAmount').value;
    if(transferAmount && transferToContact) {
        // Call Api to transfer the amount
        fetch(SERVER_API_POINT+'transfer', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromid: params.id,
                toid: document.getElementById('toContact').value,
                amount: transferAmount,
                created_at: new Date().toUTCString()
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.error) {
                alert(data.message);
            } else {
                getCustomerDetails();
                document.getElementById('successMsg').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('successMsg').style.display = 'none';
                }, 3000);
            }
        });
    } else {
        alert('Please provide Contact and Amount to transfer!!');
    }
}