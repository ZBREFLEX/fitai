import { Link } from "react-router-dom";

export default function About() {
  const values = [
    {
      icon: "🎯",
      title: "Personalization",
      desc: "Every user gets a customized fitness plan based on their unique body composition and goals.",
    },
    {
      icon: "🤖",
      title: "AI-Powered",
      desc: "Advanced machine learning algorithms provide intelligent guidance and predictions.",
    },
    {
      icon: "📊",
      title: "Data-Driven",
      desc: "Real-time tracking and analytics help you understand your progress and make informed decisions.",
    },
    {
      icon: "🏆",
      title: "Gamification",
      desc: "Stay motivated with badges, achievements, and friendly competitions with other users.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral mb-6">
            About <span className="gradient-text">FitAI Pro</span>
          </h1>
          <p className="text-xl text-neutral text-opacity-80 leading-relaxed">
            Revolutionizing fitness through intelligent technology and personalized guidance
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-neutral mb-6">Our Mission</h2>
            <p className="text-neutral text-opacity-80 mb-4 leading-relaxed">
              We believe that fitness transformation shouldn't be complicated or one-size-fits-all.
              Our mission is to make personalized, AI-driven fitness guidance accessible to everyone.
            </p>
            <p className="text-neutral text-opacity-80 mb-6 leading-relaxed">
              By combining advanced machine learning with proven fitness science, we create
              customized nutrition and workout plans that adapt to your progress in real-time.
            </p>
            <Link to="/signup" className="btn-primary inline-block">
              Start Your Transformation
            </Link>
          </div>
          <div className="bg-secondary rounded-xl p-8 border border-accent border-opacity-20">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-accent mb-3">Transform Today</h3>
            <p className="text-neutral text-opacity-80">
              Join thousands of users who have already achieved their fitness goals with FitAI Pro.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral mb-4">Our Core Values</h2>
            <p className="text-neutral text-opacity-70 max-w-2xl mx-auto">
              These principles guide everything we do at FitAI Pro.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <div
                key={i}
                className="bg-primary rounded-xl p-6 border border-accent border-opacity-10 hover:border-opacity-40 transition-all"
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-neutral mb-2">{value.title}</h3>
                <p className="text-neutral text-opacity-70">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="bg-primary py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-neutral mb-4">Powered by Technology</h2>
            <p className="text-neutral text-opacity-70">
              Our platform uses cutting-edge AI and machine learning algorithms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card-modern">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-bold text-neutral mb-2">ML Algorithms</h3>
              <p className="text-neutral text-opacity-80 text-sm">
                Predictive models for calorie estimation and fitness recommendations
              </p>
            </div>
            <div className="card-modern">
              <div className="text-3xl mb-4">💾</div>
              <h3 className="text-lg font-bold text-neutral mb-2">Big Data</h3>
              <p className="text-neutral text-opacity-80 text-sm">
                Comprehensive food database and fitness metrics for accurate tracking
              </p>
            </div>
            <div className="card-modern">
              <div className="text-3xl mb-4">⚙️</div>
              <h3 className="text-lg font-bold text-neutral mb-2">Real-time Updates</h3>
              <p className="text-neutral text-opacity-80 text-sm">
                Live tracking and instant feedback on your fitness progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent text-primary py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to revolutionize your fitness?
          </h2>
          <p className="text-primary text-opacity-80 mb-8">
            Join FitAI Pro today and start your personalized fitness journey.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-primary text-accent font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </>
  );
}
