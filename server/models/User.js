const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 40,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ['buyer', 'dealer', 'admin'],
      default: 'buyer',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    verificationTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    ownedAssets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
      },
    ],
  },
  {
    timestamps: true,
  },
)

const purchasedAssetsVirtual = userSchema.virtual('purchasedAssets')

purchasedAssetsVirtual.get(function purchasedAssetsGetter() {
  return this.ownedAssets
})

purchasedAssetsVirtual.set(function purchasedAssetsSetter(value) {
  this.ownedAssets = value
})

userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('User', userSchema)
