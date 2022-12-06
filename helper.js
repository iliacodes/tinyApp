// Checks to see if the user_id matches within the urlDatabase.
const userURL = function(user_ID, urlDatabase) {
  let results = {}
  const shortURLs = Object.keys(urlDatabase);
  for (let shortURL of shortURLs) {
    const url = urlDatabase[shortURL];
    if(url.userID === user_ID) {
      results[shortURL] = url;
    }
  }
  return results;
};

// Generate a randomized 5 char string.
function generateRandomString() {
  let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ0123456789';
  let result = '';
  let charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

// Find user/userID by providing an email.
const getUsersByEmail = function(users, newUserEmail){
  for (let user in users) {
    if (users[user].email === newUserEmail) {
      const result = users[user];
      return result;
    } 
  } 
  return false;
}


module.exports = {
  generateRandomString,
  getUsersByEmail,
  userURL
};