import { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Leaf, BookOpen, MessageSquare, Download } from 'lucide-react';
import { setOnboardingDone } from '../utils/onboardingStorage';
import './OnboardingOverlay.css';

const steps = [
  {
    title: "Welcome to Kijani Terrascape",
    desc: "Your digital learning journey starts here. Let's take a quick tour to help you navigate the platform.",
    icon: Leaf
  },
  {
    title: "Interactive Modules",
    desc: "Complete all 6 modules sequentially. Each includes readings, videos, interactive scenarios, and a required quiz.",
    icon: BookOpen
  },
  {
    title: "Community Forum",
    desc: "Share reflections and discuss conservation challenges with your peers across Africa. Participation is key!",
    icon: MessageSquare
  },
  {
    title: "Offline Learning",
    desc: "Low bandwidth? No problem. Use the Offline Hub to download PDF materials and video transcripts to read later.",
    icon: Download
  }
];

export default function OnboardingOverlay({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setOnboardingDone();
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="onboarding-overlay-backdrop">
      <div className="onboarding-modal card">
        <div className="onboarding-progress">
          {steps.map((_, i) => (
            <div key={i} className={`onboarding-dot ${i === currentStep ? 'active' : i < currentStep ? 'completed' : ''}`} />
          ))}
        </div>
        
        <div className="onboarding-content">
          <div className="onboarding-icon-wrap">
            <StepIcon size={32} color="var(--k-600)" />
          </div>
          <h2>{steps[currentStep].title}</h2>
          <p>{steps[currentStep].desc}</p>
        </div>

        <div className="onboarding-actions">
          <button 
            className="btn btn-ghost" 
            onClick={() => {
              if (currentStep === 0) {
                setOnboardingDone();
                onComplete();
              } else prevStep();
            }}
          >
            {currentStep === 0 ? "Skip Tour" : <><ArrowLeft size={16} style={{ marginRight: 4 }} /> Back</>}
          </button>
          
          <button className="btn btn-primary" onClick={nextStep}>
            {currentStep === steps.length - 1 ? (
              <>Get Started <Check size={16} style={{ marginLeft: 4 }} /></>
            ) : (
              <>Next <ArrowRight size={16} style={{ marginLeft: 4 }} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
