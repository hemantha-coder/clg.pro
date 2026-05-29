let goodsItems = [];

// Add goods to the list
function addGoods() {
    const desc = document.getElementById('goodsDesc').value;
    const hsn = document.getElementById('hsnCode').value;
    const qty = parseInt(document.getElementById('quantity').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) || 0;
    const per = document.getElementById('per').value;
    const disc = parseFloat(document.getElementById('discount').value) || 0;
    
    if (!desc || !hsn || qty <= 0 || rate <= 0) {
        alert('Please fill all fields correctly');
        return;
    }
    
    const amount = qty * rate;
    const discountAmount = (amount * disc) / 100;
    const finalAmount = amount - discountAmount;
    
    const item = {
        slNo: goodsItems.length + 1,
        desc: desc,
        hsn: hsn,
        qty: qty,
        rate: rate,
        per: per,
        disc: disc,
        amount: finalAmount,
        taxableValue: finalAmount
    };
    
    goodsItems.push(item);
    updateGoodsTable();
    clearGoodsForm();
    calculateTotal();
}

// Clear goods form
function clearGoodsForm() {
    document.getElementById('goodsDesc').value = '';
    document.getElementById('hsnCode').value = '';
    document.getElementById('quantity').value = '1';
    document.getElementById('rate').value = '500';
    document.getElementById('discount').value = '0';
}

// Update goods table
function updateGoodsTable() {
    const tbody = document.getElementById('goodsBody');
    tbody.innerHTML = '';
    
    goodsItems.forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.desc}</td>
            <td>${item.hsn}</td>
            <td>${item.qty}</td>
            <td>${item.rate.toFixed(2)}</td>
            <td>${item.per}</td>
            <td>${item.disc}%</td>
            <td>${item.amount.toFixed(2)}</td>
            <td><button class="delete-btn" onclick="deleteItem(${index})">Delete</button></td>
        `;
    });
}

// Delete item
function deleteItem(index) {
    goodsItems.splice(index, 1);
    updateGoodsTable();
    calculateTotal();
}

// Calculate total and tax
function calculateTotal() {
    let subtotal = 0;
    let taxableValue = 0;
    
    goodsItems.forEach(item => {
        subtotal += item.amount;
        taxableValue += item.taxableValue;
    });
    
    // Calculate tax (9% CGST + 9% SGST)
    const cgst = taxableValue * 0.09;
    const sgst = taxableValue * 0.09;
    const totalTax = cgst + sgst;
    const grandTotal = taxableValue + totalTax;
    
    updatePreview(subtotal, cgst, sgst, totalTax, grandTotal);
}

// Update invoice preview
function updatePreview(subtotal, cgst, sgst, totalTax, grandTotal) {
    // Update customer details
    document.getElementById('previewCustomerName').textContent = 
        document.getElementById('customerName').value || 'Kiran Enterprises';
    document.getElementById('previewCustomerAddress').textContent = 
        document.getElementById('customerAddress').value || '12th Cross, HSR Layout';
    document.getElementById('previewCustomerGSTIN').textContent = 
        document.getElementById('customerGSTIN').value || '29AAFFC8126N1ZZ';
    document.getElementById('previewCustomerState').textContent = 
        document.getElementById('customerState').value || 'Karnataka, Code: 29';
    
    // Update invoice details
    document.getElementById('previewInvoiceNo').textContent = 
        document.getElementById('invoiceNo').value || 'SHB/456/20';
    
    const invoiceDate = new Date(document.getElementById('invoiceDate').value);
    document.getElementById('previewInvoiceDate').textContent = 
        invoiceDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
    
    // Update items preview
    const previewItems = document.getElementById('previewItems');
    previewItems.innerHTML = '';
    
    goodsItems.forEach((item, index) => {
        const row = previewItems.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.desc}</td>
            <td>${item.hsn}</td>
            <td>${item.qty}</td>
            <td>${item.rate.toFixed(2)}</td>
            <td>${item.per}</td>
            <td>${item.disc}%</td>
            <td>${item.amount.toFixed(2)}</td>
        `;
    });
    
    // Update tax table
    const previewTax = document.getElementById('previewTax');
    previewTax.innerHTML = '';
    
    goodsItems.forEach(item => {
        const row = previewTax.insertRow();
        row.innerHTML = `
            <td>${item.hsn}</td>
            <td>${item.taxableValue.toFixed(2)}</td>
            <td>9% ${(item.taxableValue * 0.09).toFixed(2)}</td>
            <td>9% ${(item.taxableValue * 0.09).toFixed(2)}</td>
            <td>${(item.taxableValue * 0.18).toFixed(2)}</td>
        `;
    });
    
    // Add total row
    const totalRow = previewTax.insertRow();
    totalRow.style.fontWeight = 'bold';
    totalRow.style.background = '#e8f4fd';
    totalRow.innerHTML = `
        <td><strong>Total</strong></td>
        <td>${subtotal.toFixed(2)}</td>
        <td>9% ${cgst.toFixed(2)}</td>
        <td>9% ${sgst.toFixed(2)}</td>
        <td>${totalTax.toFixed(2)}</td>
    `;
    
    // Update amount in words
    document.getElementById('amountInWords').textContent = 
        `Indian Rupee ${numberToWords(grandTotal)} Only`;
    document.getElementById('taxAmountWords').textContent = 
        `Indian Rupee ${numberToWords(totalTax)} Only`;
}

