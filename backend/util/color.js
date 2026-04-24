const db = require("../config/db");

exports.getOrCreateColorId = async (color) => {
  if (!color) throw new Error("Color is required");

  const normalized = color.trim().toLowerCase();

  const [rows] = await db.promise().query(
    `SELECT color_id FROM colors WHERE LOWER(TRIM(color_name)) = ? LIMIT 1`,
    [normalized]
  );

  if (rows.length > 0) {
    return rows[0].color_id;
  }

  const [result] = await db.promise().query(
    `INSERT INTO colors (color_name) VALUES (?)`,
    [color.trim()]
  );

  return result.insertId;
};