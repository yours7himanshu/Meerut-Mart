// TransactionReceipt.jsx
import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const TransactionReceipt = () => {
  const location = useLocation();
  const { order } = location.state || {};
  const receiptRef = useRef(null);

  const downloadReceipt = () => {
    if (!receiptRef.current) return;
    html2canvas(receiptRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      
      pdf.save(`receipt_${order?.orderId || 'transaction'}.pdf`);
    });
  };

  if (!order) {
    return <div>No order data available.</div>;
  }

  return (
    <div className="p-8">
      <div ref={receiptRef} className="max-w-2xl mx-auto border p-4">
        <h1 className="text-2xl font-bold mb-4">Transaction Receipt</h1>
        <p><strong>Order ID:</strong> {order.orderId}</p>
        <p>
          <strong>Name:</strong> {order.address.firstName} {order.address.lastName}
        </p>
        <p>
          <strong>Email:</strong> {order.address.email}
        </p>
        <p>
          <strong>Phone:</strong> {order.address.phone}
        </p>
        <h2 className="text-xl mt-4">Shipping Address</h2>
        <p>
          {order.address.street}, {order.address.city}, {order.address.state},{' '}
          {order.address.zipcode}, {order.address.country}
        </p>
        <h2 className="text-xl mt-4">Order Details</h2>
        <ul className="list-disc ml-5">
          {order.items && order.items.map((item, index) => (
            <li key={index}>
              {item.name} – Size: {item.size} – Quantity: {item.quantity} – Price: {item.currency || '₹'}{item.price}
            </li>
          ))}
        </ul>
        <h2 className="text-xl mt-4">
          Total Amount: {order.currency || '₹'}{order.amount}
        </h2>
      </div>
      <div className="mt-4 text-center">
        <button
          onClick={downloadReceipt}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Download Receipt
        </button>
      </div>
    </div>
  );
};

export default TransactionReceipt;
