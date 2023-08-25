// to hash a password
// function hashPassword(password) {
//     const hash = crypto.createHash('sha256');
//     hash.update(password);
//     return hash.digest('hex');
//   }


// //while creating a new user, hash the password
//   const newUser = {
//     username: Username,
//     password: hashPassword(password), // Hash the password before storing
//     // other user properties
//   };


//   usersData.users.push(newUser);
// // Save the updated usersData to the file 
// fs.writeFileSync('users.json', JSON.stringify(usersData, null, 2));