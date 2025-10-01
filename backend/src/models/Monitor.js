  static findAll(db) {
    try {
      const stmt = db.prepare('SELECT * FROM monitors WHERE is_active = 1 ORDER BY created_at DESC');
      const rows = stmt.all();
      return rows.map(row => this.fromRow(row));
    } catch (error) {
      throw new Error(`Failed to find monitors: ${error.message}`);
    }
  }