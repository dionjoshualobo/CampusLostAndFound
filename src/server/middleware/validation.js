const supabase = require('../config/db');

const validateItemReport = async (req, res, next) => {
  const { title, description, status, location, dateLost, categoryId } = req.body;
  const missingFields = [];

  // First check if user profile is complete
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('name, usertype, department, semester, contactinfo, profile_completed')
      .eq('id', req.user.id)
      .single();
    
    if (user && !error) {
      // If profile_completed is explicitly true, allow access
      if (user.profile_completed === true) {
        // Profile is marked as complete, continue with validation
      } else {
        // Profile is not complete (false, null, or undefined)
        return res.status(400).json({
          success: false,
          message: 'Profile completion required. Please complete your profile first.',
          requiresProfileCompletion: true
        });
      }
    }
  } catch (err) {
    console.error('Error checking profile completion:', err);
  }

  // Validate required fields
  if (!title || title.trim() === '') {
    missingFields.push('Title');
  }
  if (!description || description.trim() === '') {
    missingFields.push('Description');
  }
  if (!status || status.trim() === '') {
    missingFields.push('Status');
  } else if (!['lost', 'found'].includes(status.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either "lost" or "found"',
      field: 'status'
    });
  }
  if (!location || location.trim() === '') {
    missingFields.push('Location');
  }
  if (!dateLost) {
    missingFields.push('Date');
  }
  if (!categoryId || isNaN(parseInt(categoryId))) {
    missingFields.push('Category');
  }

  // Check if date is valid and not in the future
  if (dateLost) {
    const selectedDate = new Date(dateLost);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today for comparison
    
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date',
        field: 'dateLost'
      });
    }
    
    if (selectedDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Please select a date that is today or earlier. Future dates are not allowed.',
        field: 'dateLost'
      });
    }
  }

  if (missingFields.length > 0) {
    const fieldText = missingFields.length === 1 ? 'field' : 'fields';
    return res.status(400).json({
      success: false,
      message: `Please fill out the following ${fieldText}: ${missingFields.join(', ')}`,
      missingFields: missingFields
    });
  }

  next();
};

module.exports = { validateItemReport };
