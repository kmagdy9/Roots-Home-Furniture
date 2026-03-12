function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function createRowHTML(name = '', desc = '', qty = '1', color = '', price = '', discount = '') {
    return `
        <td data-label="Name"><input type="text" class="name-input" placeholder="Item name..." value="${escapeHTML(name)}"></td>
        <td data-label="Description"><textarea class="desc-input" placeholder="Details...">${escapeHTML(desc)}</textarea></td>
        <td data-label="Qty"><input type="number" class="qty-input" value="${escapeHTML(qty)}" min="1"></td>
        <td data-label="Color"><input type="text" class="color-input" placeholder="Color..." value="${escapeHTML(color)}"></td>
        <td data-label="Price"><input type="number" class="price-input" placeholder="0" value="${escapeHTML(price)}" min="0"></td>
        <td data-label="Discount"><input type="number" class="discount-input" placeholder="0" value="${escapeHTML(discount)}" min="0"></td>
        <td data-label="Total" class="row-total">0</td>
        <td data-label="Action" class="no-print" style="text-align: center;">
            <button class="btn-delete"><i class="ph ph-trash"></i></button>
        </td>
    `;
}

function addRow(name, desc, qty, color, price, discount) {
    const tbody = document.getElementById('tableBody');
    const newRow = document.createElement('tr');
    newRow.style.animation = "fadeIn 0.3s ease-out";
    newRow.innerHTML = createRowHTML(name, desc, qty, color, price, discount);
    tbody.appendChild(newRow);
    calculateTotal(); 
    saveData(); 
}

function deleteRow(btn) {
    const row = btn.closest('tr');
    row.classList.add('row-removing');
    setTimeout(() => {
        row.remove();
        calculateTotal();
        saveData(); 
    }, 300); 
}

function calculateTotal() {
    let subtotal = 0;
    let grandTotal = 0;
    
    const rows = document.querySelectorAll('#tableBody tr');
    
    rows.forEach(row => {
        const qty = Math.max(0, parseFloat(row.querySelector('.qty-input').value) || 0);
        const price = Math.max(0, parseFloat(row.querySelector('.price-input').value) || 0);
        const discount = Math.max(0, parseFloat(row.querySelector('.discount-input').value) || 0);
        
        let rowBeforeDiscount = qty * price;
        let rowAfterDiscount = rowBeforeDiscount - discount;
        
        if (rowAfterDiscount < 0) rowAfterDiscount = 0;
        
        row.querySelector('.row-total').innerText = rowAfterDiscount.toLocaleString('en-US');
        
        subtotal += rowBeforeDiscount;
        grandTotal += rowAfterDiscount;
    });

    document.getElementById('subTotal').innerText = subtotal.toLocaleString('en-US');
    document.getElementById('totalPrice').innerText = grandTotal.toLocaleString('en-US');
}

function saveData() {
    const quotationData = {
        customerName: document.getElementById('customerName').value,
        quoteDate: document.getElementById('quoteDate').value,
        quoteNo: document.getElementById('quoteNo').value,
        customerPhone: document.getElementById('customerPhone').value,
        deliveryDate: document.getElementById('deliveryDate').value,
        items: []
    };

    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach(row => {
        quotationData.items.push({
            name: row.querySelector('.name-input').value,
            desc: row.querySelector('.desc-input').value,
            qty: row.querySelector('.qty-input').value,
            color: row.querySelector('.color-input').value,
            price: row.querySelector('.price-input').value,
            discount: row.querySelector('.discount-input').value
        });
    });

    localStorage.setItem('rootsQuotationData', JSON.stringify(quotationData));
}

function loadData() {
    const savedData = localStorage.getItem('rootsQuotationData');
    const tbody = document.getElementById('tableBody');
    
    if (savedData) {
        const data = JSON.parse(savedData);
        
        document.getElementById('customerName').value = data.customerName || '';
        if (data.quoteDate) document.getElementById('quoteDate').value = data.quoteDate;
        document.getElementById('quoteNo').value = data.quoteNo || '';
        document.getElementById('customerPhone').value = data.customerPhone || '';
        if (data.deliveryDate) document.getElementById('deliveryDate').value = data.deliveryDate;

        if (data.items && data.items.length > 0) {
            tbody.innerHTML = ''; 
            data.items.forEach(item => {
                addRow(item.name, item.desc, item.qty, item.color, item.price, item.discount);
            });
        } else {
            if (tbody.children.length === 0) addRow();
        }
    } else {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('quoteDate').value = today;
        if (tbody.children.length === 0) addRow();
    }
}

