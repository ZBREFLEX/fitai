import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Brain, TrendingUp, Utensils, Dumbbell, Award, Activity, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/theme-context';

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full"
          style={{
            background: theme === 'dark' 
              ? 'radial-gradient(circle, rgba(160,160,160,0.4) 0%, rgba(160,160,160,0.2) 50%, transparent 100%)'
              : 'radial-gradient(circle, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 150, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
              : 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.03) 50%, transparent 100%)',
            filter: 'blur(70px)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(96,96,96,0.35) 0%, rgba(96,96,96,0.15) 50%, transparent 100%)'
              : 'radial-gradient(circle, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 50%, transparent 100%)',
            filter: 'blur(55px)',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle, rgba(200,200,200,0.2) 0%, rgba(200,200,200,0.08) 50%, transparent 100%)'
              : 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 50%, transparent 100%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-border relative z-10 backdrop-blur-sm bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-lg sm:text-xl font-bold">AI FitGuide</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <a href="#features" className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base">Features</a>
            <a href="#how-it-works" className="hidden sm:inline text-muted-foreground hover:text-foreground transition-colors text-sm md:text-base">How It Works</a>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="border-border"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/contact')}
              className="hidden sm:inline-flex border-border hover:bg-secondary"
            >
              Contact
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="border-border hover:bg-secondary"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Sign Up
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Your Personalized AI-Powered
            <br />
            <span className="text-muted-foreground">Fitness & Nutrition Guide</span>
          </motion.h1>
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Leverage machine learning algorithms to receive customized meal plans, 
            workout routines, and real-time progress tracking tailored to your unique goals.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
            >
              Get Started Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-border hover:bg-secondary px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
            >
              Sign In
            </Button>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto mt-12 sm:mt-24 px-4">
          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border backdrop-blur-sm relative overflow-hidden group"
            whileHover={{ scale: 1.05, borderColor: 'var(--color-muted)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="text-3xl sm:text-4xl font-bold mb-2">95%</div>
              <div className="text-muted-foreground text-sm sm:text-base">Accuracy Rate</div>
            </div>
          </motion.div>
          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border backdrop-blur-sm relative overflow-hidden group"
            whileHover={{ scale: 1.05, borderColor: 'var(--color-muted)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="text-3xl sm:text-4xl font-bold mb-2">10K+</div>
              <div className="text-muted-foreground text-sm sm:text-base">Active Users</div>
            </div>
          </motion.div>
          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border backdrop-blur-sm relative overflow-hidden group"
            whileHover={{ scale: 1.05, borderColor: 'var(--color-muted)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="text-3xl sm:text-4xl font-bold mb-2">24/7</div>
              <div className="text-muted-foreground text-sm sm:text-base">AI Support</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Intelligent Features</h2>
          <p className="text-lg sm:text-xl text-muted-foreground px-4">Powered by advanced machine learning algorithms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border hover:border-muted transition-all relative overflow-hidden group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-card rounded-lg flex items-center justify-center mb-6">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Personalized Nutrition</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                ML-based calorie estimation and rule-based meal planning customized to your metabolic needs and dietary preferences.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border hover:border-muted transition-all relative overflow-hidden group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-card rounded-lg flex items-center justify-center mb-6">
                <Dumbbell className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Adaptive Workouts</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Intelligent fitness guidance that adapts to your activity level and adjusts workout intensity dynamically.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border hover:border-muted transition-all relative overflow-hidden group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-card rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Progress Tracking</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Real-time monitoring of weight changes, workout completion, and diet consistency with predictive analytics.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border hover:border-muted transition-all relative overflow-hidden group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-card rounded-lg flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Body Composition AI</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Calculate BMI, estimate body fat percentage, and analyze lean body mass for comprehensive insights.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border hover:border-muted transition-all relative overflow-hidden group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-card rounded-lg flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Gamification</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Earn points, unlock badges, and reach achievement levels with our motivational reward system.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-card to-background p-6 sm:p-8 rounded-lg border border-border hover:border-muted transition-all relative overflow-hidden group"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-card rounded-lg flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Data-Driven Insights</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Visualize trends, analyze patterns, and receive predictive recommendations based on your historical data.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg sm:text-xl text-muted-foreground px-4">Simple steps to transform your fitness journey</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {[
            { num: 1, title: 'Input Your Data', desc: 'Provide basic information like age, height, weight, and fitness goals' },
            { num: 2, title: 'AI Analysis', desc: 'Our ML models analyze your data and calculate personalized metrics' },
            { num: 3, title: 'Get Your Plan', desc: 'Receive customized nutrition and workout recommendations' },
            { num: 4, title: 'Track Progress', desc: 'Monitor your journey with real-time analytics and insights' }
          ].map((step, index) => (
            <motion.div 
              key={step.num}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.div 
                className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-secondary to-card rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 border border-muted"
                whileHover={{ scale: 1.1, borderColor: 'var(--color-primary)' }}
                transition={{ duration: 0.3 }}
              >
                {step.num}
              </motion.div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm px-2">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 relative z-10">
        <motion.div 
          className="bg-gradient-to-br from-card to-background rounded-2xl border border-border p-8 sm:p-12 md:p-16 text-center relative overflow-hidden"
          whileHover={{ borderColor: 'var(--color-muted)' }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to Transform Your Fitness?</h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Join thousands of users who have achieved their fitness goals with AI-powered guidance
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg"
            >
              Get Started Now
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-12 sm:mt-16 md:mt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="font-bold text-sm sm:text-base">AI FitGuide</span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Powered by machine learning to help you achieve your fitness goals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-muted-foreground text-xs sm:text-sm">
            © 2026 AI FitGuide. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}