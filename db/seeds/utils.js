const db = require("../../db/connection");

const convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

const createRef = (array, property1, property2) => {
  const entries = array.map((obj) => [obj[property1], obj[property2]]);
  return Object.fromEntries(entries);
};

module.exports = {convertTimestampToDate, createRef};