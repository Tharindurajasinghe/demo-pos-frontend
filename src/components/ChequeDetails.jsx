import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ChequeDetails = () => {
  const [invoices, setInvoices] = useState([]);
  const [cheques, setCheques] = useState([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showChequeModal, setShowChequeModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [editingCheque, setEditingCheque] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    billDate: '',
    companyName: '',
    items: [{ itemName: '', quantity: 1, pricePerItem: 0 }],
    billAmount: 0
  });

  const [chequeForm, setChequeForm] = useState({
    invoiceNumber: '',
    billingDate: '',
    chequeNumber: '',
    chequeDate: '',
    chequeAmount: 0
  });

  useEffect(() => {
    loadInvoices();
    loadCheques();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await api.getInvoices();
      setInvoices(response.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const loadCheques = async () => {
    try {
      const response = await api.getCheques();
      setCheques(response.data);
    } catch (error) {
      console.error('Error loading cheques:', error);
    }
  };

  // Invoice Functions
  const handleAddInvoice = () => {
  setInvoiceForm({
    invoiceNumber: '',  // ← Empty, user will enter
    billDate: new Date().toISOString().split('T')[0],
    companyName: '',
    items: [{ itemName: '', quantity: 1, pricePerItem: 0 }],
    billAmount: 0
  });
  setEditingInvoice(null);
  setShowInvoiceModal(true);
};

  const handleEditInvoice = (invoice) => {
    setInvoiceForm({
      invoiceNumber: invoice.invoiceNumber,
      billDate: new Date(invoice.billDate).toISOString().split('T')[0],
      companyName: invoice.companyName,
      items: invoice.items.length > 0 ? invoice.items : [{ itemName: '', quantity: 1, pricePerItem: 0 }],
      billAmount: invoice.billAmount
    });
    setEditingInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDeleteInvoice = async (invoiceNumber) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await api.deleteInvoice(invoiceNumber);
      alert('Invoice deleted successfully!');
      loadInvoices();
      loadCheques();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting invoice');
    }
  };

  const calculateInvoiceTotal = () => {
    const total = invoiceForm.items.reduce((sum, item) => {
      return sum + (item.quantity * item.pricePerItem);
    }, 0);
    return total;
  };

  const handleInvoiceItemChange = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = field === 'itemName' ? value : parseFloat(value) || 0;
    newItems[index].total = newItems[index].quantity * newItems[index].pricePerItem;
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { itemName: '', quantity: 1, pricePerItem: 0 }]
    });
  };

  const removeInvoiceItem = (index) => {
    if (invoiceForm.items.length === 1) {
      alert('At least one item is required');
      return;
    }
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();

    if (!invoiceForm.companyName) {
      alert('Please enter company name');
      return;
    }

    const billAmount = calculateInvoiceTotal();

    try {
      const data = {
        ...invoiceForm,
        billAmount
      };

      if (editingInvoice) {
        await api.updateInvoice(invoiceForm.invoiceNumber, data);
        alert('Invoice updated successfully!');
      } else {
        await api.addInvoice(data);
        alert('Invoice added successfully!');
      }

      setShowInvoiceModal(false);
      loadInvoices();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving invoice');
    }
  };

  // Cheque Functions
  const handleAddCheque = () => {
    setChequeForm({
      invoiceNumber: '',
      billingDate: new Date().toISOString().split('T')[0],
      chequeNumber: '',
      chequeDate: '',
      chequeAmount: 0
    });
    setEditingCheque(null);
    setShowChequeModal(true);
  };

  const handleEditCheque = (cheque) => {
    setChequeForm({
      invoiceNumber: cheque.invoiceNumber,
      billingDate: new Date(cheque.billingDate).toISOString().split('T')[0],
      chequeNumber: cheque.chequeNumber,
      chequeDate: new Date(cheque.chequeDate).toISOString().split('T')[0],
      chequeAmount: cheque.chequeAmount
    });
    setEditingCheque(cheque);
    setShowChequeModal(true);
  };

  const handleDeleteCheque = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cheque?')) return;

    try {
      await api.deleteCheque(id);
      alert('Cheque deleted successfully!');
      loadCheques();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting cheque');
    }
  };

  const handleSubmitCheque = async (e) => {
    e.preventDefault();

    if (!chequeForm.invoiceNumber || !chequeForm.chequeNumber) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (editingCheque) {
        await api.updateCheque(editingCheque._id, chequeForm);
        alert('Cheque updated successfully!');
      } else {
        await api.addCheque(chequeForm);
        alert('Cheque added successfully!');
      }

      setShowChequeModal(false);
      loadCheques();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving cheque');
    }
  };

  return (
    <div className="space-y-6">
     {/* Invoices Table - UPDATED with fixed height and scrollbar */}
<div className="bg-white p-6 rounded-lg shadow">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold">Invoice Details</h2>
    <button
      onClick={handleAddInvoice}
      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold"
    >
      + Add Invoice
    </button>
  </div>

  <div className="overflow-x-auto">
    {/* Added max-height and overflow-y-auto */}
    <div className="max-h-[500px] overflow-y-auto">
      <table className="w-full">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left">Bill Date</th>
            <th className="px-4 py-3 text-left">Company Name</th>
            <th className="px-4 py-3 text-left">Invoice Number</th>
            <th className="px-4 py-3 text-left">Items</th>
            <th className="px-4 py-3 text-right">Bill Amount</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(invoice => (
            <tr key={invoice.invoiceNumber} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                {new Date(invoice.billDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 font-semibold">{invoice.companyName}</td>
              <td className="px-4 py-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                  {invoice.invoiceNumber}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm">
                  {invoice.items.map((item, idx) => (
                    <div key={idx}>
                      {item.itemName} ({item.quantity} × Rs.{item.pricePerItem.toFixed(2)})
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-bold">
                Rs. {invoice.billAmount.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditInvoice(invoice)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteInvoice(invoice.invoiceNumber)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {invoices.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        No invoices found
      </div>
    )}
  </div>
</div>

{/* Cheques Table - UPDATED with fixed height and scrollbar */}
<div className="bg-white p-6 rounded-lg shadow">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold">Cheque Details</h2>
    <button
      onClick={handleAddCheque}
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
    >
      + Add Cheque
    </button>
  </div>

  <div className="overflow-x-auto">
    {/* Added max-height and overflow-y-auto */}
    <div className="max-h-[500px] overflow-y-auto">
      <table className="w-full">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            <th className="px-4 py-3 text-left">Billing Date</th>
            <th className="px-4 py-3 text-left">Invoice Number</th>
            <th className="px-4 py-3 text-left">Cheque Number</th>
            <th className="px-4 py-3 text-left">Cheque Date</th>
            <th className="px-4 py-3 text-right">Cheque Amount</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cheques.map(cheque => (
            <tr key={cheque._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                {new Date(cheque.billingDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                  {cheque.invoiceNumber}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold">{cheque.chequeNumber}</td>
              <td className="px-4 py-3">
                {new Date(cheque.chequeDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right font-bold">
                Rs. {cheque.chequeAmount.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCheque(cheque)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCheque(cheque._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {cheques.length === 0 && (
      <div className="text-center py-8 text-gray-500">
        No cheques found
      </div>
    )}
  </div>
</div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}
              </h2>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Invoice Number *</label>
                    <input
                      type="text"
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                      placeholder="Enter invoice number (e.g., INV-001)"
                      className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                     disabled={editingInvoice}  // Disable when editing (can't change invoice number)
                     required
                     />
                   {editingInvoice && (
                   <p className="text-sm text-gray-600 mt-1">Invoice number cannot be changed</p>
                   )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Bill Date *</label>
                  <input
                    type="date"
                    value={invoiceForm.billDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, billDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={invoiceForm.companyName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, companyName: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 font-semibold">Items</label>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Item Name"
                          value={item.itemName}
                          onChange={(e) => handleInvoiceItemChange(index, 'itemName', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleInvoiceItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price"
                          value={item.pricePerItem}
                          onChange={(e) => handleInvoiceItemChange(index, 'pricePerItem', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-span-2 flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          Rs. {(item.quantity * item.pricePerItem).toFixed(2)}
                        </span>
                        {invoiceForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Bill Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rs. {calculateInvoiceTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  {editingInvoice ? 'Update Invoice' : 'Add Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cheque Modal */}
      {showChequeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCheque ? 'Edit Cheque' : 'Add New Cheque'}
              </h2>
              <button
                onClick={() => setShowChequeModal(false)}
                className="text-gray-600 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitCheque} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Invoice Number *</label>
                <select
                  value={chequeForm.invoiceNumber}
                  onChange={(e) => setChequeForm({ ...chequeForm, invoiceNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Select Invoice --</option>
                  {invoices.map(inv => (
                    <option key={inv.invoiceNumber} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} - {inv.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Billing Date *</label>
                <input
                  type="date"
                  value={chequeForm.billingDate}
                  onChange={(e) => setChequeForm({ ...chequeForm, billingDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Cheque Number *</label>
                <input
                  type="text"
                  value={chequeForm.chequeNumber}
                  onChange={(e) => setChequeForm({ ...chequeForm, chequeNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Cheque Date *</label>
                <input
                  type="date"
                  value={chequeForm.chequeDate}
                  onChange={(e) => setChequeForm({ ...chequeForm, chequeDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Cheque Amount (Rs.) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={chequeForm.chequeAmount}
                  onChange={(e) => setChequeForm({ ...chequeForm, chequeAmount: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowChequeModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  {editingCheque ? 'Update Cheque' : 'Add Cheque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChequeDetails;