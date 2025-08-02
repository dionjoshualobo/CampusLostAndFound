import { useState, useEffect } from 'react';
import { getItemComments, addComment, deleteComment } from '../api';
import { formatDate } from '../utils/dateUtils';
import { isProfileComplete } from '../utils/profileUtils';
import ProfileCompletionModal from './ProfileCompletionModal';

const CommentSection = ({ itemId, isAuthenticated }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getItemComments(itemId);
        setComments(response.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching comments:', err);
        setError('Failed to load comments');
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [itemId]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    // Check profile completion before submitting comment
    if (!isProfileComplete(user)) {
      setShowProfileModal(true);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await addComment({
        itemId,
        content: newComment.trim()
      });
      
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err.response?.data?.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };
  
  if (isLoading) return <div>Loading comments...</div>;
  
  return (
    <>
      <div className="card mt-4">
        <div className="card-body">
          <h4 className="card-title">Comments</h4>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          {isAuthenticated && (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}
          
          {comments.length === 0 ? (
            <div className="alert alert-info">No comments yet.</div>
          ) : (
            <div className="comment-list">
              {comments.map(comment => (
                <div key={comment.id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <h6 className="card-subtitle mb-2 text-muted">
                        {comment.userName}
                      </h6>
                      <small className="text-muted">
                        {formatDate(comment.createdAt, true)}
                      </small>
                    </div>
                    <p className="card-text">{comment.content}</p>
                    {user.id === comment.userId && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(comment.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        actionDescription="add a comment"
      />
    </>
  );
};

export default CommentSection;