// Convert number to words (simplified version)
function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const numStr = num.toFixed(2).toString();
    const [whole, decimal] = numStr.split('.');
    
    const convertWhole = (n) => {
        if (n < 20) return ones[parseInt(n)];
        if (n < 100) return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + convertWhole(n % 100);
        if (n < 100000) return convertWhole(Math.floor(n / 1000)) + ' Thousand ' + convertWhole(n % 1000);
        return convertWhole(Math.floor(n / 100000)) + ' Lakh ' + convertWhole(n % 100000);
    };
    
    let result = convertWhole(parseInt(whole));
    if (parseInt(decimal) > 0) {
        result += ' and ' + convertWhole(parseInt(decimal)) + ' Paise';
    }
    
    return result.replace(/\s+/g, ' ').trim();
}

// Download invoice as PDF (simulated)
function downloadInvoice() {
    alert('PDF download functionality will be implemented here');
    // In production, use libraries like jsPDF or html2canvas
}

// Print invoice
function printInvoice() {
    const printContent = document.getElementById('invoicePreview').innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
}

// Save to database (API call)
async function saveToDatabase() {
    const invoiceData = {
        customerName: document.getElementById('customerName').value,
        customerAddress: document.getElementById('customerAddress').value,
        customerGSTIN: document.getElementById('customerGSTIN').value,
        customerState: document.getElementById('customerState').value,
        invoiceNo: document.getElementById('invoiceNo').value,
        invoiceDate: document.getElementById('invoiceDate').value,
        items: goodsItems,
        totalAmount: calculateGrandTotal()
    };
    
    try {
        const response = await fetch('/api/invoices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(invoiceData)
        });
        
        if (response.ok) {
            alert('Invoice saved successfully!');
        } else {
            alert('Error saving invoice');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

// Calculate grand total
function calculateGrandTotal() {
    let taxableValue = 0;
    goodsItems.forEach(item => taxableValue += item.taxableValue);
    return taxableValue + (taxableValue * 0.18);
}

// Initialize with sample data
document.addEventListener('DOMContentLoaded', function() {
    // Add sample data
    setTimeout(() => {
        document.getElementById('goodsDesc').value = '12MM';
        document.getElementById('hsnCode').value = '1005';
        document.getElementById('quantity').value = '7';
        document.getElementById('rate').value = '500';
        addGoods();
    }, 100);
});