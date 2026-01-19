import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Billing() {
    const { tenant, updateTenant } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [activeTab, setActiveTab] = useState('plans');
    const [billingPeriod, setBillingPeriod] = useState('monthly');
    
    // Plans Data
    const plans = {
        free: {
            name: 'Free',
            price: { monthly: 0, yearly: 0 },
            credits: 100,
            features: [
                '100 messages/month',
                'Basic support',
                '1 user',
                'WhatsApp Web'
            ]
        },
        starter: {
            name: 'Starter',
            price: { monthly: 999, yearly: 9990 },
            credits: 1000,
            popular: false,
            features: [
                '1,000 messages/month',
                'Email support',
                '3 users',
                'Templates',
                'Basic Analytics'
            ]
        },
        professional: {
            name: 'Professional',
            price: { monthly: 2499, yearly: 24990 },
            credits: 5000,
            popular: true,
            features: [
                '5,000 messages/month',
                'Priority support',
                '10 users',
                'Templates',
                'Advanced Analytics',
                'API Access'
            ]
        },
        enterprise: {
            name: 'Enterprise',
            price: { monthly: 4999, yearly: 49990 },
            credits: 15000,
            features: [
                '15,000 messages/month',
                '24/7 support',
                'Unlimited users',
                'All features',
                'Custom integration',
                'Dedicated manager'
            ]
        }
    };

    // Credit Packages
    const creditPacks = [
        { id: 'pack_100', credits: 100, price: 99, perMessage: '₹0.99' },
        { id: 'pack_500', credits: 500, price: 399, perMessage: '₹0.80', savings: '20%' },
        { id: 'pack_1000', credits: 1000, price: 699, perMessage: '₹0.70', popular: true, savings: '30%' },
        { id: 'pack_2500', credits: 2500, price: 1499, perMessage: '₹0.60', savings: '40%' },
        { id: 'pack_5000', credits: 5000, price: 2499, perMessage: '₹0.50', savings: '50%' },
    ];

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => console.log('✅ Razorpay script loaded');
        script.onerror = () => console.error('❌ Failed to load Razorpay');
        document.body.appendChild(script);
        
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        try {
            const response = await api.get('/billing/subscription');
            if (response.data.success) {
                setSubscription(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch billing data:', error);
        }

        try {
            const txResponse = await api.get('/billing/transactions');
            if (txResponse.data.success) {
                setTransactions(txResponse.data.data.transactions || []);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        }

        setLoading(false);
    };

    const upgradePlan = async (planId) => {
        const currentPlan = subscription?.plan || 'free';
        
        if (planId === currentPlan) {
            toast.error('You are already on this plan');
            return;
        }

        const plan = plans[planId];
        const price = billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly;

        // Free plan - direct upgrade
        if (price === 0) {
            setProcessing(true);
            setProcessingId(planId);
            
            try {
                const response = await api.post('/billing/upgrade', { 
                    planId,
                    billingPeriod 
                });
                
                if (response.data.success) {
                    toast.success('✅ Switched to Free plan');
                    
                    setSubscription(prev => ({
                        ...prev,
                        plan: planId,
                        messageCredits: 100
                    }));

                    updateTenant({
                        plan: planId,
                        messageCredits: 100
                    });

                    await fetchBillingData();
                }
            } catch (error) {
                console.error('Downgrade error:', error);
                toast.error('Failed to switch plan');
            } finally {
                setProcessing(false);
                setProcessingId(null);
            }
            return;
        }

        // Paid plan - Razorpay Checkout
        setProcessing(true);
        setProcessingId(planId);

        try {
            // Create order
            const orderRes = await api.post('/billing/create-plan-order', {
                planId,
                billingPeriod
            });

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message);
            }

            const { orderId, amount, keyId, planName } = orderRes.data.data;

            // Check if Razorpay is loaded
            if (!window.Razorpay) {
                toast.error('Payment gateway not loaded. Please refresh the page.');
                setProcessing(false);
                setProcessingId(null);
                return;
            }

            // Razorpay options
            const options = {
                key: keyId,
                amount: amount * 100,
                currency: 'INR',
                name: 'WhatsApp SaaS',
                description: `${planName} Plan - ${billingPeriod}`,
                image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
                order_id: orderId,
                handler: async function(razorpayResponse) {
                    try {
                        // Verify payment
                        const verifyRes = await api.post('/billing/verify-plan-payment', {
                            razorpay_order_id: razorpayResponse.razorpay_order_id,
                            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                            razorpay_signature: razorpayResponse.razorpay_signature,
                            planId: planId,
                            billingPeriod: billingPeriod
                        });
                        
                        if (verifyRes.data.success) {
                            toast.success('🎉 Payment successful! Plan upgraded.');
                            
                            // Update local state
                            setSubscription(prev => ({
                                ...prev,
                                plan: planId,
                                messageCredits: verifyRes.data.data.messageCredits
                            }));

                            updateTenant({
                                plan: planId,
                                messageCredits: verifyRes.data.data.messageCredits
                            });

                            await fetchBillingData();
                        }
                    } catch (error) {
                        toast.error('Payment verification failed');
                        console.error('Verify error:', error);
                    } finally {
                        setProcessing(false);
                        setProcessingId(null);
                    }
                },
                prefill: {
                    name: tenant?.name || '',
                    email: tenant?.email || '',
                },
                theme: {
                    color: '#22c55e'
                },
                modal: {
                    ondismiss: function() {
                        toast.error('Payment cancelled');
                        setProcessing(false);
                        setProcessingId(null);
                    }
                }
            };

            // Open Razorpay
            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function(response) {
                toast.error(`Payment failed: ${response.error.description}`);
                setProcessing(false);
                setProcessingId(null);
            });

            rzp.open();
            
        } catch (error) {
            console.error('Upgrade error:', error);
            toast.error(error.response?.data?.message || 'Failed to create order');
            setProcessing(false);
            setProcessingId(null);
        }
    };

    const buyCredits = async (pack) => {
        setProcessing(true);
        setProcessingId(pack.id);
        
        try {
            // Create order
            const orderRes = await api.post('/billing/create-credits-order', {
                packId: pack.id
            });

            if (!orderRes.data.success) {
                throw new Error(orderRes.data.message);
            }

            const { orderId, amount, keyId, credits } = orderRes.data.data;

            if (!window.Razorpay) {
                toast.error('Payment gateway not loaded. Please refresh.');
                setProcessing(false);
                setProcessingId(null);
                return;
            }

            const options = {
                key: keyId,
                amount: amount * 100,
                currency: 'INR',
                name: 'WhatsApp SaaS',
                description: `${credits.toLocaleString()} Message Credits`,
                image: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
                order_id: orderId,
                handler: async function(razorpayResponse) {
                    try {
                        const verifyRes = await api.post('/billing/verify-credits-payment', {
                            razorpay_order_id: razorpayResponse.razorpay_order_id,
                            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                            razorpay_signature: razorpayResponse.razorpay_signature,
                            packId: pack.id
                        });
                        
                        if (verifyRes.data.success) {
                            toast.success(`🎉 ${credits.toLocaleString()} credits added!`);
                            
                            setSubscription(prev => ({
                                ...prev,
                                messageCredits: verifyRes.data.data.totalCredits
                            }));

                            updateTenant({
                                messageCredits: verifyRes.data.data.totalCredits
                            });

                            await fetchBillingData();
                        }
                    } catch (error) {
                        toast.error('Payment verification failed');
                    } finally {
                        setProcessing(false);
                        setProcessingId(null);
                    }
                },
                prefill: {
                    name: tenant?.name || '',
                    email: tenant?.email || '',
                },
                theme: {
                    color: '#22c55e'
                },
                modal: {
                    ondismiss: function() {
                        toast.error('Payment cancelled');
                        setProcessing(false);
                        setProcessingId(null);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            
            rzp.on('payment.failed', function(response) {
                toast.error(`Payment failed: ${response.error.description}`);
                setProcessing(false);
                setProcessingId(null);
            });

            rzp.open();
            
        } catch (error) {
            console.error('Buy credits error:', error);
            toast.error(error.response?.data?.message || 'Failed to buy credits');
            setProcessing(false);
            setProcessingId(null);
        }
    };

    const getPlanPrice = (plan) => {
        return billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading billing information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
                <p className="text-gray-600 mt-1">Manage your plan and purchase message credits</p>
            </div>

            {/* Current Plan Summary */}
            <div className="bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <p className="text-green-100 text-sm">Current Plan</p>
                        <h2 className="text-3xl font-bold capitalize">{subscription?.plan || 'Free'}</h2>
                        {subscription?.subscriptionEndDate && (
                            <p className="text-green-100 text-sm mt-1">
                                Expires: {formatDate(subscription.subscriptionEndDate)}
                            </p>
                        )}
                    </div>
                    <div>
                        <p className="text-green-100 text-sm">Message Credits</p>
                        <h2 className="text-3xl font-bold">
                            {(subscription?.messageCredits || tenant?.messageCredits || 0).toLocaleString()}
                        </h2>
                        <p className="text-green-100 text-sm mt-1">Available to use</p>
                    </div>
                    <div>
                        <p className="text-green-100 text-sm">Total Sent</p>
                        <h2 className="text-3xl font-bold">
                            {(subscription?.totalMessagesSent || tenant?.totalMessagesSent || 0).toLocaleString()}
                        </h2>
                        <p className="text-green-100 text-sm mt-1">All time messages</p>
                    </div>
                    <div className="flex items-center justify-center md:justify-end">
                        <button
                            onClick={() => setActiveTab('credits')}
                            className="bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition shadow-lg"
                        >
                            💳 Buy Credits
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {[
                    { id: 'plans', label: '📦 Plans' },
                    { id: 'credits', label: '💳 Buy Credits' },
                    { id: 'history', label: '📜 History' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 font-medium transition border-b-2 -mb-px ${
                            activeTab === tab.id
                                ? 'border-green-500 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Plans Tab */}
            {activeTab === 'plans' && (
                <div>
                    {/* Billing Toggle */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 p-1.5 rounded-xl inline-flex">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`px-6 py-2.5 rounded-lg font-medium transition ${
                                    billingPeriod === 'monthly'
                                        ? 'bg-white shadow text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingPeriod('yearly')}
                                className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
                                    billingPeriod === 'yearly'
                                        ? 'bg-white shadow text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Yearly
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                    Save 17%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(plans).map(([planId, plan]) => {
                            const isCurrentPlan = (subscription?.plan || 'free') === planId;
                            const price = getPlanPrice(plan);
                            
                            return (
                                <div
                                    key={planId}
                                    className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                                        plan.popular ? 'ring-2 ring-green-500 scale-105' : ''
                                    } ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                                            ⭐ Most Popular
                                        </div>
                                    )}
                                    
                                    {isCurrentPlan && !plan.popular && (
                                        <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                                            ✓ Current Plan
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                        
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold text-gray-900">
                                                {price === 0 ? 'Free' : `₹${price.toLocaleString()}`}
                                            </span>
                                            {price > 0 && (
                                                <span className="text-gray-500">
                                                    /{billingPeriod === 'yearly' ? 'year' : 'month'}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-green-600 font-semibold mt-2">
                                            {plan.credits.toLocaleString()} credits/month
                                        </p>

                                        <ul className="mt-6 space-y-3">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="text-green-500">✓</span>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => upgradePlan(planId)}
                                            disabled={isCurrentPlan || (processing && processingId === planId)}
                                            className={`mt-6 w-full py-3 rounded-xl font-semibold transition ${
                                                isCurrentPlan
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                    : 'bg-green-500 text-white hover:bg-green-600 disabled:opacity-50'
                                            }`}
                                        >
                                            {processing && processingId === planId ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : isCurrentPlan ? (
                                                'Current Plan'
                                            ) : price === 0 ? (
                                                'Downgrade'
                                            ) : (
                                                `Upgrade to ${plan.name}`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Credits Tab */}
            {activeTab === 'credits' && (
                <div>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Buy Message Credits</h2>
                        <p className="text-gray-600 mt-1">Purchase additional credits anytime. No expiry!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {creditPacks.map((pack) => (
                            <div
                                key={pack.id}
                                className={`bg-white rounded-2xl shadow-lg p-6 text-center relative transition-all hover:shadow-xl ${
                                    pack.popular ? 'ring-2 ring-green-500 scale-105' : ''
                                }`}
                            >
                                {pack.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                            BEST VALUE
                                        </span>
                                    </div>
                                )}

                                {pack.savings && (
                                    <div className="absolute -top-2 -right-2">
                                        <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            Save {pack.savings}
                                        </span>
                                    </div>
                                )}

                                <div className="text-4xl mb-2">💬</div>
                                <h3 className="text-3xl font-bold text-gray-900">
                                    {pack.credits.toLocaleString()}
                                </h3>
                                <p className="text-gray-500 text-sm">credits</p>

                                <div className="mt-4">
                                    <span className="text-2xl font-bold text-green-600">₹{pack.price}</span>
                                </div>
                                <p className="text-gray-400 text-xs mt-1">{pack.perMessage}/message</p>

                                <button
                                    onClick={() => buyCredits(pack)}
                                    disabled={processing && processingId === pack.id}
                                    className={`mt-4 w-full py-2.5 rounded-xl font-semibold transition ${
                                        pack.popular
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } disabled:opacity-50`}
                                >
                                    {processing && processingId === pack.id ? 'Processing...' : 'Buy Now'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="font-semibold text-blue-800 mb-2">💡 About Message Credits</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Credits never expire - use them anytime</li>
                            <li>• 1 credit = 1 message (text, image, or document)</li>
                            <li>• Template messages also use 1 credit each</li>
                            <li>• Broadcast messages use 1 credit per recipient</li>
                            <li>• Incoming messages are free</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h3 className="text-lg font-semibold">Transaction History</h3>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <div className="text-5xl mb-4">📭</div>
                            <p className="text-lg font-medium">No transactions yet</p>
                            <p className="text-sm mt-1">Your purchase history will appear here</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((tx, index) => (
                                        <tr key={tx._id || index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {formatDate(tx.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {tx.description || `${tx.credits?.toLocaleString()} Credits`}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₹{tx.amount?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {tx.status === 'completed' && '✓ '}
                                                    {(tx.status || 'completed').charAt(0).toUpperCase() + (tx.status || 'completed').slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Info */}
            <div className="mt-8 text-center border-t pt-6">
                <p className="text-gray-500 text-sm mb-3">🔒 Secure payments powered by</p>
                <img 
                    src="https://razorpay.com/assets/razorpay-logo.svg" 
                    alt="Razorpay" 
                    className="h-8 mx-auto opacity-75"
                />
                <p className="text-xs text-gray-400 mt-3">All transactions are encrypted and secure</p>
            </div>
        </div>
    );
}