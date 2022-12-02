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

module.exports = {generateRandomString, getUsersByEmail}