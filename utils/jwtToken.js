import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, message, res) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Always use secure + sameSite=None so the cookie works cross-origin on HTTPS.
  // Both the storefront (Vercel) and the admin dashboard (Vercel) are on different
  // origins from the API (Render), so SameSite must be "None" and Secure must be
  // true — otherwise the browser silently drops the cookie on every response.
  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
      sameSite: "None",
      secure: true,
    })
    .json({
      success: true,
      user,
      message,
    });
};
