"use strict";

// TODO: Discover what the pg library returns when that field type is queried,
// and form a theory on why. Be prepared to discuss this during code reviews.

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilter } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {

  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   * */
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(`
              INSERT INTO jobs (title,
                                  salary,
                                  equity,
                                  company_handle)
              VALUES ($1, $2, $3, $4)
              RETURNING
                  id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle
      ],
    );
      //FIXME: make sure we a company exist before inserting job
    const job = result.rows[0];
    return job;
  }

  /** Find all jobs, with an optional filter eg { minSalary: 10 }
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll(filterParams) {
    const { whereClause, values } = sqlForFilter(filterParams || {});
// TODO: return a company name
    const jobsRes = await db.query(`
        SELECT id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"
        FROM jobs
        ${whereClause}
        ORDER BY id DESC`, values);
    return jobsRes.rows;
  }

  /** Given a job id, return data about the job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/
  static async get(id) {
  // TODO: return a company object
    const jobRes = await db.query(`
        SELECT id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle"
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
          id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/
  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);
  }
}


module.exports = Job;