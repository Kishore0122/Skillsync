import React from 'react';
import { useParams } from 'react-router-dom';

const ChallengeDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">
            Challenge Detail - {id}
          </h1>
          <p className="text-secondary-600">
            Challenge detail page is under development. This will show challenge description,
            requirements, submission guidelines, leaderboard, and participant submissions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
