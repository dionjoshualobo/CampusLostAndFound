import { useState, useEffect } from 'react';
import { getItemComments, addComment, deleteComment } from '../api';
import { formatDate } from '../utils/dateUtils';

const CommentSection = ({ itemId, isAuthenticated }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
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
    
    setIsSubmitting(true);
    try {
      const response = await addComment({
        itemId,
        content: newComment
      });
      
      setComments([response.data, ...comments]);
      setNewComment('');
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
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
  
  if (isLoading) return (
    <div className="flex items-center justify-center p-4">
      <span className="loading loading-spinner loading-md"></span>
      <span className="ml-2">Loading comments...</span>
    </div>
  );
  
  return (
    <div className="comment-section mt-8 space-y-4">
      <h4 className="text-xl font-bold">Comments</h4>
      
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="form-control">
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="card-actions justify-end">
              <button
                type="submit"
                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      )}
      
      {comments.length === 0 ? (
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No comments yet.</span>
        </div>
      ) : (
        <div className="comment-list space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="font-semibold text-base-content">
                        {comment.userName}
                      </h6>
                      <small className="text-base-content/60">
                        {formatDate(comment.createdAt, true)}
                      </small>
                    </div>
                    <p className="text-base-content/80">{comment.content}</p>
                  </div>
                </div>
                {user.id === comment.userId && (
                  <div className="card-actions justify-end">
                    <button
                      className="btn btn-outline btn-error btn-sm"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
