function generateRandomString() {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ0123456789';
  let result = '';
  let charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

const getUsersByEmail = function(users, newUserEmail){
  for (let user in users) {
    if (users[user].email === newUserEmail) {
      const result = users[user]
      return result;
    } 
  } 
  return false;
}

const userURL = function(user_ID) {
  let results = {}
  const userIDs = Object.keys(urlDatabase);
  for (let user of userIDs) {
    const url = urlDatabase[user];
    if(url.userID === user_ID) {
      results[user] = url;
    }
  }
  return results;
}

module.exports = {generateRandomString, getUsersByEmail, userURL}