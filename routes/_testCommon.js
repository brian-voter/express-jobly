"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const Job = require("../models/job")
const { createToken } = require("../helpers/tokens");

const u1Token = createToken({ username: "u1", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });

const testJobIDs = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.register({
    username: "admin",
    firstName: "admin",
    lastName: "admin",
    email: "admin1@admin.com",
    password: "password",
    isAdmin: true,
  });

  const testJob1 = await Job.create({
    title: "test job title 1",
    salary: 1,
    equity: 0.01,
    companyHandle: "c1"
  });

  testJobIDs.push(testJob1.id);

  const testJob2 = await Job.create({
    title: "test job title 2",
    salary: 2,
    equity: 0.02,
    companyHandle: "c1"
  });

  testJobIDs.push(testJob2.id);

  const testJob3 = await Job.create({
    title: "test job title 3",
    salary: 3,
    equity: 0,
    companyHandle: "c1"
  });

  testJobIDs.push(testJob3.id);

  console.log("END OF COMMON BEFORE ALL")
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testJobIDs
};
