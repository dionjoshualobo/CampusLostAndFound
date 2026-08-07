-- Create item_matches table for automated matching
CREATE TABLE IF NOT EXISTS item_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lost_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  found_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  match_details JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'contacted', 'dismissed')),
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lost_item_id, found_item_id)
);

-- Index for querying matches by user's items
CREATE INDEX IF NOT EXISTS idx_item_matches_lost ON item_matches(lost_item_id);
CREATE INDEX IF NOT EXISTS idx_item_matches_found ON item_matches(found_item_id);
CREATE INDEX IF NOT EXISTS idx_item_matches_status ON item_matches(status);

-- Trigger to update updatedat timestamp
CREATE OR REPLACE FUNCTION update_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedat = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_item_matches_updatedat
  BEFORE UPDATE ON item_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updatedat_column();
