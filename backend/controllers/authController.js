const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, phone });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json(req.user);
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    // Always respond 200 to avoid email enumeration
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

    const rawToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:#1B5E20;padding:28px 24px;text-align:center;">
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr>
                <td style="font-size:26px;line-height:1;padding-right:8px;">&#127955;</td>
                <td style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;line-height:1;">
                  Pitch<span style="color:#FCD34D;">Up</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px 28px;">
            <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#111827;">Reset your password</h2>
            <p style="color:#6B7280;font-size:14px;line-height:1.7;margin:0 0 28px;">
              Hi <strong style="color:#111827;">${user.name}</strong>, we received a request to reset your PitchUp password.
              Click the button below &mdash; this link expires in <strong style="color:#111827;">15 minutes</strong>.
            </p>

            <!-- Button -->
            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#2E7D32;border-radius:12px;">
                  <a href="${resetUrl}"
                    style="display:inline-block;background:#2E7D32;color:#ffffff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.2px;">
                    &#128274;&nbsp; Reset Password
                  </a>
                </td>
              </tr>
            </table>

            <!-- Fallback link -->
            <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0 0 8px;">
              Button not working? Copy and paste this link into your browser:
            </p>
            <p style="margin:0 0 24px;word-break:break-all;">
              <a href="${resetUrl}" style="color:#2E7D32;font-size:12px;">${resetUrl}</a>
            </p>

            <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0;">
              If you didn&apos;t request this, you can safely ignore this email. This link will expire in 15 minutes.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:16px 32px;border-top:1px solid #F3F4F6;text-align:center;">
            <p style="color:#D1D5DB;font-size:11px;margin:0;">
              &copy; 2025 PitchUp &mdash; Book your game, own the field.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await sendEmail(user.email, 'Reset your PitchUp password', html);
    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

// PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' });

    if (!req.body.password || req.body.password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({
      message: 'Password reset successful.',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ message: err.message });
  }
};
