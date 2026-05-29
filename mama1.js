const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/invoice_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
    invoiceNo: { type: String, required: true, unique: true },
    invoiceDate: { type: Date, required: true },
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerGSTIN: { type: String, required: true },
    customerState: { type: String, required: true },
    items: [{
        desc: String,
        hsn: String,
        qty: Number,
        rate: Number,
        per: String,
        disc: Number,
        amount: Number,
        taxableValue: Number
    }],
    subtotal: Number,
    cgst: Number,
    sgst: Number,
    totalTax: Number,
    grandTotal: Number,
    createdAt: { type: Date, default: Date.now }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// API Routes

// Get all invoices
app.get('/api/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single invoice
app.get('/api/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new invoice
app.post('/api/invoices', async (req, res) => {
    try {
        const invoiceData = req.body;
        
        // Calculate totals
        let subtotal = 0;
        invoiceData.items.forEach(item => {
            subtotal += item.amount;
        });
        
        const cgst = subtotal * 0.09;
        const sgst = subtotal * 0.09;
        const totalTax = cgst + sgst;
        const grandTotal = subtotal + totalTax;
        
        const invoice = new Invoice({
            ...invoiceData,
            subtotal,
            cgst,
            sgst,
            totalTax,
            grandTotal
        });
        
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update invoice
app.put('/api/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        res.json(invoice);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete invoice
app.delete('/api/invoices/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findByIdAndDelete(req.params.id);
        
        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }
        
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search invoices
app.get('/api/invoices/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const invoices = await Invoice.find({
            $or: [
                { invoiceNo: { $regex: query, $options: 'i' } },
                { customerName: { $regex: query, $options: 'i' } },
                { customerGSTIN: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get invoice statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalInvoices: { $sum: 1 },
                    totalRevenue: { $sum: '$grandTotal' },
                    averageInvoiceValue: { $avg: '$grandTotal' },
                    maxInvoiceValue: { $max: '$grandTotal' },
                    minInvoiceValue: { $min: '$grandTotal' }
                }
            }
        ]);
        
        res.json(stats[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get monthly report
app.get('/api/reports/monthly/:year/:month', async (req, res) => {
    try {
        const year = parseInt(req.params.year);
        const month = parseInt(req.params.month) - 1; // JavaScript months are 0-based
        
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);
        
        const invoices = await Invoice.find({
            invoiceDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ invoiceDate: 1 });
        
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});