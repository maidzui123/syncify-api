import express, { response } from "express";
import { registerSchema } from "../models/UserSchemas.js";
import { verifyCodeSchema } from "../models/CodeSchemas.js";
import authControllers from "../controllers/authControllers.js";
import validate from "../middleware/validate.js";
import authentication from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Register
router.post("/api/register", validate(registerSchema), authControllers.register);
// Verify Code (Register)
router.post("/api/verify-code", validate(verifyCodeSchema), authControllers.verifyCode);
// Resend Code (Register)
router.post("/api/resend-code", authControllers.resendCode);
// Login
router.post("/api/login", authControllers.login);
// Refresh Token
router.post("/api/refresh-token", authControllers.refreshToken);
// Send Code (For Reset Password)
router.post("/api/send-code", authControllers.sendCode);
// Reset password
router.post("/api/reset-password", authentication, authControllers.resetPassword);
// Login with Google
router.post("/api/google-login", authControllers.googleLogin);
// Update profile
router.patch("/api/update-profile", authentication, authControllers.updateProfile);
// Upload image
router.post("/api/upload-file", authentication, upload.single("file"), authControllers.uploadFile);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: API liên quan đến xác thực người dùng
 * /api/register:
 *   post:
 *     summary: "Đăng ký người dùng mới"
 *     description: "API cho phép người dùng đăng ký tài khoản mới."
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: "Tên của người dùng"
 *               email:
 *                 type: string
 *                 description: "Địa chỉ email của người dùng"
 *               password:
 *                 type: string
 *                 description: "Mật khẩu của người dùng"
 *     responses:
 *       200:
 *         description: "Đăng ký thành công"
 *       400:
 *         description: "Thông tin không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/verify-code:
 *   post:
 *     summary: "Xác minh mã đăng ký"
 *     description: "API cho phép xác minh mã gửi đến email trong quá trình đăng ký."
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: "Mã xác minh"
 *               email:
 *                 type: string
 *                 description: "Địa chỉ email của người dùng"
 *     responses:
 *       200:
 *         description: "Mã xác minh hợp lệ"
 *       400:
 *         description: "Mã xác minh không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/resend-code:
 *   post:
 *     summary: "Gửi lại mã xác minh"
 *     description: "API cho phép gửi lại mã xác minh đăng ký vào email."
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "Địa chỉ email của người dùng"
 *     responses:
 *       200:
 *         description: "Mã xác minh đã được gửi lại"
 *       400:
 *         description: "Email không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/login:
 *   post:
 *     summary: "Đăng nhập người dùng"
 *     description: "API cho phép người dùng đăng nhập bằng email và mật khẩu."
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "Địa chỉ email của người dùng"
 *               password:
 *                 type: string
 *                 description: "Mật khẩu của người dùng"
 *     responses:
 *       200:
 *         description: "Đăng nhập thành công"
 *       400:
 *         description: "Thông tin đăng nhập không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/refresh-token:
 *   post:
 *     summary: "Làm mới Token"
 *     description: "API cho phép làm mới token khi token cũ hết hạn."
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: "Refresh token của người dùng"
 *     responses:
 *       200:
 *         description: "Làm mới token thành công"
 *       400:
 *         description: "Token không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/send-code:
 *   post:
 *     summary: "Gửi mã để reset mật khẩu"
 *     description: "API cho phép gửi mã để reset mật khẩu của người dùng."
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "Địa chỉ email của người dùng"
 *     responses:
 *       200:
 *         description: "Mã reset đã được gửi"
 *       400:
 *         description: "Email không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/reset-password:
 *   post:
 *     summary: "Reset mật khẩu"
 *     description: "API cho phép người dùng reset mật khẩu của mình."
 *     security:
 *       - bearerAuth: []  # Yêu cầu Bearer token
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: "Mật khẩu mới của người dùng"
 *     responses:
 *       200:
 *         description: "Mật khẩu đã được reset thành công"
 *       400:
 *         description: "Mật khẩu không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/google-login:
 *   post:
 *     summary: "Đăng nhập bằng Google"
 *     description: "API cho phép người dùng đăng nhập bằng Google thông qua accessToken."
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: "Google access token"
 *     responses:
 *       200:
 *         description: "Đăng nhập thành công"
 *       400:
 *         description: "Access token không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/update-profile:
 *   patch:
 *     summary: "Cập nhật hồ sơ người dùng"
 *     description: "API cho phép người dùng cập nhật thông tin hồ sơ của mình."
 *     security:
 *       - bearerAuth: []  # Yêu cầu Bearer token
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 description: "Ảnh đại diện của người dùng"
 *               username:
 *                 type: string
 *                 description: "Tên người dùng"
 *               tag:
 *                 type: string
 *                 description: "Tag của người dùng"
 *               gender:
 *                 type: string
 *                 description: "Giới tính"
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: "Ngày sinh"
 *               country:
 *                 type: string
 *                 description: "Quốc gia"
 *     responses:
 *       200:
 *         description: "Cập nhật hồ sơ thành công"
 *       400:
 *         description: "Dữ liệu không hợp lệ"
 *       500:
 *         description: "Lỗi máy chủ"
 * /api/upload-file:
 *   post:
 *     summary: "Tải lên hình ảnh"
 *     description: "API cho phép người dùng tải lên tệp hình ảnh hoặc video."
 *     security:
 *       - bearerAuth: []  # Yêu cầu Bearer token
 *     tags:
 *      - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Tệp hình ảnh hoặc video"
 *               type:
 *                 type: string
 *                 description: "Loại tệp (image/video)"
 *               folderName:
 *                 type: string
 *                 description: "Tên thư mục nơi lưu tệp"
 *     responses:
 *       200:
 *         description: "Tải lên thành công"
 *       400:
 *         description: "Tệp không hợp lệ hoặc thiếu"
 *       500:
 *         description: "Lỗi máy chủ"
 */
export default router;