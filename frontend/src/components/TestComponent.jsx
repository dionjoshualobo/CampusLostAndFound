import React from 'react';

const TestComponent = () => {
  return (
    <div className="p-8 bg-base-100 text-base-content">
      <h1 className="text-4xl font-bold text-primary mb-4">Test Daisy UI</h1>
      <p className="text-lg mb-4">This should have proper styling if Daisy UI is working.</p>
      
      <div className="flex gap-4 mb-4">
        <button className="btn btn-primary">Primary Button</button>
        <button className="btn btn-secondary">Secondary Button</button>
        <button className="btn btn-accent">Accent Button</button>
      </div>
      
      <div className="card bg-base-200 shadow-xl p-4 mb-4">
        <h2 className="card-title">Test Card</h2>
        <p>This is a test card to check if Daisy UI styling works.</p>
      </div>
      
      <div className="alert alert-info mb-4">
        <span>This is an info alert.</span>
      </div>
      
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Test Stat</div>
          <div className="stat-value">123</div>
          <div className="stat-desc">This should be styled</div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
