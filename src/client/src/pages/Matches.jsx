import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMatches, dismissMatch, contactMatch } from '../api';
import ContactInfoModal from '../components/ContactInfoModal';
import { formatDate } from '../utils/dateUtils';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const fetchMatches = async () => {
    try {
      setIsLoading(true);
      const response = await getMatches();
      setMatches(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to load matches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDismiss = async (matchId) => {
    try {
      await dismissMatch(matchId);
      setMatches(matches.filter(m => m.id !== matchId));
    } catch (err) {
      console.error('Error dismissing match:', err);
    }
  };

  const handleContact = async (match) => {
    try {
      const response = await contactMatch(match.id);
      if (response.data?.contact) {
        setSelectedContact(response.data.contact);
        setShowContactModal(true);
        // Update match status locally
        setMatches(matches.map(m =>
          m.id === match.id ? { ...m, status: 'contacted' } : m
        ));
      }
    } catch (err) {
      console.error('Error contacting match:', err);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'secondary';
  };

  const getMatchDetails = (match) => {
    const details = match.match_details || {};
    const items = [];

    if (details.locationScore !== undefined) {
      items.push(`Location: ${details.locationScore}%`);
    }
    if (details.dateScore !== undefined) {
      items.push(`Date: ${details.dateScore}%`);
    }
    if (details.keywordScore !== undefined) {
      items.push(`Keywords: ${details.keywordScore}%`);
    }
    if (details.matchingKeywords?.length > 0) {
      items.push(`Matching words: ${details.matchingKeywords.slice(0, 5).join(', ')}`);
    }

    return items;
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Potential Matches</h1>
        <span className="badge bg-primary rounded-pill">{matches.length} matches</span>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-search display-1 text-muted"></i>
          <h3 className="mt-3">No Matches Yet</h3>
          <p className="text-muted">
            When you report a lost or found item, we'll automatically search for potential matches
            and notify you here.
          </p>
          <Link to="/items/new" className="btn btn-primary mt-2">
            Report an Item
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {matches.map(match => {
            const lostItem = match.lost_item;
            const foundItem = match.found_item;

            return (
              <div key={match.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <span className={`badge bg-${getScoreColor(match.match_score)} fs-6`}>
                      {match.match_score}% Match
                    </span>
                    <small className="text-muted">
                      {formatDate(match.createdat)}
                    </small>
                  </div>

                  <div className="card-body">
                    {/* Lost Item */}
                    <div className="mb-3">
                      <span className="badge bg-danger mb-1">Lost</span>
                      <h6 className="mb-1">{lostItem?.title}</h6>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-geo-alt"></i> {lostItem?.location}
                      </p>
                    </div>

                    {/* Found Item */}
                    <div className="mb-3">
                      <span className="badge bg-success mb-1">Found</span>
                      <h6 className="mb-1">{foundItem?.title}</h6>
                      <p className="text-muted small mb-0">
                        <i className="bi bi-geo-alt"></i> {foundItem?.location}
                      </p>
                    </div>

                    {/* Match Details */}
                    <div className="bg-light rounded p-2 mb-3">
                      <small className="text-muted d-block mb-1">Match breakdown:</small>
                      {getMatchDetails(match).map((detail, i) => (
                        <small key={i} className="d-block">{detail}</small>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2">
                      {match.status !== 'contacted' && (
                        <>
                          <button
                            className="btn btn-primary btn-sm flex-grow-1"
                            onClick={() => handleContact(match)}
                          >
                            <i className="bi bi-envelope me-1"></i>
                            Contact
                          </button>
                          <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleDismiss(match.id)}
                            title="Dismiss match"
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </>
                      )}
                      {match.status === 'contacted' && (
                        <span className="badge bg-success w-100 py-2">
                          <i className="bi bi-check-circle me-1"></i>
                          Contacted
                        </span>
                      )}
                    </div>

                    {/* View Items Links */}
                    <div className="mt-2 pt-2 border-top">
                      <small>
                        <Link to={`/items/${lostItem?.id}`} className="text-decoration-none me-3">
                          View lost item
                        </Link>
                        <Link to={`/items/${foundItem?.id}`} className="text-decoration-none">
                          View found item
                        </Link>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Modal */}
      {selectedContact && (
        <ContactInfoModal
          userId={null}
          contactData={selectedContact}
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false);
            setSelectedContact(null);
          }}
        />
      )}
    </div>
  );
};

export default Matches;
