module.exports.randomNumberString = (length) => {
  const digits = '0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += digits.charAt(Math.floor(Math.random() * 10));
  }

  return result;
};