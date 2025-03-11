const db = require("../../db/connection");

//Seeding Utils

const convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

const createRef = (array, property1, property2) => {
  const entries = array.map((obj) => [obj[property1], obj[property2]]);
  return Object.fromEntries(entries);
};

const formatData = (dataArray, keys) => {
  return dataArray.map((data) => keys.map((key) => data[key]));
};

const replaceArticleTitleWithId = (dataArray, reference) => {
  return dataArray.map(({article_title, ...rest}) => {
    return {...rest, article_id: reference[article_title]}
  });
}

//Data validation utils

const checkExists = (table, column, value) => {
  return db.query(`SELECT ${column} FROM ${table} WHERE ${column} = $1`, [value])
    .then(({rows}) => {
      if (rows.length === 0) {
        return Promise.reject({status: 404, msg: `${column} not found`});
      } else return true;
    })
}

module.exports = {convertTimestampToDate, createRef, formatData, replaceArticleTitleWithId, checkExists};