function clearData() {
    if(confirm("هل أنت متأكد من مسح جميع البيانات للبدء في كوتيشن جديد؟")) {
        localStorage.removeItem('rootsQuotationData');
        location.reload(); 
    }
}

function showInputError(elementId) {
    const el = document.getElementById(elementId);
    const parentGroup = el.closest('.floating-group');
    const targetEl = parentGroup ? parentGroup : el;

    el.focus();
    targetEl.style.transition = "all 0.3s ease";
    targetEl.style.boxShadow = "0 0 0 3px rgba(231, 76, 60, 0.3)";
    targetEl.style.borderColor = "#e74c3c";
    
    setTimeout(() => {
        targetEl.style.boxShadow = "";
        targetEl.style.borderColor = "transparent";
    }, 2000);
}

// دوال النافذة المنبثقة
function showModal(message) {
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('validationModal').classList.add('active');
}

function closeModal() {
    document.getElementById('validationModal').classList.remove('active');
}

// دالة الطباعة ومراجعة البيانات
function generatePDF() {
    const customerName = document.getElementById('customerName').value.trim();
    const quoteDate = document.getElementById('quoteDate').value;
    const quoteNo = document.getElementById('quoteNo').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const deliveryDate = document.getElementById('deliveryDate').value;
    
    if (customerName === "") {
        showModal("Please fill Client name");
        showInputError('customerName');
        return;
    }

    if (quoteDate === "") {
        showModal("Please fill Date");
        showInputError('quoteDate');
        return;
    }

    if (quoteNo === "") {
        showModal("Please fill Quotation No");
        showInputError('quoteNo');
        return;
    }

    if (customerPhone === "") {
        showModal("Please fill Phone");
        showInputError('customerPhone');
        return;
    }

    if (deliveryDate === "") {
        showModal("Please fill Delivery Date");
        showInputError('deliveryDate');
        return;
    }

    const qDateObj = new Date(quoteDate);
    const dDateObj = new Date(deliveryDate);
    qDateObj.setHours(0,0,0,0);
    dDateObj.setHours(0,0,0,0);

    if (dDateObj < qDateObj) {
        showModal("Delivery Date cannot be before Date!");
        showInputError('deliveryDate');
        return;
    }

    const element = document.getElementById('quotation');
    const inputs = element.querySelectorAll('input, textarea');
    const originalStyles = new Map();

    inputs.forEach(input => {
        if(input.tagName === 'TEXTAREA') {
            originalStyles.set(input, input.getAttribute('style'));
            input.innerHTML = escapeHTML(input.value);
            input.style.setProperty('height', 'auto', 'important');
            input.style.setProperty('height', (input.scrollHeight) + 'px', 'important');
        } else {
            input.setAttribute('value', escapeHTML(input.value));
        }
    });

    const originalTitle = document.title;
    document.title = customerName + " - Quotation";

    setTimeout(() => {
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
            inputs.forEach(input => {
                if(input.tagName === 'TEXTAREA') {
                    const originalStyle = originalStyles.get(input);
                    if (originalStyle) {
                        input.setAttribute('style', originalStyle);
                    } else {
                        input.removeAttribute('style');
                    }
                }
            });
        }, 1000);
    }, 300);
}

document.addEventListener("DOMContentLoaded", () => {
    loadData();

    const tbody = document.getElementById('tableBody');
    
    tbody.addEventListener('input', calculateTotal);

    tbody.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            deleteRow(deleteBtn);
        }
    });

    const quotationForm = document.getElementById('quotation');
    quotationForm.addEventListener('input', saveData);
    quotationForm.addEventListener('change', saveData);
});