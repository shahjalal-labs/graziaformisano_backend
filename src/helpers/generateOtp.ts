const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export default generateOTP;

export const generateRefferCode = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "F"; 

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
};
