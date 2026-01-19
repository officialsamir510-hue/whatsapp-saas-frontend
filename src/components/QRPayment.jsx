import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function QRPayment({ planId, billingPeriod, onSuccess, onCancel }) {
    const [qrData, setQrData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);

    useEffect(() => {
        createQRCode();
    }, []);

    const createQRCode = async () => {
        try {
            setLoading(true);
            const response = await api.post('/billing/create-qr-payment', {
                planId,
                billingPeriod
            });

            if (response.data.success) {
                setQrData(response.data.data);
                startPaymentCheck(response.data.data.qrCodeId);
            }
        } catch (error) {
            toast.error('Failed to generate QR code');
            onCancel();
        } finally {
            setLoading(false);
        }
    };

    const startPaymentCheck = (qrCodeId) => {
        const interval = setInterval(async () => {
            try {
                setChecking(true);
                const response = await api.get(`/billing/check-qr-payment/${qrCodeId}`);
                
                if (response.data.success && response.data.data.paymentStatus === 'paid') {
                    clearInterval(interval);
                    toast.success('Payment successful! 🎉');
                    onSuccess();
                }
            } catch (error) {
                console.error('Payment check error:', error);
            } finally {
                setChecking(false);
            }
        }, 3000); // Check every 3 seconds

        // Auto cleanup after 15 minutes
        setTimeout(() => {
            clearInterval(interval);
        }, 15 * 60 * 1000);

        return () => clearInterval(interval);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Generating QR Code...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Scan QR to Pay</h2>
                    <p className="text-gray-600 mt-2">
                        {qrData?.planName} Plan - {billingPeriod}
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                        ₹{qrData?.amount?.toLocaleString()}
                    </p>
                </div>

                {/* QR Code */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <img 
                        src={qrData?.qrCodeUrl} 
                        alt="Payment QR Code"
                        className="w-full max-w-xs mx-auto"
                    />
                </div>

                {/* Instructions */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">How to pay:</h3>
                    <ol className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-semibold">1</span>
                            <span>Open any UPI app (Google Pay, PhonePe, Paytm, etc.)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-semibold">2</span>
                            <span>Scan the QR code above</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs font-semibold">3</span>
                            <span>Complete the payment</span>
                        </li>
                    </ol>
                </div>

                {/* Status */}
                {checking && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <p className="text-blue-700 text-sm">Waiting for payment...</p>
                        </div>
                    </div>
                )}

                {/* Timer */}
                {qrData?.expiresAt && (
                    <p className="text-center text-xs text-gray-500 mb-4">
                        QR code expires at {new Date(qrData.expiresAt).toLocaleTimeString()}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={createQRCode}
                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition"
                    >
                        Refresh QR
                    </button>
                </div>
            </div>
        </div>
    );
}