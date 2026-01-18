import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FeatureCard } from '@/components/home/feature-card';
import { KPICard } from '@/components/home/kpi-card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Scan, 
  CreditCard, 
  QrCode,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Star,
  TrendingUp,
  Plus,
  BarChart3,
  ClipboardList
} from 'lucide-react';
import { fetchProducts } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { toast } from '@/hooks/use-toast';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const fadeInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};

const fadeInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
};

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/scan');
    } else {
      navigate('/login');
    }
  };

  const renderActionButtons = () => {
    if (!user) {
      // Not signed in - show Start Shopping and Manage Store
      return (
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="razorpay-gradient text-white hover:opacity-90 transition-all duration-300 px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="px-10 py-6 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate('/staff-dashboard')}
            >
              Manage Store
              <Shield className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      );
    }

    if (user.role === 'customer') {
      // Customer signed in - show Smart Checkout and Meal Planner
      return (
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/scan')}
              size="lg"
              className="razorpay-gradient text-white hover:opacity-90 transition-all duration-300 px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Smart Checkout
              <Scan className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="px-10 py-6 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate('/meal-planner')}
            >
              Meal Planner
              <Plus className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      );
    }

    if (user.role === 'staff') {
      // Staff signed in - show Staff Dashboard and Store Performance Insights
      return (
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => navigate('/staff-dashboard')}
              size="lg"
              className="razorpay-gradient text-white hover:opacity-90 transition-all duration-300 px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Staff Dashboard
              <ClipboardList className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="px-10 py-6 text-lg font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
              onClick={() => navigate('/insights')}
            >
              Store Performance Insights
              <BarChart3 className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      );
    }

    return null;
  };

  const renderFinalCTA = () => {
    if (!user) {
      return (
        <Button
          onClick={() => navigate('/login')}
          size="lg"
          className="razorpay-gradient text-white hover:opacity-90 transition-all duration-300 px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl"
        >
          Get Started Today
          <ArrowRight className="ml-3 h-6 w-6" />
        </Button>
      );
    }

    if (user.role === 'customer') {
      return (
        <Button
          onClick={() => navigate('/scan')}
          size="lg"
          className="razorpay-gradient text-white hover:opacity-90 transition-all duration-300 px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl"
        >
          Start Smart Checkout
          <Scan className="ml-3 h-6 w-6" />
        </Button>
      );
    }

    if (user.role === 'staff') {
      return (
        <Button
          onClick={() => navigate('/staff-dashboard')}
          size="lg"
          className="razorpay-gradient text-white hover:opacity-90 transition-all duration-300 px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl"
        >
          Access Dashboard
          <ClipboardList className="ml-3 h-6 w-6" />
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm">
      {/* Hero Section */}
      <section className="relative py-16 px-4 text-center overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-5"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 text-primary text-sm font-medium mb-2 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 mr-1" />
                Revolutionizing Retail Experience
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div variants={fadeInUp} className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight mt-0">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="block"
                >
                  Scan. Pay. Go.
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  Smart Checkout
                </motion.span>
              </h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-0"
              >
                Skip the queues, scan products instantly, pay securely, and exit with ease. 
                The future of shopping is here.
              </motion.p>
            </motion.div>

            {/* CTA Buttons - Role-based */}
            {renderActionButtons()}

            {/* Floating Animation Element */}
            <motion.div
              className="absolute top-20 right-10 opacity-20"
              animate={{
                y: [-20, 20, -20],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <QrCode className="h-32 w-32 text-primary" />
            </motion.div>

            <motion.div
              className="absolute bottom-20 left-10 opacity-15"
              animate={{
                y: [20, -20, 20],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              <Scan className="h-28 w-28 text-blue-500" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Three simple steps to transform your shopping experience
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={scaleIn}>
              <FeatureCard
                icon={Scan}
                title="Scan Products Effortlessly"
                description="Use your camera to scan product QR codes or enter codes manually. Add items to your cart instantly with smart recognition."
                step="01"
              />
            </motion.div>
            
            <motion.div variants={scaleIn}>
              <FeatureCard
                icon={CreditCard}
                title="Secure & Instant Payments"
                description="Complete your purchase with bank-grade security. Multiple payment options with instant processing and confirmation."
                step="02"
              />
            </motion.div>
            
            <motion.div variants={scaleIn}>
              <FeatureCard
                icon={QrCode}
                title="Quick Exit Verification"
                description="Show your order ID to staff for instant verification and hassle-free store exit. No more waiting in long queues."
                step="03"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Why Choose ScanPay?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Experience the benefits of modern, efficient shopping with measurable results
            </motion.p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInLeft}>
              <KPICard
                icon={Clock}
                title="Average Time Saved Per Checkout"
                value="5.5 Mins"
                description="Streamline your shopping and avoid long queues with our efficient checkout process."
                trend="+23%"
              />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <KPICard
                icon={Users}
                title="Queue Wait Time Reduction"
                value="80%"
                description="Experience dramatically shorter wait times with our smart checkout solution."
                trend="+45%"
              />
            </motion.div>
            
            <motion.div variants={fadeInRight}>
              <KPICard
                icon={ShieldCheck}
                title="Secure Transactions Daily"
                value="100%"
                description="Every transaction is encrypted and secured for your complete peace of mind."
                trend="Secure"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeInLeft} className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Smart Features for 
                <span className="block bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Modern Shopping
                </span>
              </h2>
              
              <div className="space-y-6">
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/20 transition-all duration-300"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Lightning Fast</h3>
                    <p className="text-muted-foreground">Scan and pay in seconds, not minutes</p>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/20 transition-all duration-300"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Loyalty Rewards</h3>
                    <p className="text-muted-foreground">Earn points with every purchase</p>
                  </div>
                </motion.div>
                
                <motion.div
                  whileHover={{ x: 10 }}
                  className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/20 transition-all duration-300"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Smart Analytics</h3>
                    <p className="text-muted-foreground">Track your shopping patterns and savings</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div
              variants={fadeInRight}
              className="relative"
            >
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="bg-gradient-to-br from-primary/10 to-blue-500/10 p-12 rounded-3xl backdrop-blur-sm border border-primary/20"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 mx-auto bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center"
                  >
                    <Scan className="h-12 w-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold">Ready to Scan</h3>
                  <p className="text-muted-foreground">Point, scan, and go!</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Card className="glass-card border-primary/20 overflow-hidden relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5"
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(156, 39, 176, 0.05) 0%, rgba(13, 148, 251, 0.05) 100%)",
                    "linear-gradient(45deg, rgba(13, 148, 251, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)",
                    "linear-gradient(45deg, rgba(156, 39, 176, 0.05) 0%, rgba(13, 148, 251, 0.05) 100%)"
                  ]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <CardContent className="p-16 relative z-10">
                <motion.h2
                  variants={fadeInUp}
                  className="text-4xl md:text-5xl font-bold text-foreground mb-6"
                >
                  Ready to Experience the Future?
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
                >
                  Join thousands of satisfied customers who have already made the switch to smarter, faster shopping.
                </motion.p>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {renderFinalCTA()}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
