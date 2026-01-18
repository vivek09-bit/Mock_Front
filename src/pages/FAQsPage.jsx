import React, { useState } from 'react';

// Sample FAQ data
const faqData = [
  {
    question: 'What is TeamIgnite?',
    answer:
      'TeamIgnite is an online platform focused on unlocking your future with next-gen learning, offering in-demand skills, top educators, AI-powered insights, and real-world projects.'
  },
  {
    question: 'How do I sign up for the platform?',
    answer:
      'Click the "Sign Up" button at the top right corner and fill in your details to get started. You can also use the "Log In" button if you already have an account.'
  },
  {
    question: 'What kind of courses do you offer?',
    answer:
      'We provide mock tests, typing practice, and a variety of study materials targeting high-demand skills and interdisciplinary projects.'
  },
  {
    question: 'Is there support for students?',
    answer:
      'Yes, students can reach out via the Contact section for dedicated support, guidance, and timely assistance with their learning journey.'
  }
];

// FAQ Accordion Component
const FAQItem = ({ faq, open, onClick }) => (
  <div className="border-b">
    <button
      className="w-full text-left flex justify-between items-center py-4 focus:outline-none"
      onClick={onClick}
    >
      <span className="font-semibold text-lg text-teal-900">{faq.question}</span>
      <span className="ml-4">
        {open ? (
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="3" d="M18 15l-6-6-6 6" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeWidth="3" d="M6 9l6 6 6-6" />
          </svg>
        )}
      </span>
    </button>
    {open && (
      <div className="pb-6 text-gray-600 transition-all duration-200">
        {faq.answer}
      </div>
    )}
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-2xl mx-auto my-12 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-teal-800 mb-8 text-center">
        Frequently Asked Questions
      </h2>
      <div>
        {faqData.map((faq, idx) => (
          <FAQItem
            key={idx}
            faq={faq}
            open={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
