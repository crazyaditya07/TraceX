import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package,
    CheckCircle2,
    ArrowRightLeft,
    Users,
    Box,
    ChevronRight,
    Activity
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Logic
    useEffect(() => {
        if (isAuthenticated && user) {
            fetchDashboardData();
        }
    }, [isAuthenticated, user]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            let userStats = {
                ownedProducts: 0,
                productsManufactured: 0,
                transfersIn: 0,
                transfersOut: 0
            };

            const walletAddress = user.walletAddress || user.wallet;

            if (walletAddress) {
                const userStatsResponse = await fetch(`${API_URL}/api/stats/${walletAddress}`);
                if (userStatsResponse.ok) {
                    userStats = await userStatsResponse.json();
                }

                const productsResponse = await fetch(`${API_URL}/api/owner/${walletAddress}/products`);
                if (productsResponse.ok) {
                    const userProducts = await productsResponse.json();
                    setProducts(userProducts);
                } else {
                    setProducts([]);
                }
            } else {
                // Email only fallback
                const productsResponse = await fetch(`${API_URL}/api/products?limit=20`);
                if (productsResponse.ok) {
                    const data = await productsResponse.json();
                    setProducts(data.products || []);
                    userStats.ownedProducts = data.total || 0;
                }
            }
            setStats(userStats);

        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // Helper to map product data to ProductCard props
    const mapProduct = (p) => {
        const stageMap = {
            'Manufactured': 'manufactured',
            'InDistribution': 'at_distributor',
            'InRetail': 'at_retailer',
            'Sold': 'sold'
        };

        return {
            id: p._id,
            tokenId: p.productId,
            name: p.name || p.productId,
            description: p.description || `Batch: ${p.batchNumber}`,
            manufacturer: p.manufacturer || 'Unknown',
            currentOwner: p.owner || 'You',
            createdAt: p.timestamp || new Date().toISOString(),
            status: stageMap[p.currentStage] || 'manufactured'
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex justify-center items-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-4 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                Dashboard
                            </h1>
                            <p className="text-gray-400">
                                Welcome back, {user?.name || user?.email || 'User'}!
                            </p>
                        </div>

                        {/* Role Badge */}
                        <div className="flex items-center gap-3">
                            {(user?.roles || [user?.role]).map((role, idx) => (
                                <div key={idx} className={`px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30`}>
                                    <span className={`text-sm font-medium text-indigo-400`}>
                                        {role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <DashboardCard
                        title="Owned Products"
                        value={stats?.ownedProducts || 0}
                        subtitle="In your possession"
                        icon={Package}
                        color="indigo"
                        delay={0}
                    />
                    <DashboardCard
                        title="Manufactured"
                        value={stats?.productsManufactured || 0}
                        subtitle="Total created"
                        icon={Box}
                        color="green"
                        delay={0.1}
                    />
                    <DashboardCard
                        title="Transfers In"
                        value={stats?.transfersIn || 0}
                        subtitle="Received"
                        icon={ArrowRightLeft}
                        color="purple"
                        delay={0.2}
                    />
                    <DashboardCard
                        title="Transfers Out"
                        value={stats?.transfersOut || 0}
                        subtitle="Sent"
                        icon={ArrowRightLeft}
                        color="cyan"
                        delay={0.3}
                    />
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="lg:col-span-3"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white">Your Products</h2>
                            {products.length > 0 && (
                                <Link to="/scan" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1">
                                    Scan Product <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product, index) => (
                                    <ProductCard key={product._id || index} product={mapProduct(product)} index={index} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-gray-400 mb-4">No products found.</p>
                                <div className="flex justify-center gap-4">
                                    {(user?.role === 'MANUFACTURER' || user?.role === 'ADMIN') && (
                                        <Link to="/create-product" className="px-4 py-2 bg-indigo-500 rounded-lg text-white font-medium hover:bg-indigo-600 transition-colors">
                                            Create Product
                                        </Link>
                                    )}
                                    <Link to="/scan" className="px-4 py-2 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors">
                                        Scan Product
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
