const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


class Companies {
  static async all(data) {
    let baseQuery = `SELECT handle, name FROM companies`;
    let whereExpressions = [];
    let queryValues = [];

    if (+data.min_employees >= +data.max_employees) {
      throw new ExpressError(
        "Min employees must be less than max employees",
        400
      );
    }
    if (data.min_employees) {
      queryValues.push(+data.min_employees);
      whereExpressions.push(`num_employees >= $${queryValues.length}`);
    }

    if (data.max_employees) {
      queryValues.push(+data.max_employees);
      whereExpressions.push(`num_employees <= $${queryValues.length}`);
    }

    if (data.search) {
      queryValues.push(`%${data.search}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      baseQuery += " WHERE ";
    }

    let finalQuery = baseQuery + whereExpressions.join(" AND ") + " ORDER BY name";
    const companiesRes = await db.query(finalQuery, queryValues);
    return companiesRes.rows;
  }

  static async create({ handle, name, num_employees, description, logo_url }) {
    const duplicateCheck = await db.query(
      `SELECT handle 
            FROM companies 
            WHERE handle = $1`,
      [handle]
    );

    if (duplicateCheck.rows[0]) {
      throw new ExpressError(
        `There already exists a company with handle '${handle}`,
        400
      );
    }

    const result = await db.query(
      `INSERT INTO companies (
                    handle, name, num_employees, description, logo_url)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING handle, name, num_employees, description, logo_url`,
      [handle, name, num_employees, description, logo_url]
    );
    return result.rows[0];
  }


  static async get(id) {
    const result = await db.query(
      `SELECT * FROM companies 
                        WHERE handle = $1`, [id]);

    const company = result.rows[0];

    if (!company) {
      throw new ExpressError(`There exists no company '${id}'`, 404);
    }

    const jobsRes = await db.query(
      `SELECT title, salary
        FROM jobs 
        WHERE company_handle = $1`,
      [id]
    );

    company.jobs = jobsRes.rows[0];

    return company;

  }


  static async update(handle, data) {
    let { query, values } = sqlForPartialUpdate(
      "companies",
      data,
      "handle",
      handle
    );

    const result = await db.query(query, values);
    const company = result.rows[0];

    if (!company) {
      throw new ExpressError(`There is no company '${handle}`, 404);
    }

    return company;
  }


  static async remove(handle) {
    const result = await db.query(
      `DELETE FROM companies 
         WHERE handle = $1 
         RETURNING handle`,
      [handle]);

    if (result.rows.length === 0) {
      throw { message: `There is no company '${handle}`, status: 404 }
    }
  }


}

module.exports = Companies;