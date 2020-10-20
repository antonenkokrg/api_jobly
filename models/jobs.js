const db = require("../db");
const ExpressError = require("../helpers/ExpressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Jobs {
    static async create(data) {

        const exsistCheck = await db.query(
            `SELECT handle 
            FROM companies 
            WHERE handle = $1`,
            [data.comapny_handle]
        );
        if (exsistCheck.rows[0]) {
            throw new ExpressError(
                `There is no company ${data.company_handle}`,
                400
            );
        }
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, title, salary, equity, company_handle`,
            [data.title, data.salary, data.equity, data.company_handle]
        );
        return result.rows[0];
    }

    static async all(data) {
        let baseQuery = "SELECT * FROM jobs";
        let whereExpressions = [];
        let queryValues = [];

        // For each possible search term, add to whereExpressions and
        // queryValues so we can generate the right SQL

        if (data.min_salary) {
            queryValues.push(+data.min_salary);
            whereExpressions.push(`min_salary >= $${queryValues.length}`);
        }

        if (data.max_equity) {
            queryValues.push(+data.max_salary);
            whereExpressions.push(`min_equity >= $${queryValues.length}`);
        }

        if (data.search) {
            queryValues.push(`%${data.search}%`);
            whereExpressions.push(`title ILIKE $${queryValues.length}`);
        }

        if (whereExpressions.length > 0) {
            baseQuery += " WHERE ";
        }

        // Finalize query and return results

        let finalQuery = baseQuery + whereExpressions.join(" AND ");
        const jobsRes = await db.query(finalQuery, queryValues);
        return jobsRes.rows;
    }

    static async get(id) {
        const result = await db.query(
            `SELECT * FROM jobs 
                        WHERE id = $1`, [id]);

        const job = result.rows[0];

        if (!job) {
            throw new ExpressError(`There exists no job '${id}'`, 404);
        }

        const companiesRes = await db.query(
            `SELECT name, num_employees, description, logo_url 
        FROM companies 
        WHERE handle = $1`,
            [job.company_handle]
        );

        job.company = companiesRes.rows[0];

        return job;
    }
    static async update(id, data) {
        let { query, values } = sqlForPartialUpdate("jobs", data, "id", id);

        const result = await db.query(query, values);
        const job = result.rows[0];

        if (!job) {
            throw new ExpressError(`There exists no job '${id}`, 404);
        }

        return job;
    }


    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs 
         WHERE id = $1 
         RETURNING id`,
            [id]);

        if (result.rows.length === 0) {
            throw { message: `There is no job '${handle}`, status: 404 }
        }
    }
}

module.exports = Jobs;