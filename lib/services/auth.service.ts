import User from '@/models/user.model';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongo';

export const Login = async (body: { username: string, password: string
}) => {
	await dbConnect();
	const username = body.username
		.toLowerCase()
		.replace('+84', '0')
		.replace(/\s+/g, '');

	const user = await User.findOne({
		$or: [{ email: username }, { phone: username }],
	}).select('+password');

	if (!user) {
		throw new Error('Invalid credentials');
	}
	const isValid = await user.validPassword(body.password);
	if (!isValid) {
		throw new Error('Invalid credentials');
	}

	const token = jwt.sign(
		{
			userId: user._id,
			email: user.email,
			phone: user.phone,
		},
		process.env.JWT_SECRET || 'fallback_secret',
		{ expiresIn: '30d' }
	);

	return token;
};
export const changePasswordFromToken = async (
	token: string,
	currentPassword: string,
	newPassword: string
) => {
	// 1. Giải mã token
	const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

	// 2. Lấy user từ DB (CẦN password)
	const user = await User.findById(payload.userId).select('+password');

	if (!user) {
		throw new Error('User không tồn tại');
	}

	// 3. Kiểm tra mật khẩu hiện tại
	const isCurrentValid = await user.validPassword(currentPassword);
	if (!isCurrentValid) {
		throw new Error('Mật khẩu hiện tại không đúng');
	}

	// 4. KIỂM TRA TRÙNG MẬT KHẨU (ĐOẠN BẠN HỎI)
	const isSameAsOld = await user.validPassword(newPassword);
	if (isSameAsOld) {
		throw new Error('Mật khẩu mới không được trùng mật khẩu cũ');
	}

	// 5. Lưu mật khẩu mới
	await user.setPassword(newPassword);
	await user.save();

	return true;
};
/* =========================
   GET ME BY USER ID
========================= */
export const getMeById = async (userId: string) => {
	const user = await User.findById(userId)
		.select('-password')
		.lean();

	if (!user) {
		throw new Error('User không tồn tại');
	}

	return user;
};

/* =========================
   UPDATE ME BY USER ID
========================= */
export const updateMeById = async (userId: string, data: any) => {
	const updateFields: any = {};
	const allowedFields = [
		'firstname',
		'lastname',
		'email',
		'phone',
		'address',
		'avatar',
		'cover',
	];

	allowedFields.forEach((field) => {
		if (data[field] !== undefined && data[field] !== null) {
			updateFields[field] = data[field];
		}
	});

	const user = await User.findByIdAndUpdate(
		userId,
		{ $set: updateFields },
		{ new: true }
	).select('-password');

	if (!user) {
		throw new Error('User không tồn tại');
	}

	return user;
};

/* =========================
   CHANGE PASSWORD BY USER ID
========================= */
export const changePasswordById = async (
	userId: string,
	currentPassword: string,
	newPassword: string
) => {
	const user = await User.findById(userId).select('+password');
	if (!user) {
		return { success: false, message: 'User không tồn tại' };
	}

	const isCurrentValid = await user.validPassword(currentPassword);
	if (!isCurrentValid) {
		return {
			success: false,
			message: 'Mật khẩu hiện tại không đúng',
		};
	}

	if (newPassword.length < 6 || newPassword.length > 15) {
		return {
			success: false,
			message: 'Mật khẩu phải từ 6 đến 15 ký tự',
		};
	}

	if (/\s/.test(newPassword)) {
		return {
			success: false,
			message: 'Mật khẩu không được chứa khoảng trắng',
		};
	}

	const isSameAsOld = await user.validPassword(newPassword);
	if (isSameAsOld) {
		return {
			success: false,
			message: 'Mật khẩu mới không được trùng mật khẩu cũ',
		};
	}

	await user.setPassword(newPassword);
	await user.save();

	return { success: true };
};