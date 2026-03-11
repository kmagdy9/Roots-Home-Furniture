function addRow() {
    const tbody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');
    newRow.style.animation = "fadeIn 0.3s ease-out";
    newRow.innerHTML = `
        <td data-label="Name"><input type="text" placeholder="Item name..."></td>
        <td data-label="Description"><textarea placeholder="Details..."></textarea></td>
        <td data-label="Qty"><input type="number" class="qty-input" value="1" min="1" onkeyup="calculateTotal()" onchange="calculateTotal()"></td>
        <td data-label="Color"><input type="text" placeholder="Color..."></td>
        <td data-label="Price"><input type="number" class="price-input" placeholder="0" onkeyup="calculateTotal()" onchange="calculateTotal()"></td>
        <td data-label="Discount"><input type="number" class="discount-input" placeholder="0" onkeyup="calculateTotal()" onchange="calculateTotal()"></td>
        <td data-label="Total" class="row-total">0</td>
        <td data-label="Action" class="no-print" style="text-align: center;">
            <button class="btn-delete" onclick="deleteRow(this)"><i class="fas fa-trash"></i></button>
        </td>
    `;
    tbody.appendChild(newRow);
}

function deleteRow(btn) {
    const row = btn.closest('tr');
    row.style.opacity = '0';
    setTimeout(() => {
        row.remove();
        calculateTotal();
    }, 200);
}

function calculateTotal() {
    let subtotal = 0;
    let grandTotal = 0;
    
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const discount = parseFloat(row.querySelector('.discount-input').value) || 0;
        
        let rowBeforeDiscount = qty * price;
        let rowAfterDiscount = rowBeforeDiscount - discount;
        
        if (rowAfterDiscount < 0) rowAfterDiscount = 0;
        
        row.querySelector('.row-total').innerText = rowAfterDiscount;
        
        subtotal += rowBeforeDiscount;
        grandTotal += rowAfterDiscount;
    });

    document.getElementById('subTotal').innerText = subtotal;
    document.getElementById('totalPrice').innerText = grandTotal;
}

function generatePDF() {
    const customerName = document.getElementById('customerName').value.trim();
    const quoteDate = document.getElementById('quoteDate').value;
    const deliveryDate = document.getElementById('deliveryDate').value;
    
    if (customerName === "") {
        alert("⚠️ برجاء إدخال اسم العميل أولاً (Client Name).");
        document.getElementById('customerName').focus();
        return;
    }

    if (deliveryDate === "") {
        alert("⚠️ برجاء تحديد تاريخ التسليم (Delivery Date) في قسم الإجماليات.");
        document.getElementById('deliveryDate').focus();
        return;
    }

    const qDateObj = new Date(quoteDate);
    const dDateObj = new Date(deliveryDate);
    qDateObj.setHours(0,0,0,0);
    dDateObj.setHours(0,0,0,0);

    if (dDateObj < qDateObj) {
        alert("⚠️ عذراً، لا يمكن أن يكون تاريخ التسليم (Delivery Date) قبل تاريخ الكوتيشن (Date)!");
        document.getElementById('deliveryDate').focus();
        return;
    }

    const element = document.getElementById('quotation');
    const inputs = element.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        if(input.tagName === 'TEXTAREA') {
            input.innerHTML = input.value;
            input.style.setProperty('height', 'auto', 'important');
            input.style.setProperty('height', (input.scrollHeight) + 'px', 'important');
        } else {
            input.setAttribute('value', input.value);
        }
    });

    const originalTitle = document.title;
    document.title = customerName + " - Quotation";

    window.print();

    setTimeout(() => {
        document.title = originalTitle;
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
});